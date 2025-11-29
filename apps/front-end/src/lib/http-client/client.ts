"use client";

import { createHttpClient } from "@common/http-client";

export const httpClient = createHttpClient({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  credentials: "include",
  referrerPolicy: "unsafe-url",
  mode: "cors",
  throwHttpErrors: true,
  // Delay testing
  // interceptors: {
  //   request: [
  //     async req => {
  //       await Promise.resolve(
  //         new Promise(resolve => setTimeout(resolve, 1000)),
  //       );

  //       return req;
  //     },
  //   ],
  // },
});
