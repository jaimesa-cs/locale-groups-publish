"use client";

import { Accordion, Button, Icon, Info } from "@contentstack/venus-components";
import { assetMapper, calculateProgress } from "@/app/utils";
import {
  showErrorDetail,
  showMessage,
  showSuccess,
} from "@/app/utils/notifications";

import Actions from "./Actions";
import AuthorizeButton from "@/app/components/AuthorizeButton";
import Configuration from "./Configuration";
import DefaultLoading from "@/app/components/DefaultLoading";
import ExtensionProvider from "@/app/common/contexts/entrySidebarExtensionContext";
import { KeyValueObj } from "@/app/types";
import React from "react";
import { has } from "lodash";
import { useBranch } from "@/app/hooks/useBranch";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useRefresh from "@/app/hooks/oauth/useRefreshToken";
import useUserSelections from "@/app/hooks/useUserSelections";

const ReferencesManagement = () => {
  const { branch } = useBranch();
  // const { environments, locales } = useUserSelections();
  const { asyncRefresh, isRefreshingToken } = useRefresh();
  const ref = React.useRef(null);
  React.useEffect(() => {
    const iframeWrapperRef = ref.current;
    // @ts-ignore
    window.iframeRef = iframeWrapperRef;
  }, []);

  //Localization Copy
  const [progressTitle, setProgressTitle] = React.useState("");
  const [showProgressBar, setShowProgressBar] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { entry, contentTypeUid, currentLocale } = useEntryChange();
  const [isMasterEntry, setIsMasterEntry] = React.useState(false);

  const {
    getEntryInLocale,
    createEntry,
    updateEntry,
    getEntryLocales,
    isReady,
  } = useCsOAuthApi();
  const [progress, setProgress] = React.useState(0);

  // React.useEffect(() => {
  //   // console.log("Current Locale: ", currentLocale);
  //   // console.log("Locales: ", locales);
  //   if (currentLocale && locales && locales.length > 0) {
  //     // const masterLocale = locales.find((l) => l.fallback_locale === null);

  //     if (masterLocale) {
  //       const isMaster = masterLocale.code === currentLocale;
  //       setIsMasterEntry(isMaster);
  //     }
  //   }
  // }, [locales, currentLocale]);

  return (
    <div ref={ref}>
      <ExtensionProvider>
        {loading || isRefreshingToken ? (
          <DefaultLoading
            title={progressTitle}
            progress={progress}
            showProgressBar={showProgressBar}
          />
        ) : (
          <div>
            {branch?.uid && (
              <Accordion title="Groups" renderExpanded noChevron>
                <div className="pl-2">
                  <Configuration />
                </div>
              </Accordion>
            )}
          </div>
        )}
      </ExtensionProvider>
    </div>
  );
};

export default ReferencesManagement;
