# Frogstep V2

Full-stack TypeScript monorepo with an extensible plugin architecture for building business applications.

## Tech Stack

| Layer           | Technology                                               |
| --------------- | -------------------------------------------------------- |
| Runtime         | Node.js >= 22                                            |
| Package Manager | pnpm 10.x with workspaces                                |
| Back-end        | NestJS 11, Kysely ORM, PostgreSQL, Redis                 |
| Front-end       | React 19, Vite (rolldown), TailwindCSS 4, React Router 7 |
| Validation      | Zod 4                                                    |
| State           | Jotai (client), TanStack Query (server state)            |
| Auth            | Passport.js, express-session, Argon2                     |
| Linting         | Biome 2.2                                                |

## Quick Commands

```bash
# Development
pnpm fe:dev              # Start front-end dev server
pnpm be:dev              # Start back-end (watch mode)
pnpm be:dev:wp           # Start back-end with HMR (webpack)

# Quality
pnpm lint                # Run Biome linter
pnpm be:test             # Run back-end tests

# Build
pnpm fe:build            # Build front-end
pnpm be:build            # Build back-end
```

## Plugin SDK

Three export paths:

- `@common/plugin-sdk/client` - React integration (routes, sidebar items)
- `@common/plugin-sdk/server` - NestJS integration (modules, decorators)
- `@common/plugin-sdk/shared` - Type-safe route definitions

---

## Type-Safe API Pattern

### Define Route (shared)

```typescript
import { $route } from "@common/plugin-sdk/shared";
import { z } from "zod";

export const getUser = $route({
  path: (id: string) => `/users/${id}`,
  body: z.never(),
  query: z.object({ include: z.string().optional() }),
  data: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
  }),
  errorCodes: ["USER_NOT_FOUND"],
});
```

### Use in Controller (server)

Controllers return the data directly (not wrapped). The `ResponseInterceptor` automatically wraps it in `{ success: true, data }`. Errors thrown are caught by `ErrorFilter` and formatted as `{ success: false, error: { code, message } }`.

```typescript
import { Controller, Get, Param } from "@nestjs/common";
import { ValidateResponse, ZodValidationPipe } from "@common/plugin-sdk/server";
import { getUser } from "../shared/schema/routes/users";

@Controller("users")
export class UsersController {
  @Get(":id")
  @ValidateResponse(getUser.response.raw)
  async findOne(@Param("id") id: string) {
    // Return data directly - will be wrapped as { success: true, data: {...} }
    return { id, name: "John", email: "john@example.com" };
  }
}
```

### Use in Client (React)

```typescript
import { httpClient } from "@/lib/http-client";
import { getUser } from "@frogstep/my-plugin/shared";

const response = await httpClient.get(getUser.path(userId));
const data = await response.json(getUser.response.raw);

if (data.success) {
  console.log(data.data.name); // Fully typed
} else {
  console.log(data.error.code); // "USER_NOT_FOUND" | base errors
}
```

---

## Creating a Plugin

### 1. Package Setup

```json
// plugins/my-plugin/package.json
{
  "name": "@frogstep/my-plugin",
  "exports": {
    "./client": "./src/client/index.tsx",
    "./server": { "node": "./src/server/index.ts", "browser": null },
    "./shared": "./src/shared/index.ts"
  },
  "frogstep": {
    "displayName": "My Plugin"
  }
}
```

### 2. Server Module

```typescript
import { defineServerPlugin, Plugin } from "@common/plugin-sdk/server";
import { MyController } from "./my.controller";
import { MyService } from "./my.service";

@Plugin({
  controllers: [MyController],
  providers: [MyService],
  migrations: {
    m_001_initial: myInitialMigration,
  },
})
class MyPluginModule {}

export default defineServerPlugin(MyPluginModule);
```

### 3. Client Definition

```typescript
import { defineClientPlugin } from "@common/plugin-sdk/client";
import { Settings } from "lucide-react";
import { MyPage } from "./pages/my-page";

export default defineClientPlugin({
  routes: [
    { path: "my-plugin", element: <MyPage /> },
  ],
  sidebarItems: [
    { label: "My Plugin", Icon: Settings, to: "/hub/my-plugin" },
  ],
});
```

### 4. Shared Schemas

```typescript
// plugins/my-plugin/src/shared/index.ts
export * from "./schema/routes";
```

---

## Database

### Kysely Integration

Inject the database service:

```typescript
import { Injectable } from "@nestjs/common";
import { InjectKysely, Database } from "@common/plugin-sdk/server";
import { Kysely } from "kysely";

@Injectable()
export class MyService {
  constructor(@InjectKysely() private readonly db: Kysely<Database>) {}

  async findAll() {
    return this.db.selectFrom("core.employee").selectAll().execute();
  }
}
```

### Migrations

Migrations are defined in separate files under `migrations/` folder with a barrel export:

```
src/server/
├── migrations/
│   ├── index.ts                        # Barrel export
│   └── m_1234567890123_create_items.ts # Migration file
└── index.ts
```

**Naming convention:** `m_<timestamp>_<description>.ts` - prefix `m_` followed by timestamp ensures execution order.

```typescript
// migrations/m_1234567890123_create_items.ts
import type { Kysely, Migration } from "kysely";

export const m_1234567890123_create_items: Migration = {
  async up(db: Kysely<unknown>) {
    await db.schema.createSchema("my_plugin").ifNotExists().execute();
    await db.schema
      .createTable("my_plugin.items")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("name", "varchar(255)", (col) => col.notNull())
      .execute();
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable("my_plugin.items").ifExists().execute();
    await db.schema.dropSchema("my_plugin").ifExists().execute();
  },
};
```

```typescript
// migrations/index.ts
export * from "./m_1234567890123_create_items";
```

```typescript
// index.ts
import * as migrations from "./migrations";

@Plugin({
  // ...other properties,
  migrations,
})
```

### Core Tables

- `core.employee` - User accounts (id, username, email, password_hash, is_admin, etc.)
- `core.permission` - Permission definitions (id, code, title, description)
- `core.employee_permission` - Many-to-many junction table

---

## Authentication & Authorization

### Session Data

```typescript
// Available in request.session.user
interface SessionData {
  user: { id: string };
}
```

### Guards

```typescript
import { UseGuards } from "@nestjs/common";
import {
  AuthenticatedGuard,
  RequiresPermission,
} from "@common/plugin-sdk/server";

@Controller("items")
@UseGuards(AuthenticatedGuard) // Require login
export class ItemsController {
  @Post()
  @RequiresPermission("items.create") // Require specific permission
  create() {}
}
```

---

## Response Format

Controllers return data directly. Global interceptors handle wrapping:

- `ResponseInterceptor` - Wraps successful responses in `{ success: true, data }`
- `ErrorFilter` - Catches errors and formats as `{ success: false, error: { code, message } }`

### Success

```json
{
  "success": true,
  "data": {
    /* controller return value */
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Validation Error (BAD_REQUEST)

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "issues": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Base Error Codes

All routes include: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `CONFLICT`, `INTERNAL_SERVER_ERROR`, `NOT_IMPLEMENTED`, `SERVICE_UNAVAILABLE`

---

## UI Components

Import from `@common/ui`:

```typescript
import { Button, Card, Input, Field, FieldLabel, FieldError } from "@common/ui";
import { SidebarProvider, Sidebar, SidebarContent } from "@common/ui";
```

Add new shadcn components:

```bash
pnpm -w ui:add [one or more components]
```

Afterwards, change all imports starting with `@` to relative imports for added components.

---

## Code Style

### Biome Configuration

- Formatter: 2-space indentation
- Linter: Recommended rules + import organization
- Unsafe parameter decorators enabled for NestJS

### Path Aliases

- Back-end: `@/core/*` → `libs/core/src/*`
- Front-end: `@/*` → `src/*`

### Naming Conventions

- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Routes: Define with `$route()`, export from `shared/schema/routes/`
- Entities: Kysely interfaces in `*.entity.ts`

---

## Testing

```bash
pnpm be:test          # Unit tests
pnpm be:test:watch    # Watch mode
pnpm be:test:cov      # Coverage
pnpm be:test:e2e      # End-to-end tests
```

Test files: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)

---

## Docker

```bash
docker compose up -d   # Start PostgreSQL + Redis (development)
docker compose -f docker-compose.prod.yml up -d  # Production
```
