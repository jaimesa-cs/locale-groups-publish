import React, { Key } from "react";

import { KeyValueObj } from "@/app/types";
import { REFRESH_TOKEN_URL } from "./constants";
import { TOKEN_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import axios from "../../utils/axios";
import useAuth from "./useAuth";

export default function useRefresh() {
  const { auth, setAuth, isValid, canRefresh } = useAuth();
  const [isRefreshingToken, setIsRefreshingToken] = React.useState(false);

  const asyncRefresh = React.useCallback(
    (force?: boolean) => {
      if (canRefresh || force) {
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
                setIsRefreshingToken(false);
              });
            } else {
              setAuth(response.data).then(() => {
                setIsRefreshingToken(false);
              });
            }
          })
          .catch((err) => {
            console.log("asyncRefreshErr", err);
            setAuth({} as KeyValueObj).then(() => {
              setIsRefreshingToken(false);
            });
          });
      } else {
        setIsRefreshingToken(false);
      }
    },
    [auth, canRefresh, setAuth]
  );

  const syncRefresh = React.useCallback(async () => {
    if (canRefresh) {
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

  return {
    asyncRefresh,
    syncRefresh,
    isRefreshingToken,
    needsRefreshing: auth && auth.refresh_token && !isValid,
  };
}
