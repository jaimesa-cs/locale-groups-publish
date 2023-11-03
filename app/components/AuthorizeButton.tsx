"use client";

import { Button } from "@contentstack/venus-components";
import { EXCHANGE_CODE_URL } from "../hooks/oauth/constants";
import { KeyValueObj } from "../types";
import React from "react";
import axios from "../utils/axios";
import { baseAppUrlSelector } from "../utils/oauth-utils";
import getContentstackOAuthUrl from "../hooks/useContentstackOAuth";
import { has } from "lodash";
import pkceChallenge from "pkce-challenge";
import { showError } from "../utils/notifications";
import useAuth from "../hooks/oauth/useAuth";
import useRegion from "../hooks/useRegion";
import { windowProps } from "../hooks/useContentstackOAuth";

const AuthorizeButton = () => {
  const { region, regionReady } = useRegion();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!region || !regionReady) return;
    const receiveAuthToken = (event: MessageEvent) => {
      if (event?.data?.message === "access_denied") {
        showError(event.data.message);
      }
      if (!has(event?.data, "location")) {
        return;
      }
      const { code } = event?.data;

      axios(EXCHANGE_CODE_URL, {
        method: "POST",
        data: {
          region,
          code,
          code_verifier: localStorage.getItem(`code_verifier_${region}`),
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
  }, [region]);

  const authorizeUser = React.useCallback(() => {
    if (region) {
      let APP_BASE_URL = baseAppUrlSelector(region);
      const code_verifier = pkceChallenge().code_verifier;
      localStorage.setItem(`code_verifier_${region}`, code_verifier);
      const url = getContentstackOAuthUrl(APP_BASE_URL, code_verifier);

      const popup = window.open(url, "User Authentication", windowProps);
      popup?.opener.postMessage(
        { message: "Open window" },
        process.env.NEXT_PUBLIC_CS_LAUNCH_HOST
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

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
