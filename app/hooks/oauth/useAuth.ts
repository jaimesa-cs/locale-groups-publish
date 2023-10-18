"use client";

import { KeyValueObj } from "../../types";
import { TOKEN_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import { has } from "lodash";
import useAppStorage from "../useAppStorage";

export const AUTH_KEY = "csat";

const isValidData = (auth?: KeyValueObj) => {
  if (auth === undefined) return false;
  return (
    has(auth, "access_token") &&
    has(auth, "refresh_token") &&
    has(auth, "expires_at")
  );
};
const isValid = (auth?: KeyValueObj) => {
  return isValidData(auth) && Date.now() < new Date(auth?.expires_at).getTime();
};

const isExpired = (auth?: KeyValueObj) => {
  return isValidData(auth) && Date.now() > new Date(auth?.expires_at).getTime();
};

const canRefresh = (auth?: KeyValueObj) => {
  return isValidData(auth) && isExpired(auth);
};

const useAuth = () => {
  const {
    value: auth,
    set: setAuth,
    isSettingValue,
  } = useAppStorage<KeyValueObj>(TOKEN_STORAGE_KEY);

  const result = {
    auth: (auth as KeyValueObj) || null,
    setAuth,
    isValid: isValid(auth),
    canRefresh: !isSettingValue && canRefresh(auth),
    isSettingValue,
  };

  return result;
};

export default useAuth;
