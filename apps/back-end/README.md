# @project/back-end

NestJS API server with Kysely for type-safe database queries.

## Development

```bash
pnpm start:dev
```

## Structure

```
src/
  configs/        # Configuration (database, etc.)
  entities/       # Database entity models
  features/       # Feature modules (auth, users)
libs/
  database/       # Kysely database module
```

## Database

Uses Kysely with PostgreSQL. Set `DATABASE_URL` in your environment.

### Injecting the Database

Import `DatabaseModule` in your feature module, then use the `@InjectKysely()` decorator:

```typescript
import { Injectable } from "@nestjs/common";
import { InjectKysely, DatabaseService } from "@/database";

@Injectable()
export class UsersService {
  constructor(@InjectKysely() private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.selectFrom("users").selectAll().execute();
  }
}
```

### Migrations

```bash
pnpm migrate
```

## Internal Dependencies

- `@common/communication` - Shared Zod schemas for request/response validation
