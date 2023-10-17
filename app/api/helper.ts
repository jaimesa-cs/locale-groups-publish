import {
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";

import { DefaultFetchRepeatStrategy } from "../utils/fetch";
import EncryptionService from "./oauth/encryption";
import { NextResponse } from "next/server";
import { SUCCESSFUL_RESPONSES } from "./models";
import { baseApiUrlSelector } from "../utils/oauth-utils";
import { max } from "lodash";

/**
 * The response object for the utils route.
 *
 * @export
 * @interface UtilsResponse
 */
export interface UtilsResponse {
  status: number;
  payload: any;
}

const fetchStrategy = new DefaultFetchRepeatStrategy();
export const ASSET_REGEXP: RegExp =
  /"url":[\s:]+"https:\/\/images.contentstack.io\/v3\/assets\/[a-z0-9]+\/([a-z0-9]+)\//gm;
export const REF_REGEXP: RegExp =
  /"uid":[\s]+"(.*)",[\s]+"_content_type_uid":[\s]+"(.*)"/gm;

/**
 * Handles the response from the Contentstack REST API.
 * @param response
 * @returns
 */
export const doResponse = (response: UtilsResponse) => {
  if (SUCCESSFUL_RESPONSES.includes(response.status)) {
    return NextResponse.json(response.payload);
  } else {
    return new Response(response.payload, { status: response.status });
  }
};

/**
 * Prepares the fetch request to inclulde the Contentstack API key and bearer token.
 * @param headers
 * @returns
 */
export const prepareHeaders = (headers: Headers) => {
  const enableEncryption =
    process.env.NEXT_PUBLIC_CS_OAUTH_ENCRYPTION === "true";
  let newHeaders: Record<string, string> = {};

  newHeaders["Content-Type"] =
    headers.get("content-type") || "application/json";
  newHeaders["api_key"] = headers.get("cs-api-key") || "";
  newHeaders["branch"] = headers.get("branch") || "";
  newHeaders["region"] = headers.get("region") || "";

  const bearer = headers.get("authorization")?.replace("Bearer ", "");

  if (enableEncryption) {
    const encryption = new EncryptionService();
    newHeaders["authorization"] = `Bearer ${encryption.decrypt(bearer || "")}`;
  } else {
    newHeaders["authorization"] = `Bearer ${bearer}`;
  }
  return newHeaders;
};

export const prepareHeaders3 = (headers: Headers) => {
  const logs = process.env.NEXJS_LOGS === "true";

  const iterator = headers.entries();
  let newHeaders: Record<string, string> = {};

  for (const entry of iterator) {
    if (logs) {
      console.log("Header Entry:", entry);
    }
    newHeaders[entry[0]] = entry[1];
  }
  const enableEncryption =
    process.env.NEXT_PUBLIC_CS_OAUTH_ENCRYPTION === "true";

  const bearer = headers.get("authorization")?.replace("Bearer ", "");

  if (enableEncryption) {
    const encryption = new EncryptionService();
    newHeaders["authorization"] = `Bearer ${encryption.decrypt(bearer || "")}`;
  } else {
    newHeaders["authorization"] = `Bearer ${bearer}`;
  }
  if (logs) {
    console.log("HEADERS", newHeaders);
  }
  return newHeaders;
};

/**
 * Gets the reference data for a given entry.
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
export const getLocaleData = async (
  contentTypeUid: string,
  uid: string,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceLocaleData> => {
  const detail = await getLocaleReferenceData(
    contentTypeUid,
    uid,
    locale,
    branch,
    maxDepth,
    currentDepth,
    headers
  );
  const localeData: ReferenceLocaleData = {
    checked: true,
    topLevelEntry: detail,
    locale,
  };
  return localeData;
};

/**
 * Gets the reference data for a given entry on multiple locales.
 * @param contentTypeUid
 * @param uid
 * @param locales
 * @param depth
 * @param headers
 * @returns
 */
export const getReferences = async (
  contentTypeUid: string,
  uid: string,
  locales: string[],
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<UtilsResponse> => {
  try {
    let locale = "n/a";
    let payload: ReferenceLocaleData[] = [];
    for (let i = 0; i < locales.length; i++) {
      locale = locales[i];
      const localeData = await getLocaleData(
        contentTypeUid,
        uid,
        locale,
        branch,
        maxDepth,
        currentDepth,
        headers
      );
      payload.push(localeData);
    }

    return {
      payload: payload.reverse(),
      status: 200,
    };
  } catch (e) {
    return {
      payload: `Something went wrong fetching the data: '${contentTypeUid} :: ${uid} :: ${locales}]', Error: ${e}`,
      status: 500,
    };
  }
};

//Util Methods

/**
 * Gets the reference data for a given entry recursively.
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param references
 * @param depth
 * @param headers
 * @returns
 */
const getLocaleReferenceData = async (
  contentTypeUid: string,
  uid: string,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceDetailLite> => {
  const uniqueKey = `${uid}_${locale}`;

  //Check the reference has not yet been processed, and if so, return it.

  //Otherwise get new references
  const theEntry = await getEntry(contentTypeUid, uid, locale, branch, headers);

  const entryAsString = JSON.stringify(theEntry, null, 2);
  const e = await getRegexEntryReferences(
    entryAsString,
    locale,
    branch,
    maxDepth,
    currentDepth,
    headers,
    []
  );
  const a = await getRegexAssetReferences(
    entryAsString,
    locale,
    branch,
    maxDepth,
    currentDepth,
    headers
  );
  return {
    uniqueKey: uniqueKey,
    uid: uid,
    isAsset: false,
    content_type_uid: contentTypeUid,
    title: theEntry.title,
    references: [...e, ...a],
    checked: true,
    version: theEntry._version,
  };
};

/**
 * Gets the reference data for a given entry using a regex.
 * Such regex is used to find all the entry references in the entry json.
 *
 * @param entryAsString
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
const getRegexEntryReferences = async (
  entryAsString: any,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>,
  allRefs: ReferenceDetailLite[]
): Promise<ReferenceDetailLite[]> => {
  const references: ReferenceDetailLite[] = [];
  const refs: ReferenceDetailLite[] =
    allRefs && allRefs.length > 0 ? [...allRefs] : [];

  const refMatches: any = entryAsString.matchAll(REF_REGEXP);
  const groupedMatches: any = {};
  for (const rMatch of refMatches) {
    const refUid = rMatch[1] as string;
    const refCtUid = rMatch[2] as string;
    if (!groupedMatches[refCtUid]) {
      groupedMatches[refCtUid] = [];
    }
    if (groupedMatches[refCtUid].indexOf(refUid) === -1) {
      groupedMatches[refCtUid].push(refUid);
    }
  }
  const keys = Object.keys(groupedMatches);

  for (let i = 0; i < keys.length; i++) {
    const refCtUid = keys[i];
    const refUids = groupedMatches[refCtUid];

    const entryRefs = await getEntriesDetail(
      refCtUid,
      refUids,
      locale,
      branch,
      maxDepth,
      currentDepth,
      headers,
      refs
    );

    if (entryRefs && entryRefs.length > 0) {
      //Update the memo with the new references
      allRefs.push(...entryRefs.filter((r) => !refs.includes(r)));
      references.push(...entryRefs.filter((r) => !refs.includes(r)));
    }
  }
  return references;
};

/**
 * Gets the reference data for a given entry using a regex.
 * Such regex is used to find all the asset references in the entry json.
 *
 * @param entryAsString
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
const getRegexAssetReferences = async (
  entryAsString: string,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceDetailLite[]> => {
  const assetMatches: any = entryAsString.matchAll(ASSET_REGEXP);
  const assetUids: string[] = [];
  for (const aMatch of assetMatches) {
    assetUids.push(aMatch[1] as string);
  }
  const refs = await getAssetReference(
    assetUids,
    locale,
    branch,
    maxDepth,
    currentDepth,
    headers
  );

  return refs === null ? [] : refs;
};

/**
 * Gets an asset data.
 * @param uid
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
const getAssetReference = async (
  uid: string[],
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceDetailLite[] | null> => {
  try {
    const baseUrl = baseApiUrlSelector(headers.region);
    const response = await fetchStrategy.executeRequest(
      `${baseUrl}/v3/assets?query={"uid": {"$in":[${uid.map(
        (u) => `"${u}"`
      )}]}}`,
      {
        method: "GET",
        headers: {
          ...headers,
          branch,
        },
      }
    );
    const data = await response.json();

    const result: ReferenceDetailLite[] = [];
    data.assets.forEach((a: any) => {
      result.push({
        uniqueKey: `${a.uid}_${locale}`,
        uid: a.uid,
        isAsset: true,
        content_type_uid: "asset",
        title: a.title,
        references: [],
        checked: true,
        version: a._version,
      });
    });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Gets the entry detail for a given content type and entry uid.
 * It recursively gets the references for the entry.
 *
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param depth
 * @param headers
 * @param allRefs
 * @returns
 */
const getEntriesDetail = async (
  contentTypeUid: string,
  uid: string[],
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>,
  allRefs: ReferenceDetailLite[]
): Promise<ReferenceDetailLite[]> => {
  try {
    const baseUrl = baseApiUrlSelector(headers.region);
    const response = await fetchStrategy.executeRequest(
      `${baseUrl}/v3/content_types/${contentTypeUid}/entries?locale=${locale}&query={"uid": {"$in":[${uid.map(
        (u) => `"${u}"`
      )}]}}`,
      {
        method: "GET",
        headers: {
          ...headers,
          branch,
        },
      }
    );
    const data = await response.json();

    const rr: ReferenceDetailLite[] =
      allRefs && allRefs.length > 0 ? [...allRefs] : [];

    for (let i = 0; i < data.entries.length; i++) {
      const e = data.entries[i];
      const entryAsString = JSON.stringify(e, null, 2);
      const uniqueKey = `${e.uid}_${locale}`;

      const found = allRefs.find(
        (r) =>
          r.uniqueKey === uniqueKey && r.content_type_uid === contentTypeUid
      );
      let detail: any = {};

      if (found) {
        rr.push(found);
        continue;
      } else {
        detail = {
          uniqueKey: uniqueKey,
          uid: e.uid,
          isAsset: false,
          content_type_uid: contentTypeUid,
          title: e.title,
          references: [],
          checked: true,
          version: e._version,
        };
        rr.push(detail);

        if (currentDepth < maxDepth) {
          currentDepth++;
          const ne = await getRegexEntryReferences(
            entryAsString,
            locale,
            branch,
            maxDepth,
            currentDepth++,
            headers,
            rr
          );
          const na = await getRegexAssetReferences(
            entryAsString,
            locale,
            branch,
            maxDepth,
            currentDepth++,
            headers
          );
          detail.references = [...ne, ...na];
        } else {
          console.log("Max depth reached");
        }
      }
    }
    return rr;
  } catch (e) {
    console.log("Something went wrong while getting entries detail");
    return [];
  }
};

/**
 * Gets an entry data.
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param headers
 * @returns
 */
const getEntry = async (
  contentTypeUid: string,
  uid: string,
  locale: string,
  branch: string,
  headers: Record<string, string>
): Promise<any> => {
  const baseUrl = baseApiUrlSelector(headers.region);
  const response = await fetchStrategy.executeRequest(
    `${baseUrl}/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`,
    {
      method: "GET",
      headers: {
        ...headers,
        branch,
      },
    }
  );
  const data = await response.json();
  return data.entry;
};
