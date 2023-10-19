import { get, isEmpty, keys } from "lodash";

import React from "react";
import { useAppSdk } from "./useAppSdk";

export const useBranch = (): { branch: any; branchReady: boolean } => {
  const appSdk = useAppSdk();
  const [branch, setBranch] = React.useState<any>(null);
  const [branchReady, setBranchReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (appSdk?.stack.getCurrentBranch()) {
      // console.log("Branch found", appSdk?.stack.getCurrentBranch());
      setBranch(appSdk?.stack.getCurrentBranch());
      setBranchReady(true);
    } else {
      console.warn("No branch found");
    }
  }, [appSdk?.stack]);

  return { branch, branchReady };
};
