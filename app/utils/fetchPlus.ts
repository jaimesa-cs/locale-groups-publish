import { FetchRepeatStrategy } from "./fetch";

const fetchPlus = async (
  infoOrUrl: RequestInfo | URL,
  options = {},
  retries: number,
  currentRetryCount: number = 0
): Promise<any> =>
  fetch(infoOrUrl, options)
    .then(async (res) => {
      console.dir(res, { depth: 5, colors: true });
      if (res.ok) {
        return res.json();
      }
      console.log(`Error fetching data on attempt #${currentRetryCount}...`);
      if (retries > 0) {
        currentRetryCount++;
        console.log("Waiting...", currentRetryCount * 250, "ms");
        await new Promise((resolve) =>
          setTimeout(resolve, currentRetryCount * 250)
        );
        console.log("Retrying...");
        return fetchPlus(infoOrUrl, options, retries - 1, currentRetryCount);
      }
      console.log(await res.json());
      throw new Error("Error fetching data");
    })
    .catch((error) => console.error(error.message));

export const FetchPlusStrategy = class implements FetchRepeatStrategy {
  async executeRequest(infoOrUrl: RequestInfo | URL, config?: RequestInit) {
    return fetchPlus(infoOrUrl, config, 5);
  }
};

export default fetchPlus;
