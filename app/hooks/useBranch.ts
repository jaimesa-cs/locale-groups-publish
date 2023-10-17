import { get, isEmpty, keys } from "lodash";

import React from "react";
import { useAppSdk } from "./useAppSdk";

export const useBranch = (): { branch: any } => {
  const appSdk = useAppSdk();
  const [branch, setBranch] = React.useState<any>(null);

  React.useEffect(() => {
    if (appSdk?.stack.getCurrentBranch()) {
      // console.log("Branch found", appSdk?.stack.getCurrentBranch());
      setBranch(appSdk?.stack.getCurrentBranch());
    } else {
      console.warn("No branch found");
    }
  }, [appSdk?.stack]);

  return { branch };
};
