"use client";

import ContentstackAppSDK from "@contentstack/app-sdk";
import React from "react";
import Store from "@contentstack/app-sdk/dist/src/store";
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation";
import { has } from "lodash";

interface UseAppStorageResult<T> {
  value: T | undefined;
  set: (value: Partial<T>) => Promise<void>;
}

const useAppStorage = <T>(key: string): UseAppStorageResult<T> => {
  const [value, setValue] = React.useState<T>({} as T);

  React.useEffect(() => {
    ContentstackAppSDK.init().then((appSdk) => {
      appSdk.store.get(key).then((v) => {
        if (v) {
          // if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
          //   console.log("Value retrieved successfully: ", key, v);
          // }
          setValue(v);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    value,
    set: async (v: Partial<T>) => {
      ContentstackAppSDK.init().then((appSdk) => {
        appSdk.store.set(key, v).then(() => {
          if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
            console.log("Value stored successfully: ", key, v);
          }
          setValue((prev) => {
            return {
              ...prev,
              ...v,
            };
          });
        });
      });
    },
  };
};
export default useAppStorage;
