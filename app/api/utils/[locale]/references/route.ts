import { doResponse, getLocaleData, prepareHeaders } from "@/app/api/helper";

import { NextRequest } from "next/server";
import { baseApiUrlSelector } from "@/app/utils/oauth-utils";

/**
 * Handles the POST request to get the reference data for a locale.
 *
 * @export
 * @param {NextRequest} request
 * @param {{ params: { locale: string } }} context
 * @return {*}
 */
export async function POST(
  request: NextRequest,
  context: { params: { locale: string } }
) {
  const body = await request.json();
  const { contentTypeUid, uid, depth } = body;
  const branch = request.headers.get("branch") || "unknown";

  try {
    const localeData = await getLocaleData(
      contentTypeUid,
      uid,
      context.params.locale,
      branch,
      depth || 5,
      1,
      prepareHeaders(request.headers)
    );
    return doResponse({
      status: 200,
      payload: localeData,
    });
  } catch (e) {
    return {
      payload: `Something went wrong fetching the data: '${contentTypeUid} :: ${uid} :: ${context.params.locale}]', Error: ${e}`,
      status: 500,
      details: e,
    };
  }
}
