import Extension from "@contentstack/app-sdk/dist/src/extension";
import { KeyValueObj } from "@/app/types";
import React from "react";
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation";
import { UseReferencesProps } from "@/app/hooks/useReferences";

interface MarketplaceAppContextType extends UseReferencesProps {
  appSdk?: UiLocation;
  appConfig: KeyValueObj | null;
}
export default MarketplaceAppContextType;

/**
 * Context to store the app state.
 */
export const MarketplaceAppContext =
  React.createContext<MarketplaceAppContextType>({
    appSdk: undefined,
    appConfig: null,
    data: [],
    locales: [],
    setData: () => {},
    checkedLocales: {},
    checkedReferences: {},
    openReferences: {},
    setCheckedReferences: () => {},
    setCheckedLocales: () => {},
    setOpenReferences: () => {},
    totalReferenceCount: 0,
  });
