"use client";

import AuthorizeButton from "../../components/AuthorizeButton";
import React from "react";
import useAuth from "../../hooks/oauth/useAuth";

const RequireOAuthToken = ({ children }: { children: React.ReactNode }) => {
  const { isValid, canRefresh, asyncRefresh } = useAuth();

  React.useEffect(() => {
    //Try to refresh token if possible
    if (canRefresh) {
      asyncRefresh(true);
    }
  }, [asyncRefresh, canRefresh]);

  return isValid ? (
    <div>{children}</div>
  ) : canRefresh ? (
    <div className="text-base font-medium text-[#6C5CE7] dark:text-white p-4">
      Refreshing token...
    </div>
  ) : (
    <div className="p-4">
      <AuthorizeButton />
    </div>
  );
};

export default RequireOAuthToken;
