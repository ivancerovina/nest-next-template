# Nest-Next Template

A full-stack TypeScript monorepo template featuring NestJS back-end, Next.js front-end, and shared packages for type-safe communication between services.

## Tech Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| **Back-end**  | NestJS 11, Kysely, PostgreSQL, Passport.js |
| **Front-end** | Next.js 16, React 19, Tailwind CSS 4       |
| **Shared**    | Zod schemas, shadcn/ui components          |
| **Tooling**   | pnpm workspaces, Biome, TypeScript 5       |

## Project Structure

```
├── apps/
│   ├── back-end/          # NestJS API server
│   │   ├── src/
│   │   │   ├── configs/   # Database and app configuration
│   │   │   └── features/  # Feature modules (auth, users)
│   │   ├── libs/          # Internal libraries (database)
│   │   └── migrations/    # Kysely database migrations
│   └── front-end/         # Next.js application
│       └── src/app/       # App Router pages
├── packages/
│   ├── communication/     # Shared Zod schemas and API contracts
│   └── ui/                # Shared React components (shadcn/ui)
├── biome.json             # Linting and formatting configuration
└── pnpm-workspace.yaml    # Workspace configuration
```

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10.24.0
- **PostgreSQL** >= 14

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

### 3. Database Setup

Create your PostgreSQL database and run migrations:

```bash
# Run database migrations
pnpm be:migrate
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (port 3000)
pnpm be:dev

# Terminal 2 - Frontend (port 3001)
pnpm fe:dev
```

## Development

### Available Scripts

#### Root Level

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `pnpm fe:dev`   | Start frontend development server           |
| `pnpm fe:build` | Build frontend for production               |
| `pnpm fe:start` | Start frontend production server            |
| `pnpm be:dev`   | Start backend with hot reload (webpack HMR) |
| `pnpm be:build` | Build backend for production                |
| `pnpm be:start`   | Start backend production server             |
| `pnpm be:migrate` | Run database migrations                     |
| `pnpm ui:add`     | Add new shadcn/ui component                 |

#### Backend (`apps/back-end`)

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `pnpm start:dev`    | Watch mode development         |
| `pnpm start:dev:wp` | Development with webpack HMR   |
| `pnpm start:debug`  | Debug mode with Node inspector |
| `pnpm migrate`      | Run database migrations        |
| `pnpm test`         | Run unit tests                 |
| `pnpm test:watch`   | Run tests in watch mode        |
| `pnpm test:cov`     | Run tests with coverage        |
| `pnpm test:e2e`     | Run end-to-end tests           |

#### Frontend (`apps/front-end`)

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Start development server |
| `pnpm build`  | Build for production     |
| `pnpm start`  | Start production server  |
| `pnpm lint`   | Lint code with Biome     |
| `pnpm format` | Format code with Biome   |

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for the component library. To add new components:

```bash
# From root directory
pnpm ui:add

# Or specify component name
pnpm --filter @project/ui add-component button
```

### Database Migrations

Migrations are managed with Kysely. Migration files are located in `apps/back-end/migrations/`.

```bash
# Run pending migrations
pnpm --filter back-end migrate
```

To create a new migration, add a file in `apps/back-end/migrations/` following the naming convention:
`YYYYMMDDTHHMMSS-description.ts`

## Building for Production

### Backend

```bash
pnpm be:build
pnpm be:start
```

### Frontend

```bash
pnpm fe:build
pnpm fe:start
```

### Full Build

```bash
# Build all packages and apps
pnpm -r build
```

## Environment Variables

### Backend

| Variable       | Description                  | Required |
| -------------- | ---------------------------- | -------- |
| `DATABASE_URL` | PostgreSQL connection string | Yes      |
| `PORT`         | Server port (default: 3000)  | No       |

### Frontend

| Variable              | Description     | Required |
| --------------------- | --------------- | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | No       |

## Architecture

### Shared Packages

#### `@common/communication`

Type-safe API contracts using Zod schemas. Defines request/response types shared between frontend and backend.

```typescript
import { $schema } from "@common/communication";

// Access route definitions
$schema.routes.login; // { method, path, body, query, response }
```

#### `@project/ui`

Shared React component library built on shadcn/ui with Radix UI primitives.

```typescript
import { Button } from "@project/ui";
```

### Backend Architecture

The backend follows NestJS modular architecture:

- **Feature Modules**: Self-contained modules in `src/features/`
- **Database Layer**: Kysely with PostgreSQL in `libs/database/`
- **Authentication**: Passport.js with local strategy

### Frontend Architecture

The frontend uses Next.js App Router with:

- **React 19** with React Compiler for automatic optimizations
- **Tailwind CSS 4** for styling
- **Path aliases**: `@/*` maps to `src/*`

## Testing

### Backend Tests

```bash
# Unit tests
pnpm --filter back-end test

# Watch mode
pnpm --filter back-end test:watch

# Coverage report
pnpm --filter back-end test:cov

# E2E tests
pnpm --filter back-end test:e2e
```

## Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check all files
pnpm biome check .

# Format all files
pnpm biome format . --write

# Lint and fix
pnpm biome lint . --write
```

## Plans

- [ ] Docker for development
- [ ] Docker for production
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Authentication improvements (JWT, OAuth)
- [ ] Testing coverage improvements

## License

MIT
