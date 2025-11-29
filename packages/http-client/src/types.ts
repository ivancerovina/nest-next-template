import type z from "zod";

export type THttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";

export type TBody = BodyInit | object;

type TJsonFetchWrapper<T, S extends z.ZodSchema | undefined = undefined> = (
  schema?: S,
) => Promise<S extends undefined ? T : z.infer<S>>;

export type TBodyIfAllowed<M extends THttpMethod> = M extends
  | "GET"
  | "DELETE"
  | "OPTIONS"
  ? undefined
  : TBody;

type TGenericHttpRequest = THttpRequest<
  THttpMethod,
  TBodyIfAllowed<THttpMethod>
>;
type TGenericHttpResponse = THttpResponse<unknown>;

export type TRequestInterceptor = (
  config: TGenericHttpRequest,
) => Promise<TGenericHttpRequest> | TGenericHttpRequest;

export type TResponseInterceptor = (
  response: TGenericHttpResponse,
) => Promise<TGenericHttpResponse> | TGenericHttpResponse;

export type THttpClientConfig = {
  baseUrl?: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  integrity?: string;
  signal?: AbortSignal;
  keepalive?: boolean;
  priority?: RequestPriority;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  throwHttpErrors?: boolean;
  validateStatusCode?: (code: number) => boolean;
  interceptors?: {
    request?: TRequestInterceptor[];
    response?: TResponseInterceptor[];
  };
};

export type THttpRequest<M extends THttpMethod, B extends TBodyIfAllowed<M>> = {
  url: string;
  method: M;
  body?: B;
  params?: Record<string, string | number | boolean | undefined>;
  requestSchema?: z.ZodSchema;
  responseSchema?: z.ZodSchema;
} & Omit<THttpClientConfig, "interceptors">;

export type THttpResponse<D> = Response & {
  json: TJsonFetchWrapper<D>;
};
