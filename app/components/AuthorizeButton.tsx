"use client";

import getContentstackOAuthUrl, {
  windowProps,
} from "../hooks/useContentstackOAuth";

import { EXCHANGE_CODE_URL } from "../hooks/oauth/constants";
import { KeyValueObj } from "../types";
import React from "react";
import axios from "../utils/axios";
import { baseAppUrlSelector } from "../utils/oauth-utils";
import dynamic from "next/dynamic";
import { has } from "lodash";
import { showError } from "../utils/notifications";
import useAuth from "../hooks/oauth/useAuth";

type TButton = typeof import("@contentstack/venus-components").Button;
const Button: TButton = dynamic(
  () => import("@contentstack/venus-components").then((mod) => mod.Button),
  {
    ssr: false,
  }
);

const AuthorizeButton = () => {
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const receiveAuthToken = (event: MessageEvent) => {
      if (event?.data?.message === "access_denied") {
        showError(event.data.message);
      }
      if (!has(event?.data, "location")) {
        return;
      }
      const { code } = event?.data;
      const region = sessionStorage.getItem("region") || "NA";
      const key = `code_verifier_${region}`;
      const code_verifier = localStorage.getItem(key);

      axios(EXCHANGE_CODE_URL, {
        method: "POST",
        data: {
          code,
          code_verifier,
        },
      })
        .then((res) => {
          if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
            console.log("Authentication Data: ", res.data);
          }
          setAuth(res.data).then(() => {
            console.log("User authenticated successfully");
            window.location.reload();
          });
        })
        .catch((err) => {
          console.log("Error while autenticating user");
        });
    };
    window.addEventListener("message", receiveAuthToken);
    return () => window.removeEventListener("message", receiveAuthToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React.useEffect(() => {
  //   ContentstackAppSDK.init().then((appSdk) => {
  //     appSdk.store.remove("test");
  //   });
  // }, []);

  const authorizeUser = async () => {
    const region = sessionStorage.getItem("region") || "NA";
    let APP_BASE_URL = baseAppUrlSelector(region);
    const url = await getContentstackOAuthUrl(APP_BASE_URL);
    const popup = window.open(url, "User Authentication", windowProps);
    popup?.opener.postMessage(
      { message: "Open window" },
      process.env.NEXT_PUBLIC_CS_LAUNCH_HOST
    );
  };

  const { setAuth } = useAuth();

  return (
    <div className="">
      <div>
        <Button
          isFullWidth
          buttonType="secondary"
          disabled={loading}
          isLoading={loading}
          loadingColor="#6c5ce7"
          onClick={() => {
            setLoading(true);
            setAuth({} as KeyValueObj).then(() => {
              authorizeUser();
            });
          }}
          icon={`${loading ? "" : "SCIMActiveSmall"}`}
        >
          Authorize
        </Button>
      </div>
    </div>
  );
};

export default AuthorizeButton;
