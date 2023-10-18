"use client";

import ContentstackAppSDK from "@contentstack/app-sdk";
import React from "react";

interface UseAppStorageResult<T> {
  value: T | undefined;
  set: (value: Partial<T>) => Promise<void>;
  isSettingValue: boolean;
}

const useAppStorage = <T>(key: string): UseAppStorageResult<T> => {
  const [value, setValue] = React.useState<T>({} as T);
  const [isSettingValue, setIsSettingValue] = React.useState<boolean>(false);

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
    isSettingValue,
    set: async (v: Partial<T>) => {
      setIsSettingValue(true);
      ContentstackAppSDK.init().then((appSdk) => {
        appSdk.store.set(key, v).then(() => {
          if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
            console.log("Value stored successfully: ", key, v);
          }
          setValue((prev) => {
            setIsSettingValue(false);
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
