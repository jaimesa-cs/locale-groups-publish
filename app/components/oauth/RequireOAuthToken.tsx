"use client";

import AuthorizeButton from "../../components/AuthorizeButton";
import React from "react";
import useAuth from "../../hooks/oauth/useAuth";
import useRefresh from "../../hooks/oauth/useRefreshToken";

const RequireOAuthToken = ({ children }: { children: React.ReactNode }) => {
  const { isValid, canRefresh } = useAuth();
  const { asyncRefresh, isRefreshingToken } = useRefresh();

  React.useEffect(() => {
    //Try to refresh token if possible
    if (canRefresh) {
      console.log("Token is not valid, trying to refresh");
      asyncRefresh(true);
    }
  }, [asyncRefresh, canRefresh]);

  return isValid ? (
    <div>{children}</div>
  ) : canRefresh && isRefreshingToken ? (
    <div className="text-base font-medium text-[#6C5CE7] dark:text-white p-4">
      Refreshing token...
    </div>
  ) : (
    <AuthorizeButton />
  );
};

export default RequireOAuthToken;
