import type { Generated } from "kysely";

export interface EmployeePermission {
  id: Generated<string>;
  employee_id: string;
  permission_id: string;
  access: boolean;
}
