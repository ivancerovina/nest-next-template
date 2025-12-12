import { AttendanceLog } from "../attendance/attendance-log.entity";
import { AttendancePauseLog } from "../attendance/attendance-pause-log.entity";
import { Department } from "../company/department";
import { Position } from "../company/position";
import { Employee } from "../employee";
import {
  DepartmentPermission,
  EmployeePermission,
  GlobalPermission,
  Permission,
  PositionPermission,
} from "../permissions/entities";

export interface Tables {
  "core.employee": Employee;
  "core.permission": Permission;
  "core.employee_permission": EmployeePermission;
  "core.position_permission": PositionPermission;
  "core.department_permission": DepartmentPermission;
  "core.global_permission": GlobalPermission;
  "core.department": Department;
  "core.position": Position;
  "core.attendance_log": AttendanceLog;
  "core.attendance_pause_log": AttendancePauseLog;
}

export type Database = Tables;
