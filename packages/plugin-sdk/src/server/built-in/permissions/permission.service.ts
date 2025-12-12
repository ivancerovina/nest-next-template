import { Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { Database, InjectKysely } from "../database";
import { PermissionData } from "./permission.types";

@Injectable()
export class PermissionService {
  constructor(@InjectKysely() private readonly db: Kysely<Database>) {}

  /**
   * Check if an employee has a specific permission.
   *
   * Resolution hierarchy (first match wins):
   * 1. Employee-level permission
   * 2. Position-level permission
   * 3. Department-level permission (traverses up the tree)
   * 4. Global permission
   * 5. Permission's default_access
   *
   * Access values: true = GRANTED, false = DENIED, no row = INHERIT
   */
  public async hasPermission(
    employeeId: string,
    permissionCode: string,
  ): Promise<boolean> {
    // Admins have access to all permissions
    const isAdmin = await this.isAdmin(employeeId);
    if (isAdmin) {
      return true;
    }

    const permission = await this.db
      .selectFrom("core.permission")
      .where("code", "=", permissionCode)
      .select(["id", "default_access"])
      .executeTakeFirst();

    if (!permission) {
      return false;
    }

    const permissionId = permission.id;

    // 1. Check employee-level permission
    const employeePermission = await this.db
      .selectFrom("core.employee_permission")
      .where("employee_id", "=", employeeId)
      .where("permission_id", "=", permissionId)
      .select("access")
      .executeTakeFirst();

    if (employeePermission) {
      return employeePermission.access;
    }

    // Get employee's position
    const employee = await this.db
      .selectFrom("core.employee")
      .where("id", "=", employeeId)
      .select("position_id")
      .executeTakeFirst();

    if (!employee) {
      return false;
    }

    // 2. Check position-level permission
    if (employee.position_id) {
      const positionPermission = await this.db
        .selectFrom("core.position_permission")
        .where("position_id", "=", employee.position_id)
        .where("permission_id", "=", permissionId)
        .select("access")
        .executeTakeFirst();

      if (positionPermission) {
        return positionPermission.access;
      }

      // Get position's department
      const position = await this.db
        .selectFrom("core.position")
        .where("id", "=", employee.position_id)
        .select("department_id")
        .executeTakeFirst();

      // 3. Check department-level permissions (traverse up the tree)
      if (position?.department_id) {
        let currentDepartmentId: string | null = position.department_id;

        while (currentDepartmentId) {
          const departmentPermission = await this.db
            .selectFrom("core.department_permission")
            .where("department_id", "=", currentDepartmentId)
            .where("permission_id", "=", permissionId)
            .select("access")
            .executeTakeFirst();

          if (departmentPermission) {
            return departmentPermission.access;
          }

          // Get parent department
          const department = await this.db
            .selectFrom("core.department")
            .where("id", "=", currentDepartmentId)
            .select("parent_id")
            .executeTakeFirst();

          currentDepartmentId = department?.parent_id ?? null;
        }
      }
    }

    // 4. Check global permission
    const globalPermission = await this.db
      .selectFrom("core.global_permission")
      .where("permission_id", "=", permissionId)
      .select("access")
      .executeTakeFirst();

    if (globalPermission) {
      return globalPermission.access;
    }

    // 5. Permission's default access
    return permission.default_access;
  }

  /**
   * Check if an employee is an admin.
   * Admins have access to all permissions.
   */
  public async isAdmin(employeeId: string): Promise<boolean> {
    const employee = await this.db
      .selectFrom("core.employee")
      .where("id", "=", employeeId)
      .select("is_admin")
      .executeTakeFirst();

    return employee?.is_admin ?? false;
  }

  public async ensureRegistered(data: PermissionData) {
    await this.db
      .insertInto("core.permission")
      .values(data)
      .onConflict((oc) =>
        oc.column("code").doUpdateSet({
          title: (eb) => eb.ref("excluded.title"),
          description: (eb) => eb.ref("excluded.description"),
          default_access: (eb) => eb.ref("excluded.default_access"),
        }),
      )
      .returning(["id"])
      .execute();
  }
}
