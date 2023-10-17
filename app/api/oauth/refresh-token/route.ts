import EncryptionService, { encryptPayload } from "@/app/api/oauth/encryption";

import { KeyValueObj } from "@/app/types";
import { NextResponse } from "next/server";
import { baseAppUrlSelector } from "@/app/utils/oauth-utils";
import { getUrlEncodedFormData } from "@/app/utils";

const enableEncryption = process.env.NEXT_PUBLIC_CS_OAUTH_ENCRYPTION === "true";

/**
 * Handles the POST request to refresh the token.
 *
 * @export
 * @param {Request} request
 * @return {*}
 */
export async function POST(request: Request) {
  const logs = process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true";

  const encryption = new EncryptionService();
  try {
    let body = await request.json();
    let { refreshToken, region, code_verifier } = body;
    const baseUrl = baseAppUrlSelector(region);
    if (enableEncryption) {
      refreshToken = encryption.decrypt(refreshToken);
    }

    const params: KeyValueObj = {
      grant_type: "refresh_token",
      client_id: process.env.NEXT_PUBLIC_CS_CLIENT_ID || "",
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL || "",
      refresh_token: refreshToken,
      code_verifier: code_verifier,
    };

    const now = Date.now(); //This ensures the expires_at is always correct.
    const response = await fetch(`${baseUrl}/apps-api/apps/token`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: getUrlEncodedFormData(params),
    });
    let data = await response.json();
    const expires_at = now + data.expires_in * 1000;
    if (enableEncryption) {
      data = encryptPayload(data);
      if (logs) {
        console.log("ENCRYPTED DATA", data);
      }
    }

    return NextResponse.json({
      ...data,
      expires_at,
    });
  } catch (e: any) {
    console.log("Error refreshing the token", e);
    return new Response(`Something went wrong refreshing the token, ${e}`, {
      status: 403,
    });
  }
}
