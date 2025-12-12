import type { Generated } from "kysely";

export interface Permission {
  id: Generated<string>;
  code: string;
  title: string;
  description: string | null;
  default_access: boolean;
}
