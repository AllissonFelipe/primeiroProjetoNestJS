/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MyFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}
