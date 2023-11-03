"use client";

import React from "react";
import { useAppSdk } from "./useAppSdk";

const useRegion = () => {
  const [region, setRegion] = React.useState<string>();

  const appSdk = useAppSdk();

  const [regionReady, setRegionReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (appSdk && appSdk.region) {
      setRegion(() => {
        setRegionReady(true);
        return appSdk.region;
      });
    }
  }, [appSdk, appSdk?.stack]);

  return { region, regionReady };
};

export default useRegion;
