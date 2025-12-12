import type { Generated } from "kysely";

export interface PositionPermission {
  id: Generated<string>;
  position_id: string;
  permission_id: string;
  access: boolean;
}
