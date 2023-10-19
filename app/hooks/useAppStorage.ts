"use client";

import ContentstackAppSDK from "@contentstack/app-sdk";
import React from "react";

interface UseAppStorageResult<T> {
  value: T | undefined;
  store: (value: Partial<T>) => Promise<void>;
  storeInProgress: boolean;
  setValue: React.Dispatch<React.SetStateAction<T>>;
}

const useAppStorage = <T>(key: string): UseAppStorageResult<T> => {
  const [value, setValue] = React.useState<T>({} as T);
  const [storeInProgress, setStoreInProgress] = React.useState<boolean>(false);

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
    storeInProgress,
    setValue,
    store: async (v: Partial<T>) => {
      setStoreInProgress(true);
      ContentstackAppSDK.init().then((appSdk) => {
        setValue((prev) => {
          const newValue = {
            ...prev,
            ...v,
          };
          appSdk.store.set(key, newValue).then(() => {
            if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
              console.log("Value stored successfully: ", key, newValue);
            }
            setStoreInProgress(false);
          });
          return newValue;
        });
      });
    },
  };
};
export default useAppStorage;
