import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS users`.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION users.update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db);

  await db.schema
    .withSchema("users")
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("first_name", "varchar", (col) => col.notNull())
    .addColumn("last_name", "varchar", (col) => col.notNull())
    .addColumn("email", "varchar(254)", (col) => col.notNull().unique())
    .addColumn("password_hash", "varchar")
    .addColumn("google_id", "varchar", (col) => col.notNull())
    .addColumn("verified_at", "timestamp")
    .addColumn("is_admin", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users.users
    FOR EACH ROW
    EXECUTE FUNCTION users.update_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users.users`.execute(
    db,
  );
  await db.schema.withSchema("users").dropTable("users").execute();
  await sql`DROP FUNCTION IF EXISTS users.update_updated_at`.execute(db);
  await sql`DROP SCHEMA IF EXISTS users`.execute(db);
}
