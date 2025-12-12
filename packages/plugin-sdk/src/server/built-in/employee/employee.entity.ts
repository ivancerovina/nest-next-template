import type { ColumnType, Generated } from "kysely";

export interface Employee {
  id: Generated<string>;

  username: string;
  first_name: string;
  last_name: string;
  email: string | null;
  password_hash: string;
  is_admin: boolean;
  position_id: string | null;

  disabled_at: ColumnType<Date | null, string | undefined, string | null>;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}
