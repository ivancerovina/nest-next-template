import type { Generated } from "kysely";

export interface AttendancePauseLog {
  id: Generated<string>;
  attendance_log_id: string;
  start_date: Date;
  end_date: Date | null;
}
