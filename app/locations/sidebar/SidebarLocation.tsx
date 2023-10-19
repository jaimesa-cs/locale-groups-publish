"use client";

import AuthorizeButton from "@/app/components/AuthorizeButton";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import ReferencesManagement from "./ReferencesManagement";
import RequireOAuthToken from "@/app/components/oauth/RequireOAuthToken";
import useAuth from "@/app/hooks/oauth/useAuth";

const SidebarLocation = () => {
  const { isValid, canRefresh } = useAuth();
  return (
    <MarketplaceAppProvider>
      <RequireOAuthToken>
        {isValid ? <ReferencesManagement /> : <AuthorizeButton />}
      </RequireOAuthToken>
    </MarketplaceAppProvider>
  );
};

export default SidebarLocation;
