"use client";

import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import ReferencesManagement from "./ReferencesManagement";
import RequireOAuthToken from "@/app/components/oauth/RequireOAuthToken";

const SidebarLocation = () => {
  return (
    <MarketplaceAppProvider>
      <RequireOAuthToken>
        <ReferencesManagement />
      </RequireOAuthToken>
    </MarketplaceAppProvider>
  );
};

export default SidebarLocation;
