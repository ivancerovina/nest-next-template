# @project/front-end

Next.js 16 front-end application with React 19, Tailwind CSS, and next-intl for localization.

## Development

```bash
pnpm dev
```

## Structure

```
src/
  app/[locale]/     # App router pages with locale prefix
  i18n/             # Localization config (next-intl)
  lib/http-client/  # HTTP client setup (client/server)
  types/            # TypeScript type definitions
messages/           # Translation files (en-US.json)
```

## Internal Dependencies

- `@common/communication` - Shared Zod schemas
- `@common/ui` - Shared UI components
- `@common/http-client` - HTTP client utilities

You can find more information about these dependencies in the [common](../common) directory.
