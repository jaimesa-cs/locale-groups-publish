import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { API_HOST } from "../hooks/oauth/constants";

export default axios.create({
  baseURL: API_HOST,
});

export interface RepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;
  axiosInstance: AxiosInstance;
  executeRequest: (url: string, config?: AxiosRequestConfig) => Promise<any>;
}

export const DefaultAxiosStrategy = class implements RepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;
  axiosInstance: AxiosInstance;
  apiHost: string = API_HOST;
  ready: boolean = false;

  constructor() {
    this.attempts = 1;
    this.initialDelay = 250;
    this.resolveDelay = (attempt: number) => {
      return this.initialDelay * attempt;
    };
    this.axiosInstance = axios.create({
      baseURL: API_HOST,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  }
  async executeRequest(url: string, config?: AxiosRequestConfig) {
    let response: any = {};
    for (let i = 0; i < this.attempts; i++) {
      try {
        response = await this.axiosInstance(url, {
          ...config,
        });
        break;
      } catch (error: any) {
        //Only throw the error if it's not a 429, otherwise wait and try again.
        if (i === this.attempts - 1 && error?.response?.status !== 429) {
          throw error;
        }
        console.warn("Error executing request, waiting and trying again...");
        await new Promise((resolve) =>
          setTimeout(resolve, this.resolveDelay(i))
        );
      }
    }
    return response;
  }

  setReady(ready: boolean) {
    this.ready = ready;
  }
};
