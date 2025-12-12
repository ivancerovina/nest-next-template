# Example Plugin

This is a reference implementation for Frogstep plugins. Use it as a template for creating your own plugins.

## Structure

```
src/
├── client/       # Front-end code (React components, routes)
├── server/       # Back-end code (NestJS modules, controllers)
└── shared/       # Shared code (route definitions, types, schemas)
```

### `client/`

Front-end code that runs in the browser. This is where you define:

- React components
- Client-side routes (React Router)
- Hooks and state management

**Entry point:** `src/client/index.tsx`

```typescript
import { defineClientPlugin } from "@common/plugin-sdk/client";

export default defineClientPlugin({
  routes: [
    {
      path: "example",
      element: <ExamplePage />,
    },
  ],
});
```

### `server/`

Back-end code that runs on Node.js. This is where you define:

- NestJS modules and controllers
- Database migrations
- Services and business logic

**Entry point:** `src/server/index.ts`

```typescript
import { defineServerPlugin, Plugin } from "@common/plugin-sdk/server";

@Plugin({
  controllers: [ExampleController],
  providers: [ExampleService],
  migrations: {
    "20241201_001_init": {
      async up(db) { /* ... */ },
      async down(db) { /* ... */ },
    },
  },
})
class ExamplePluginModule {}

export default defineServerPlugin(ExamplePluginModule);
```

### `shared/`

Code shared between client and server. This is where you define:

- Route definitions (`$route`)
- Shared types and interfaces
- Zod schemas for validation

**Entry point:** `src/shared/index.ts`

```typescript
import { $route } from "@common/plugin-sdk/shared";
import { z } from "zod";

export const getItems = $route({
  path: () => "/example/items",
  body: z.never(),
  query: z.object({ limit: z.number().optional() }),
  data: z.array(z.object({ id: z.string(), name: z.string() })),
  errorCodes: ["ITEMS_NOT_FOUND"],
});
```

## Package Exports

The plugin exposes three entry points via `package.json` exports:

| Export | Path | Environment |
|--------|------|-------------|
| `./client` | `src/client/index.tsx` | Browser only |
| `./server` | `src/server/index.ts` | Node.js only |
| `./shared` | `src/shared/index.ts` | Both |

## Import Rules

### What happens if you import `server` on the client?

**Don't do this.** Server code imports Node.js-specific modules (`@nestjs/common`, `kysely`, etc.) that don't exist in the browser. Your build will fail or crash at runtime.

```typescript
// client/index.tsx
import { something } from "../server"; // WRONG - will break the build
```

### What happens if you import `client` on the server?

**Don't do this.** Client code imports React and browser APIs that don't exist in Node.js.

```typescript
// server/index.ts
import { something } from "../client"; // WRONG - will break the build
```

### Safe imports

```typescript
// From client/ - import shared/ only
import { getItems } from "../shared";

// From server/ - import shared/ only
import { getItems } from "../shared";

// From external packages - use the exports
import { getItems } from "@frogstep/example-plugin/shared"; // Safe everywhere
```

## Using Route Definitions

Routes defined in `shared/` can be used on both sides:

**Server (controller):**
```typescript
import { getItems } from "../shared";

@Controller()
export class ItemsController {
  @Get(getItems.path())
  async getAll(@Query() query: z.infer<typeof getItems.query>) {
    // Validate and handle request
  }
}
```

**Client (API call):**
```typescript
import { getItems } from "@frogstep/example-plugin/shared";
import { http } from "@common/http-client";

const items = await http.call(getItems, { query: { limit: 10 } });
//    ^? Typed as { id: string; name: string }[]
```

## Migrations

Database migrations are defined in the `@Plugin` decorator:

```typescript
@Plugin({
  migrations: {
    "20241201_001_create_items_table": {
      async up(db) {
        await db.schema
          .createTable("items")
          .addColumn("id", "uuid", (col) => col.primaryKey())
          .addColumn("name", "varchar(255)", (col) => col.notNull())
          .execute();
      },
      async down(db) {
        await db.schema.dropTable("items").execute();
      },
    },
  },
})
```

**Naming convention:** `YYYYMMDD_NNN_description` (e.g., `20241201_001_create_items_table`)

## Development

Plugins are automatically discovered when:

1. Located in the `plugins/` directory, OR
2. Installed via npm and listed in the app's dependencies

The plugin must have a `frogstep` field in `package.json`:

```json
{
  "frogstep": {
    "displayName": "Example Plugin"
  }
}
```
