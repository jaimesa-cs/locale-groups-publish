"use client";

import { DefaultAxiosStrategy, RepeatStrategy } from "@/app/utils/axios";
import {
  ILog,
  OPERATIONS,
  ReferenceLocaleData,
} from "@/app/components/sidebar/models/models";

import { useEntryChange } from "@/app/hooks/useEntryChange";
import { useState } from "react";

export interface SidebarExtensionContext {}

const INIT_SIDEBAR_CONTEXT: SidebarExtensionContext = {};

const useEntrySidebarExtensionContext = (
  initial: SidebarExtensionContext = INIT_SIDEBAR_CONTEXT
) => {
  // State --------------------------------------------
  const { loadingEntry, contentTypeUid, showWarning, canRefresh } =
    useEntryChange();
  const [operation, setOperation] = useState<OPERATIONS>(OPERATIONS.NONE);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(
    undefined
  );
  const [data, setData] = useState<ReferenceLocaleData[]>([]);
  const [log, setLog] = useState<ILog[]>([]);

  return {
    data,
    setData,
    operation,
    setOperation,
    contentTypeUid,
    log,
    setLog,
    isRefreshingOauth: operation === OPERATIONS.REFRESHING_OAUTH_TOKEN,
    axiosRepeatStrategy: new DefaultAxiosStrategy() as RepeatStrategy,
    showLog,
    setShowLog,
    showWarning,
    warningMessage,
    setWarningMessage,
    canRefresh,
    addLogInfo: (msg: string) => {
      setLog((prevLog) => [
        ...prevLog,
        {
          type: "info",
          message: msg,
        },
      ]);
    },
    addLogError: (msg: string) => {
      setLog((prevLog) => [
        ...prevLog,
        {
          type: "error",
          message: msg,
        },
      ]);
    },
    addLog: (logInfo: ILog) => {
      setLog((prevLog) => [...prevLog, logInfo]);
    },
    clearLog: () => {
      setLog([]);
    },
    operationInProgress: operation !== OPERATIONS.NONE,
  };
};

export default useEntrySidebarExtensionContext;
