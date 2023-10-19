import { DefaultAxiosStrategy, RepeatStrategy } from "@/app/utils/axios";

import React from "react";
import { TOKEN_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import useAuth from "./useAuth";
import { useBranch } from "../useBranch";
import { useEffect } from "react";

interface UseContentstackAxiosResult {
  strategy: RepeatStrategy;
}

const useContentstackAxios = (): UseContentstackAxiosResult => {
  const { branch } = useBranch();
  const { auth, setAuth, syncRefresh } = useAuth();
  const [strategy, setStrategy] = React.useState<RepeatStrategy>(
    new DefaultAxiosStrategy()
  );

  useEffect(() => {
    if (!branch?.api_key || !branch?.uid || !auth?.access_token) return;

    let requestIntercept: number;
    let responseIntercept: number;

    if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
      console.log("Setting interceptors");
    }
    requestIntercept = strategy.axiosInstance.interceptors.request.use(
      (config: any) => {
        if (config && config.headers) {
          config.headers["authorization"] = `Bearer ${auth?.access_token}`;
          config.headers["cs-api-key"] = branch?.api_key || "";
          config.headers["branch"] = branch?.uid || "";
          config.headers["region"] = sessionStorage.getItem("region") || "NA";

          if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
            console.log("Axios Request Intercept :: URL", config.url);
            console.log("Axios Request Intercept :: Headers", config.headers);
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
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const data = await syncRefresh();
          await setAuth(data);
          prevRequest.headers["authorization"] = `Bearer ${data.access_token}`;
          return strategy.executeRequest(prevRequest);
        }
        return Promise.reject(error);
      }
    );
    strategy.setReady(true);

    return () => {
      if (requestIntercept >= 0 && responseIntercept >= 0) {
        if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
          console.log("Removing interceptors");
        }
        strategy.axiosInstance.interceptors.response.eject(responseIntercept);
        strategy.axiosInstance.interceptors.request.eject(requestIntercept);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, branch]);

  return {
    strategy,
  };
};

export default useContentstackAxios;
