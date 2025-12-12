import type { ColumnType, Generated } from "kysely";

export interface Department {
  id: Generated<string>;
  name: string;
  description: string | null;
  parent_id: string | null;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}
