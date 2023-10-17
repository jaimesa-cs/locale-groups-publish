import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  IEntryReleaseInfo,
  IReference,
  ReferenceLocaleData,
} from "./models/models";

import React from "react";
import { getReleaseInfo } from "@/app/utils/data-utils";
import useContentstackAxios from "@/app/hooks/oauth/useContentstackAxios";

export const MAX_ENTRIES_PER_RELEASE = parseInt(
  process.env.NEXT_PUBLIC_CS_MAX_ENTRIES_PER_RELEASE || "500"
);

export const MAX_ITEMS_AT_ONCE_PER_RELEASE = parseInt(
  process.env.NEXT_PUBLIC_CS_MAX_ITEMS_AT_ONCE_PER_RELEASE || "25"
);

export interface IPublishInstruction {
  entries?: {
    uid: string;
    content_type?: string;
    locale: string;
  }[];
  assets?: { uid: string }[];
  locales?: string[];
  environments?: string[];
}

export interface Release {
  name: string;
  locale: string;
}

export interface IEntryMap {
  [key: string]: IReference[];
}

interface SdkResult {
  axios: (query: string, options?: AxiosRequestConfig) => AxiosPromise;
  createRelease: (
    name: string,
    description: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  getLocales: (options?: AxiosRequestConfig) => AxiosPromise;
  getEnvironments: (options?: AxiosRequestConfig) => AxiosPromise;

  getReferencesByLocale: (
    contentTypeUid: string,
    uid: string,
    locale: string,
    depth: number,
    options?: AxiosRequestConfig
  ) => any;
  getReleases: () => AxiosPromise<Release[]>;
  addToRelease: (
    release: string,
    data: ReferenceLocaleData[],
    checkedReferences: Record<string, Record<string, boolean>>,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  createEntry: (
    contentTypeUid: string,
    entry: any,
    options?: AxiosRequestConfig<any>
  ) => AxiosPromise;
  updateEntry: (
    contentTypeUid: string,
    uid: string,
    entry: any,
    locale: string,
    options?: AxiosRequestConfig<any>
  ) => AxiosPromise;
  getEntryLocales: (
    entryUid: string,
    contentTypeUid: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  getEntryInLocale: (
    entryUid: string,
    contentTypeUid: string,
    locale: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  entryExists: (
    contentTypeUid: string,
    title: string,
    locale: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  isReady: boolean;
}

/**
 * Custom hook that exposes useful methods to interact with the OAuth Contentstack API
 * @param endpoint, the OAuth Contentstack API endpoint
 * @returns
 */
export const useCsOAuthApi = (): SdkResult => {
  const { strategy: axios, isStrategyReady } = useContentstackAxios();
  const [isReady, setIsReady] = React.useState(isStrategyReady);

  React.useEffect(() => {
    setIsReady(isStrategyReady);
  }, [isStrategyReady]);

  return {
    isReady,
    axios: (query: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios.executeRequest(`${query}`, options);
    },
    getLocales: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios.executeRequest(`/v3/locales`, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    },
    getEnvironments: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios.executeRequest(`/v3/environments`, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    },
    getReleases: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios.executeRequest(`/v3/releases`, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    },
    createEntry: (
      contentTypeUid: string,
      entry: any,
      options?: AxiosRequestConfig<any>
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries?locale=${entry.locale}`,
        {
          method: "POST",
          data: { entry: entry },
          headers: {
            ...options?.headers,
          },
          ...options,
        }
      );
    },
    updateEntry: (
      contentTypeUid: string,
      uid: string,
      entry: any,
      locale: string,
      options?: AxiosRequestConfig<any>
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`,
        {
          method: "PUT",
          data: { entry: entry },
          ...options,
          headers: {
            ...options?.headers,
          },
        }
      );
    },
    getEntryLocales: (
      uid: string,
      contentTypeUid: string,
      options?: AxiosRequestConfig
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries/${uid}/locales`,
        {
          ...options,
          headers: {
            ...options?.headers,
          },
        }
      );
    },
    getEntryInLocale: (
      uid: string,
      contentTypeUid: string,
      locale: string,
      options?: AxiosRequestConfig
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`,
        {
          ...options,
          headers: {
            ...options?.headers,
          },
        }
      );
    },
    getReferencesByLocale: (
      contentTypeUid: string,
      uid: string,
      locale: string,
      depth: number,
      options?: AxiosRequestConfig
    ): AxiosPromise<IReference[]> => {
      return axios.executeRequest(`/utils/${locale}/references`, {
        method: "POST",
        data: {
          contentTypeUid,
          uid,
          depth,
        },
        ...options,
      });
    },
    createRelease: async (
      name: string,
      description: string,
      options?: AxiosRequestConfig
    ): Promise<any> => {
      return axios.executeRequest(`/v3/releases`, {
        method: "POST",
        data: {
          release: {
            name,
            description,
            locked: false,
            archived: false,
          },
        },
        ...options,
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
        },
      });
    },
    addToRelease: async (
      release: string,
      data: ReferenceLocaleData[],
      checkedReferences: Record<string, Record<string, boolean>>,
      options?: AxiosRequestConfig
    ): Promise<any> => {
      let releaseInfo: IEntryReleaseInfo[] = getReleaseInfo(
        data,
        checkedReferences
      );

      //We only support the max number of items
      releaseInfo = releaseInfo.splice(0, MAX_ENTRIES_PER_RELEASE);

      while (releaseInfo.length > 0) {
        try {
          const maxItemsAtOnce = releaseInfo.splice(
            0,
            MAX_ITEMS_AT_ONCE_PER_RELEASE
          );
          const data = {
            items: maxItemsAtOnce,
          };

          await axios.executeRequest(`/v3/releases/${release}/items`, {
            method: "POST",
            data: data,
            headers: {
              ...options?.headers,
            },
          });
        } catch (e) {
          console.log("Error adding items to release", e);
        }
      }

      return releaseInfo;
    },
    entryExists: async (
      contentTypeUid: string,
      title: string,
      locale: string,
      options?: AxiosRequestConfig
    ) => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries?query={"title":"${title}"}&locale=${locale}`,
        {
          ...options,
          method: "GET",
          headers: {
            ...options?.headers,
          },
        }
      );
    },
  };
};
