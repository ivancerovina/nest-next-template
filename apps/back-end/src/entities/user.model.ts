import type { ColumnType, Generated } from "kysely";

export interface User {
  id: Generated<string>;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string | null;
  google_id: string;
  verified_at: Date | null;
  is_admin: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}
