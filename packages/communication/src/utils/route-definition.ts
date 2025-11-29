import { z } from "zod";

/**
 * Base HTTP error codes that are automatically included in all route definitions.
 * These represent common HTTP error scenarios that any endpoint might return, excluding BAD_REQUEST for validation errors.
 * @see {BAD_REQUEST_CODE}
 */
const BASE_ERROR_CODES = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "METHOD_NOT_ALLOWED",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
  "NOT_IMPLEMENTED",
  "SERVICE_UNAVAILABLE",
] as const;

/**
 * Special error code for validation errors, handled separately to support
 * the `issues` field for detailed validation feedback.
 * @see {BASE_ERROR_CODES}
 */
const BAD_REQUEST_CODE = "BAD_REQUEST" as const;

/**
 * Schema for validation issues returned with BAD_REQUEST errors.
 * Each issue contains a path (field name) and a human-readable message.
 */
export const badRequestIssuesSchema = z.array(
  z.object({
    path: z.string().min(1).max(255),
    message: z.string().min(1).max(255),
  }),
);

// biome-ignore lint/suspicious/noExplicitAny: Required for generic path function signature - the actual parameter types are inferred from usage
type ParamFunc = (...args: any[]) => string;

/**
 * Parameters for defining a route with full type safety.
 *
 * @template P - Path function type that generates the URL
 * @template B - Request body type
 * @template Q - Query parameters type
 * @template D - Success response data type
 * @template E - Custom error codes specific to this route
 */
type TRouteDefinitionParams<P extends ParamFunc, B, Q, D, E extends string> = {
  /** Function that generates the route path, accepting dynamic parameters */
  path: P;

  /** Zod schema for validating request body */
  body: z.ZodType<B>;

  /** Zod schema for validating query parameters */
  query: z.ZodType<Q>;

  /** Zod schema for the success response data */
  data: z.ZodType<D>;

  /** Array of custom error codes this route may return (in addition to base codes) */
  errorCodes: readonly E[];
};

/**
 * Creates a type-safe route definition with request/response schemas.
 *
 * This function generates Zod schemas for validating requests and responses,
 * providing consistent typing across front-end and back-end.
 *
 * @template P - Path function type
 * @template B - Request body type
 * @template Q - Query parameters type
 * @template D - Success response data type
 * @template E - Custom error codes
 *
 * @param params - Route definition parameters
 * @returns Route definition object with path and validation schemas
 *
 * @example
 * ```ts
 * const getUserRoute = $route({
 *   path: (id: string) => `/users/${id}`,
 *   body: z.object({}),
 *   query: z.object({ include: z.string().optional() }),
 *   data: z.object({ id: z.string(), name: z.string() }),
 *   errorCodes: ["USER_NOT_FOUND", "USER_SUSPENDED"],
 * });
 * ```
 */
export function $route<P extends ParamFunc, B, Q, D, E extends string>(
  params: TRouteDefinitionParams<P, B, Q, D, E>,
) {
  const { path, body, data, query, errorCodes } = params;

  /** Schema for error messages, limited to 255 characters */
  const errorMessageSchema = z.string().min(1).max(255);

  /** Combined schema for all non-BAD_REQUEST error codes (custom + base) */
  const errorCodesWithoutBadRequestSchema = z.enum([
    ...errorCodes,
    ...BASE_ERROR_CODES,
  ]);

  /** Schema for successful responses */
  const success = z.object({
    success: z.literal(true),
    data,
  });

  /** Schema for error responses, with special handling for BAD_REQUEST validation errors */
  const error = z.object({
    success: z.literal(false),
    error: z.union([
      z.object({
        code: z.literal(BAD_REQUEST_CODE),
        message: errorMessageSchema,
        issues: badRequestIssuesSchema.optional(),
      }),
      z.object({
        code: errorCodesWithoutBadRequestSchema,
        message: errorMessageSchema,
      }),
    ]),
  });

  /** Combined schema for all possible responses (success or error) */
  const raw = z.union([success, error]);

  return {
    /** Path function for generating route URLs with parameters */
    path,

    /** Response schemas for validation */
    response: {
      /** Full response schema (success | error) */
      raw,

      /** Success data schema only */
      data,

      /** Error response schema only */
      error,
    },
    /** Request body schema */
    body,

    /** Query parameters schema */
    query,
  } as const;
}
