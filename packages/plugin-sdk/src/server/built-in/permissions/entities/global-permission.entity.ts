import type { Generated } from "kysely";

export interface GlobalPermission {
  id: Generated<string>;
  permission_id: string;
  access: boolean;
}
