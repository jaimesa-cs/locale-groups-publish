import React, { useEffect, useState } from "react";

import { AppFailed } from "../../components/AppFailed";
import ContentstackAppSDK from "@contentstack/app-sdk";
import { KeyValueObj } from "@/app/types";
import { MarketplaceAppContext } from "../contexts/marketplaceContext";
import { ReferenceLocaleData } from "@/app/components/sidebar/models/models";
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation";
import { isNull } from "lodash";
import { useReferences } from "@/app/hooks/useReferences";

type ProviderProps = {
  children?: React.ReactNode;
};

/**
 * Marketplace App Provider
 * @param children: React.ReactNode
 */
export const MarketplaceAppProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [failed, setFailed] = useState<boolean>(false);
  const [appSdk, setAppSdk] = useState<UiLocation>();
  const [appConfig, setConfig] = useState<KeyValueObj | null>(null);
  const [data, setData] = React.useState<ReferenceLocaleData[]>([]);
  const {
    locales,
    checkedLocales,
    checkedReferences,
    openReferences,
    totalReferenceCount,
    setCheckedLocales,
    setCheckedReferences,
    setOpenReferences,
  } = useReferences({ data });

  // Initialize the SDK and track analytics event
  useEffect(() => {
    ContentstackAppSDK.init()
      .then(async (appSdk) => {
        // console.log("App SDK initialized", appSdk);
        setAppSdk(appSdk);
        const appConfig = await appSdk.getConfig();
        setConfig(appConfig);
      })
      .catch(() => {
        setFailed(true);
      });
  }, []);

  // wait until the SDK is initialized. This will ensure the values are set
  // correctly for appSdk.
  if (!failed && (isNull(appSdk) || isNull(appConfig))) {
    return (
      <div className="text-base font-medium text-[#6C5CE7] dark:text-white p-4">
        Loading App...
      </div>
    );
  }

  if (failed) {
    return <AppFailed />;
  }

  return (
    <MarketplaceAppContext.Provider
      value={{
        data,
        locales,
        setData,
        appSdk,
        appConfig,
        checkedLocales,
        checkedReferences,
        openReferences,
        totalReferenceCount,
        setCheckedLocales,
        setCheckedReferences,
        setOpenReferences,
      }}
    >
      {children}
    </MarketplaceAppContext.Provider>
  );
};
