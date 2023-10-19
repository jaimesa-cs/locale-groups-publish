"use client";

import Configuration from "./Configuration";
import DefaultLoading from "@/app/components/DefaultLoading";
import ExtensionProvider from "@/app/common/contexts/entrySidebarExtensionContext";
import React from "react";
import { useBranch } from "@/app/hooks/useBranch";

const ReferencesManagement = () => {
  const { branch, branchReady } = useBranch();
  const ref = React.useRef(null);
  React.useEffect(() => {
    const iframeWrapperRef = ref.current;
    // @ts-ignore
    window.iframeRef = iframeWrapperRef;
  }, []);

  //Localization Copy

  const [loading] = React.useState(false);

  const [progress] = React.useState(0);

  return (
    <div ref={ref}>
      <ExtensionProvider>
        {!branchReady ? (
          <DefaultLoading title="Loading..." />
        ) : (
          <div>
            {branch?.uid && (
              <div className="pl-2">
                <Configuration />
              </div>
            )}
          </div>
        )}
      </ExtensionProvider>
    </div>
  );
};

export default ReferencesManagement;
