# @common/http-client

A lightweight, type-safe fetch wrapper with Zod schema validation and interceptor support.

## Installation

```bash
pnpm add @common/http-client
```

## Usage

### Creating a Client

```typescript
import { createHttpClient } from "@common/http-client";

const httpClient = createHttpClient({
  baseUrl: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  throwHttpErrors: true,
});
```

### Making Requests

```typescript
// GET request
const response = await httpClient.get("/users");
const users = await response.json();

// POST request
await httpClient.post("/users", { name: "John", email: "john@example.com" });

// PUT request
await httpClient.put("/users/1", { name: "John Updated" });

// PATCH request
await httpClient.patch("/users/1", { name: "John Patched" });

// DELETE request
await httpClient.delete("/users/1");
```

### Query Parameters

```typescript
const response = await httpClient.get("/users", {
  params: {
    page: 1,
    limit: 10,
    active: true,
  },
});
// Results in: /api/users?page=1&limit=10&active=true
```

### Response Validation with Zod

The `json()` method accepts an optional Zod schema for runtime validation:

```typescript
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const response = await httpClient.get("/users/1");

// With schema validation (recommended)
const user = await response.json(userSchema);
// user is typed as { id: string; name: string; email: string }
// Throws ZodError if validation fails

// Without schema (returns unknown)
const data = await response.json();

// With type assertion only (no runtime validation)
const user = await response.json<User>();
```

If you prefer to use raw types, you can do that as well:

```typescript
import type { User } from "../types";

const response = await httpClient.get("/users/1");
const user = await response.json<User>();
```

### Error Handling

When `throwHttpErrors: true` is set, non-2xx responses throw an `HttpError`:

```typescript
import { HttpError } from "@common/http-client";

try {
  await httpClient.get("/not-found");
} catch (error) {
  if (error instanceof HttpError) {
    console.log(error.response.status); // 404
    const body = await error.response.json();
  }
}
```

Custom status code validation:

```typescript
const httpClient = createHttpClient({
  baseUrl: "/api",
  throwHttpErrors: true,
  validateStatusCode: (code) => code >= 200 && code < 400, // Accept 3xx as valid
});
```

### Interceptors

Add request and response interceptors to modify requests/responses globally:

```typescript
// Request interceptor (e.g., add auth token)
const removeInterceptor = httpClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  },
);

// Response interceptor (e.g., refresh token on 401)
httpClient.interceptors.response.use(async (response) => {
  if (response.status === 401) {
    await refreshToken();
    // Retry logic here
  }
  return response;
});

// Remove an interceptor
removeInterceptor();
```

## Configuration Options (Basic fetch options)

| Option               | Type                        | Description                            |
| -------------------- | --------------------------- | -------------------------------------- |
| `baseUrl`            | `string`                    | Base URL prepended to all requests     |
| `headers`            | `HeadersInit`               | Default headers for all requests       |
| `throwHttpErrors`    | `boolean`                   | Throw `HttpError` on non-2xx responses |
| `validateStatusCode` | `(code: number) => boolean` | Custom status code validator           |
| `credentials`        | `RequestCredentials`        | Fetch credentials option               |
| `cache`              | `RequestCache`              | Fetch cache option                     |
| `mode`               | `RequestMode`               | Fetch mode option                      |
| `redirect`           | `RequestRedirect`           | Fetch redirect option                  |
| `signal`             | `AbortSignal`               | AbortController signal                 |
| `keepalive`          | `boolean`                   | Fetch keepalive option                 |
| `priority`           | `RequestPriority`           | Fetch priority option                  |
| `interceptors`       | `object`                    | Request/response interceptors          |

## API Reference

### `createHttpClient(config)`

Creates a new HTTP client instance.

Returns an object with:

- `get(url, options?)` - GET request
- `post(url, body?, options?)` - POST request
- `put(url, body?, options?)` - PUT request
- `patch(url, body?, options?)` - PATCH request
- `delete(url, options?)` - DELETE request
- `interceptors.request.use(fn)` - Add request interceptor
- `interceptors.response.use(fn)` - Add response interceptor

### `HttpError`

Error class thrown when `throwHttpErrors` is enabled and response status is not valid.

Properties:

- `response` - The original response object
- `message` - Error message in format `HTTP error {status}`
