# @common/communication

Shared Zod schemas for type-safe and data-safe communication across the project.

## Why

- Single source of truth for API contracts between front-end and back-end
- Runtime validation with Zod ensures data integrity at boundaries
- Reusable field schemas (e.g., password rules) stay consistent everywhere
- Type inference from schemas eliminates manual type definitions

## Structure

```
src/
  schemas/
    fields/          # Reusable field schemas (password, email, etc.)
    routes/          # API endpoint definitions
  utils/
    route-definition.ts  # $route helper for generating schemas
  constants.ts       # Shared constants
```

## Usage

Import schemas via `$schema`:

```typescript
import { $schema } from "@common/communication";

// Route schemas
$schema.routes.auth.login.body; // Request body schema
$schema.routes.auth.login.query; // Query params schema
$schema.routes.auth.login.response.data; // Success response data schema (note it's only the data)

// Field schemas
$schema.fields.password;
```

## Creating Route Schemas

Use `$route` to define type-safe API endpoints:

```typescript
import z from "zod";
import { $route } from "../../utils/route-definition";

export const getUser = $route({
  path: (id: string) => `/users/${id}`,
  body: z.object({}),
  query: z.object({ include: z.string().optional() }),
  data: z.object({ id: z.uuid(), name: z.string(), email: z.email() }),
  errorCodes: ["USER_NOT_FOUND", "USER_SUSPENDED"],
});
```

Each route definition includes:

| Property     | Description                                                         |
| ------------ | ------------------------------------------------------------------- |
| `path`       | Function returning the endpoint URL (supports dynamic params)       |
| `body`       | Zod schema for request body (`z.object({})` or `z.never()` if none) |
| `query`      | Zod schema for query parameters                                     |
| `data`       | Zod schema for successful response data                             |
| `errorCodes` | Custom error codes specific to this endpoint                        |

Base error codes (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, etc.) are automatically included.

### Route Definition Output

A route definition provides:

```typescript
const route = $schema.routes.auth.login;

route.path(); // "/auth/login" (call with args if path has dynamic params)
route.body; // Request body schema
route.query; // Query params schema
route.response.data; // Success data schema
route.response.error; // Error response schema
route.response.raw; // Full response schema (success | error)
```

For routes with no request body or query params, use `z.never()`:

```typescript
export const logout = $route({
  path: () => "/auth/logout",
  body: z.never(),
  query: z.never(),
  data: z.null(),
  errorCodes: [],
});
```

## Creating Field Schemas

Add reusable field schemas in `src/schemas/fields/`:

```typescript
// src/schemas/fields/username-schema.ts
import z from "zod";

export const username = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  );
```

Export from `src/schemas/fields/index.ts`:

```typescript
export * from "./username-schema";
```

For route schemas, follow the same pattern in `src/schemas/routes/index.ts`:

```typescript
export * as users from "./users";
```

This allows accessing field schemas directly: `$schema.fields.username`
