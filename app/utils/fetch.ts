export interface FetchRepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;
  executeRequest: (
    infoOrUrl: RequestInfo | URL,
    config?: RequestInit
  ) => Promise<Response | undefined>;
}

export const DefaultFetchRepeatStrategy = class implements FetchRepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;

  constructor() {
    this.attempts = 3;
    this.initialDelay = 100;
    this.resolveDelay = (attempt: number) => {
      return this.initialDelay * attempt;
    };
  }
  async executeRequest(infoOrUrl: RequestInfo | URL, config?: RequestInit) {
    let url = infoOrUrl.toString().toLowerCase();
    let response;
    for (let i = 0; i < this.attempts; i++) {
      try {
        response = await fetch(url, {
          ...config,
        });
        break;
      } catch (error: any) {
        //Only throw the error if it's not a 429, otherwise wait and try again.
        if (i === this.attempts - 1 && error?.response?.status !== 429) {
          return error;
        }
        console.warn("Error executing request, waiting and trying again...");
        console.dir(error, { depth: 5, colors: true });
        await new Promise((resolve) =>
          setTimeout(resolve, this.resolveDelay(i))
        );
      }
    }
    return response;
  }
};
