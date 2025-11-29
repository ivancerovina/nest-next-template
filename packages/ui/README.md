# @common/ui

Shared UI components built with [shadcn/ui](https://ui.shadcn.com/).

## Why

- Centralizes UI components in monorepos with multiple front-ends
- Automatically generates exports when adding a component (no manual index.ts updates)

## Adding Components

To add a new shadcn component, run one of the following:

```bash
# From the packages/ui directory
pnpm add-component <component-name>

# From the workspace root
pnpm ui:add <component-name>
```

Example:

```bash
pnpm ui:add dialog
pnpm ui:add dropdown-menu button
```

## Usage

Import components from `@common/ui`:

```typescript
import { Button } from "@common/ui";
```
