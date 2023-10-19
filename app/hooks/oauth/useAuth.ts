"use client";

import { KeyValueObj } from "../../types";
import { REFRESH_TOKEN_URL } from "./constants";
import React from "react";
import { TOKEN_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import axios from "@/app/utils/axios";
import { has } from "lodash";
import useAppStorage from "../useAppStorage";

export const AUTH_KEY = "csat";

const useAuth = () => {
  const {
    value: auth,
    store: setAuth,
    storeInProgress,
  } = useAppStorage<KeyValueObj>(TOKEN_STORAGE_KEY);

  const [isRefreshingToken, setIsRefreshingToken] = React.useState(false);

  const isValidData = React.useCallback(() => {
    if (auth === undefined) return false;
    return (
      has(auth, "access_token") &&
      has(auth, "refresh_token") &&
      has(auth, "expires_at")
    );
  }, [auth]);

  const isValid = React.useCallback(() => {
    return isValidData() && Date.now() < new Date(auth?.expires_at).getTime();
  }, [auth]);

  const isExpired = React.useCallback(() => {
    return isValidData() && Date.now() > new Date(auth?.expires_at).getTime();
  }, []);

  const canRefresh = React.useCallback(() => {
    return isValidData() && isExpired();
  }, [auth]);
  const asyncRefresh = React.useCallback(
    (force?: boolean) => {
      if ((!storeInProgress && canRefresh()) || force) {
        setIsRefreshingToken(true);
        const region = sessionStorage.getItem("region") || "NA";
        const key = `code_verifier_${region}`;
        const code_verifier = localStorage.getItem(key);
        axios
          .post(REFRESH_TOKEN_URL, {
            refreshToken: auth?.refresh_token,
            code_verifier,
          })
          .then((response) => {
            console.log("asyncRefresh", response.data);
            if (response.data.statusCode && response.data.statusCode !== 200) {
              setAuth({} as KeyValueObj).then(() => {
                window.location.reload();
              }).catch;
            } else {
              setAuth(response.data).then(() => {
                setIsRefreshingToken(false);
              });
            }
          })
          .catch((err) => {
            console.log("asyncRefreshErr", err);
            setIsRefreshingToken(false);
            setAuth({} as KeyValueObj).then(() => {});
          })
          .finally(() => {});
      } else {
        setIsRefreshingToken(false);
      }
    },
    [auth, canRefresh, setAuth]
  );

  const syncRefresh = React.useCallback(async () => {
    if (!storeInProgress && canRefresh()) {
      try {
        setIsRefreshingToken(true);
        const region = sessionStorage.getItem("region") || "NA";
        const key = `code_verifier_${region}`;
        const code_verifier = localStorage.getItem(key);
        const response = await axios.post(REFRESH_TOKEN_URL, {
          refreshToken: auth?.refresh_token,
          code_verifier,
        });
        setIsRefreshingToken(false);
        return response.data;
      } catch (err) {
        return undefined;
      }
    } else {
      return undefined;
    }
  }, [auth?.refresh_token, canRefresh]);

  const result = {
    auth,
    setAuth,
    isValid: isValid(),
    canRefresh: !storeInProgress && canRefresh(),
    asyncRefresh,
    syncRefresh,
  };

  return result;
};

export default useAuth;
