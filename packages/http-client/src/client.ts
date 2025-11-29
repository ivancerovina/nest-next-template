import type z from "zod";
import { HttpError } from "./http-error";
import type {
  TBody,
  TBodyIfAllowed,
  THttpClientConfig,
  THttpMethod,
  THttpRequest,
  TRequestInterceptor,
  TResponseInterceptor,
} from "./types";
import {
  isPlainObject,
  joinUrl,
  mergeHeaders,
  validateStatusCode,
} from "./utils";

export function createHttpClient(config: THttpClientConfig) {
  async function request<M extends THttpMethod, B extends TBodyIfAllowed<M>>(
    request: THttpRequest<M, B>,
  ) {
    const headers = config.headers
      ? mergeHeaders(config.headers ?? {}, request.headers ?? {})
      : {};

    const baseUrl = joinUrl(request.baseUrl ?? config.baseUrl, request.url);

    const url = new URL(baseUrl, window.location.origin);
    if (request.params) {
      Object.entries(request.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    let requestConfig: THttpRequest<M, B> = {
      ...config,
      ...request,
      headers,
      url: url.toString(),
    };

    // Apply request interceptors
    if (config.interceptors?.request) {
      for (const interceptor of config.interceptors.request) {
        requestConfig = (await interceptor(requestConfig)) as THttpRequest<
          M,
          B
        >;
      }
    }

    if (requestConfig.body && isPlainObject(requestConfig.body)) {
      requestConfig.body = JSON.stringify(requestConfig.body) as B;
    }

    let rawResp = await fetch(requestConfig.url, requestConfig as RequestInit);

    // Apply response interceptors
    if (config.interceptors?.response) {
      for (const interceptor of config.interceptors.response) {
        rawResp = await interceptor(rawResp);
      }
    }

    /**
     * Parses the response body as JSON and optionally validates it against a Zod schema.
     *
     * @param schema - Optional Zod schema to validate the JSON response against
     * @returns Parsed JSON data, validated against the schema if provided
     * @throws {ZodError} If schema validation fails
     * @throws {SyntaxError} If JSON parsing fails
     *
     * @example
     * // Without schema (returns unknown type)
     * const data = await response.json();
     *
     * @example
     * // With type declaration (no runtime validation)
     * interface User { id: string; name: string; }
     * const user = await response.json<User>();
     * // user is typed as User but NOT validated at runtime
     *
     * @example
     * // With schema validation (runtime validation + type safety)
     * const userSchema = z.object({ id: z.string(), name: z.string() });
     * const user = await response.json(userSchema);
     * // user is typed as { id: string, name: string } AND validated
     */
    async function jsonWrapper<
      T,
      S extends z.ZodSchema | undefined = undefined,
    >(schema?: S): Promise<S extends undefined ? T : z.infer<S>> {
      const data = await rawResp.json();

      if (schema) {
        return (await schema.parseAsync(data)) as S extends undefined
          ? T
          : z.infer<S>;
      }

      return data as S extends undefined ? T : z.infer<S>;
    }

    const resp = { ...rawResp, json: jsonWrapper };

    if (requestConfig.throwHttpErrors) {
      const validator = requestConfig.validateStatusCode || validateStatusCode;

      if (resp.status && !validator(resp.status)) {
        throw new HttpError(resp);
      }
    }

    return resp;
  }

  async function get(
    url: string,
    options?: Omit<THttpRequest<"GET", never>, "url" | "method" | "body">,
  ) {
    return request<"GET", never>({
      ...options,
      url,
      method: "GET",
    } as THttpRequest<"GET", never>);
  }

  async function post<B extends TBody>(
    url: string,
    body?: B,
    options?: Omit<
      THttpRequest<"POST", B>,
      "url" | "method" | "body" | "params"
    >,
  ) {
    return request<"POST", B>({
      ...options,
      url,
      method: "POST",
      body,
    } as THttpRequest<"POST", B>);
  }

  async function patch<B extends TBody>(
    url: string,
    body?: B,
    options?: Omit<
      THttpRequest<"PATCH", B>,
      "url" | "method" | "body" | "params"
    >,
  ) {
    return request<"PATCH", B>({
      ...options,
      url,
      method: "PATCH",
      body,
    } as THttpRequest<"PATCH", B>);
  }

  async function put<B extends TBody>(
    url: string,
    body?: B,
    options?: Omit<
      THttpRequest<"PUT", B>,
      "url" | "method" | "body" | "params"
    >,
  ) {
    return request<"PUT", B>({
      ...options,
      url,
      method: "PUT",
      body,
    } as THttpRequest<"PUT", B>);
  }

  async function del(
    url: string,
    options?: Omit<
      THttpRequest<"DELETE", never>,
      "url" | "method" | "body" | "params"
    >,
  ) {
    return request<"DELETE", never>({
      ...options,
      url,
      method: "DELETE",
    } as THttpRequest<"DELETE", never>);
  }

  // Methods to manage interceptors
  function addRequestInterceptor(interceptor: TRequestInterceptor) {
    if (!config.interceptors) {
      config.interceptors = {};
    }

    if (!config.interceptors.request) {
      config.interceptors.request = [];
    }

    config.interceptors.request.push(interceptor);

    return () => {
      const index = config.interceptors?.request?.indexOf(interceptor);
      if (index !== undefined && index > -1) {
        config.interceptors?.request?.splice(index, 1);
      }
    };
  }

  function addResponseInterceptor(interceptor: TResponseInterceptor) {
    if (!config.interceptors) {
      config.interceptors = {};
    }

    if (!config.interceptors.response) {
      config.interceptors.response = [];
    }

    config.interceptors.response.push(interceptor);

    return () => {
      const index = config.interceptors?.response?.indexOf(interceptor);
      if (index !== undefined && index > -1) {
        config.interceptors?.response?.splice(index, 1);
      }
    };
  }

  return Object.assign(request, {
    get,
    post,
    patch,
    put,
    delete: del,
    interceptors: {
      request: {
        use: addRequestInterceptor,
      },
      response: {
        use: addResponseInterceptor,
      },
    },
  });
}
