import type { THttpResponse } from "./types";

export class HttpError<D = unknown> extends Error {
  constructor(public readonly response: THttpResponse<D>) {
    super(`HTTP error ${response.status}`);
    this.name = "HttpError";
  }
}
