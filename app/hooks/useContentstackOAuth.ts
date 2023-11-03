"use client";

const getContentstackOAuthUrl = (baseUrl: string, codeVerifier: string) => {
  return `${baseUrl}#!/apps/${process.env.NEXT_PUBLIC_APPLICATION_ID}/authorize?response_type=${RESPONSE_TYPE}&client_id=${process.env.NEXT_PUBLIC_CS_CLIENT_ID}&auto_select_organization=true&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URL}&code_challenge_method=plain&code_challenge=${codeVerifier}`;
};

export const RESPONSE_TYPE = "code";

export const windowProps = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=1200, height=800`;

export default getContentstackOAuthUrl;
