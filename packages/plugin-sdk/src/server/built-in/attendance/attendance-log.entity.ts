import type { Generated } from "kysely";

export interface AttendanceLog {
  id: Generated<string>;
  employee_id: string;
  start_date: Date;
  end_date: Date | null;
}
