import type { ColumnType, Generated } from "kysely";

export interface Position {
  id: Generated<string>;
  name: string;
  description: string | null;
  department_id: string;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}
