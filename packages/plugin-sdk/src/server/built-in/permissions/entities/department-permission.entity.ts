import type { Generated } from "kysely";

export interface DepartmentPermission {
  id: Generated<string>;
  department_id: string;
  permission_id: string;
  access: boolean;
}
