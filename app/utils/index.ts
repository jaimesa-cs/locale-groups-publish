import { get, has, set } from "lodash";

import { KeyValueObj } from "../types";
import { ReferenceDetailLite } from "../components/sidebar/models/models";

const mergeObjects = (target: any, source: any) => {
  // Iterate through `source` properties and if an `Object` then
  // set property to merge of `target` and `source` properties
  Object.keys(source)?.forEach((key) => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeObjects(target[key], source[key]));
    }
  });

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};

const utils = {
  mergeObjects,
};

export const parseJSON = <T>(value: string | null): T => {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });
    return undefined as T;
  }
};
export const sleep = (ms: number) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, ms)
  );
};

export const getUrlEncodedFormData = (params: KeyValueObj) => {
  const formBody = [];
  for (var property in params) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(params[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  return formBody.join("&");
};

export const cleanLocalStorageItem = (item: string) => {
  return item.replaceAll('"', "");
};

// export const countReferences = <T extends ReferenceDetailLite>(
//   arr: T[],
//   checkedReferences: Record<string, boolean>
// ): number => {
//   return arr.reduce((acc, curr: T) => {
//     return (
//       acc +
//       (curr.references && checkedReferences && checkedReferences[curr.uniqueKey]
//         ? 1
//         : 0) +
//       countReferences(curr.references ?? [], checkedReferences)
//     );
//   }, 0);
// };

export const getUniqueReferenceKeys = (
  arr: ReferenceDetailLite[],
  currentList: string[],
  checkedReferences: Record<string, boolean>
): string[] => {
  currentList = currentList || [];
  currentList.push(
    ...arr
      .filter((r) => checkedReferences && checkedReferences[r.uniqueKey])
      .map((a) => a.uniqueKey)
  );

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].references) {
      currentList = getUniqueReferenceKeys(
        arr[i].references,
        currentList,
        checkedReferences
      );
    }
  }
  return currentList.filter((v, i, a) => a.indexOf(v) === i);
};

export const flatten = ({
  uniqueKey,
  references = [],
}: ReferenceDetailLite): string[] => {
  return [uniqueKey].concat(...references.map(flatten));
};

export const genericFlatten = <T extends KeyValueObj>(
  propToKeep: string,
  childrenPropName: string,
  obj: T
): string[] => {
  return [obj[propToKeep]].concat(
    ...(obj[childrenPropName] || []).map(flatten)
  );
};

export const flattenEntry = (entry: any) => {
  var result: any = {};
  function recurse(cur: any, propPath: any) {
    if (Object(cur) !== cur) {
      result[propPath] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], propPath + "[" + i + "]");
      if (l == 0) result[propPath] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], propPath ? propPath + "." + p : p);
      }
      if (isEmpty && propPath) result[propPath] = {};
    }
  }
  recurse(entry, "");
  return result;
};

export const assetMapper = (entry: any) => {
  const ASSET_CHECKER = ".content_type";
  const flat = flattenEntry(entry);
  for (const [key, value] of Object.entries(flat)) {
    if (key.includes(ASSET_CHECKER)) {
      if (has(entry, key)) {
        if (get(entry, key) === value) {
          const path = key.replace(ASSET_CHECKER, "");
          if (path) {
            const assetsObject = get(entry, path);
            if (assetsObject && assetsObject?.url && assetsObject?.filename) {
              set(entry, path, assetsObject.uid);
            }
          }
        }
      }
    }
  }
};

export const calculateProgress = (current: number, total: number) => {
  const newProgress = current + 100 / total;
  return newProgress > 100 ? 100 : newProgress;
};

export default utils;
