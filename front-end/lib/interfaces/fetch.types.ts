/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MyFetchOptions extends RequestInit {
  token?: string;
  skipRefresh?: boolean;
}
