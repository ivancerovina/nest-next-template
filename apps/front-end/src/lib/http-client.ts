import { createHttpClient } from "@common/http-client";

const ENABLE_ARTIFICAL_DELAY = true;

export const httpClient = createHttpClient({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  interceptors: {
    request: [
      async (request) => {
        if (ENABLE_ARTIFICAL_DELAY) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }

        return request;
      },
    ],
  },
});
