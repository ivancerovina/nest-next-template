// scripts/migrate.ts

import { promises as fs } from "node:fs";
import * as path from "node:path";
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from "kysely";
import { run } from "kysely-migration-cli";
import pg from "pg";
import type { Database } from "@/database";

// For ESM environment
const migrationFolder = new URL("../migrations", import.meta.url).pathname;

// For CJS environment
// const migrationFolder = path.join(__dirname, '../migrations')

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  }),
});

run(db, migrator, migrationFolder);
