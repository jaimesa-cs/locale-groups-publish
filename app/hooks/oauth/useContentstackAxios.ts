import { DefaultAxiosStrategy, RepeatStrategy } from "@/app/utils/axios";

import React from "react";
import { TOKEN_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import useAuth from "./useAuth";
import { useBranch } from "../useBranch";
import { useEffect } from "react";
import useRefresh from "./useRefreshToken";

const strategy = new DefaultAxiosStrategy();

interface UseContentstackAxiosResult {
  strategy: RepeatStrategy;
  isStrategyReady: boolean;
}

const useContentstackAxios = (): UseContentstackAxiosResult => {
  const { branch } = useBranch();
  const { auth, setAuth } = useAuth();
  const { syncRefresh } = useRefresh();
  const [isStrategyReady, setIsStrategyReady] = React.useState(false);

  useEffect(() => {
    let requestIntercept: number;
    let responseIntercept: number;

    if (auth?.access_token && branch?.api_key && branch?.uid) {
      setIsStrategyReady(() => {
        strategy.setReady(true);

        requestIntercept = strategy.axiosInstance.interceptors.request.use(
          (config: any) => {
            if (config && config.headers) {
              config.headers["authorization"] = `Bearer ${auth?.access_token}`;
              config.headers["cs-api-key"] = branch?.api_key || "";
              config.headers["branch"] = branch?.uid || "";
              config.headers["region"] =
                sessionStorage.getItem("region") || "NA";

              if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
                console.log("Axios Request Intercept", config.headers);
              }
            }
            return config;
          },
          (error: any) => Promise.reject(error)
        );

        responseIntercept = strategy.axiosInstance.interceptors.response.use(
          (response: any) => {
            return response;
          },
          async (error: any) => {
            // const prevRequest = error?.config;
            // if (error?.response?.status === 403 && !prevRequest?.sent) {
            //   prevRequest.sent = true;
            //   const data = await syncRefresh();
            //   await setAuth(data);
            //   prevRequest.headers[
            //     "authorization"
            //   ] = `Bearer ${data.access_token}`;
            //   return strategy.executeRequest(prevRequest);
            // }
            return Promise.reject(error);
          }
        );

        return true;
      });

      return () => {
        if (requestIntercept >= 0 && responseIntercept >= 0) {
          strategy.axiosInstance.interceptors.response.eject(responseIntercept);
          strategy.axiosInstance.interceptors.request.eject(requestIntercept);
        }
      };
    }
  }, [auth, setAuth, syncRefresh, branch]);

  return {
    strategy,
    isStrategyReady,
  };
};

export default useContentstackAxios;
