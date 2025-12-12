import type { Kysely, Migration } from "kysely";

export const m_1765353784675_initial: Migration = {
  async up(db: Kysely<unknown>) {
    await db.schema.createSchema("core").ifNotExists().execute();

    // Create department table (self-referential for tree structure)
    await db.schema
      .createTable("core.department")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("name", "varchar(255)", (col) => col.notNull())
      .addColumn("description", "text")
      .addColumn("parent_id", "uuid", (col) =>
        col.references("core.department.id").onDelete("set null"),
      )
      .addColumn("created_at", "timestamptz", (col) =>
        col.notNull().defaultTo(db.fn("now")),
      )
      .addColumn("updated_at", "timestamptz", (col) =>
        col.notNull().defaultTo(db.fn("now")),
      )
      .execute();

    // Create position table
    await db.schema
      .createTable("core.position")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("name", "varchar(255)", (col) => col.notNull())
      .addColumn("description", "text")
      .addColumn("department_id", "uuid", (col) =>
        col.notNull().references("core.department.id").onDelete("cascade"),
      )
      .addColumn("created_at", "timestamptz", (col) =>
        col.notNull().defaultTo(db.fn("now")),
      )
      .addColumn("updated_at", "timestamptz", (col) =>
        col.notNull().defaultTo(db.fn("now")),
      )
      .execute();

    // Create employee table
    await db.schema
      .createTable("core.employee")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("username", "varchar(255)", (col) => col.notNull().unique())
      .addColumn("first_name", "varchar(255)", (col) => col.notNull())
      .addColumn("last_name", "varchar(255)", (col) => col.notNull())
      .addColumn("email", "varchar(255)", (col) => col.unique())
      .addColumn("password_hash", "varchar(255)", (col) => col.notNull())
      .addColumn("is_admin", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("position_id", "uuid", (col) =>
        col.references("core.position.id").onDelete("set null"),
      )
      .addColumn("disabled_at", "timestamptz")
      .addColumn("created_at", "timestamptz", (col) =>
        col.notNull().defaultTo(db.fn("now")),
      )
      .addColumn("updated_at", "timestamptz", (col) =>
        col.notNull().defaultTo(db.fn("now")),
      )
      .execute();

    // Create permission table
    await db.schema
      .createTable("core.permission")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("code", "varchar(255)", (col) => col.notNull().unique())
      .addColumn("title", "varchar(255)", (col) => col.notNull())
      .addColumn("description", "text")
      .addColumn("default_access", "boolean", (col) =>
        col.notNull().defaultTo(false),
      )
      .execute();

    // Create employee_permission table
    await db.schema
      .createTable("core.employee_permission")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("employee_id", "uuid", (col) =>
        col.notNull().references("core.employee.id").onDelete("cascade"),
      )
      .addColumn("permission_id", "uuid", (col) =>
        col.notNull().references("core.permission.id").onDelete("cascade"),
      )
      .addColumn("access", "boolean", (col) => col.notNull())
      .addUniqueConstraint("employee_permission_unique", [
        "employee_id",
        "permission_id",
      ])
      .execute();

    // Create position_permission table
    await db.schema
      .createTable("core.position_permission")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("position_id", "uuid", (col) =>
        col.notNull().references("core.position.id").onDelete("cascade"),
      )
      .addColumn("permission_id", "uuid", (col) =>
        col.notNull().references("core.permission.id").onDelete("cascade"),
      )
      .addColumn("access", "boolean", (col) => col.notNull())
      .addUniqueConstraint("position_permission_unique", [
        "position_id",
        "permission_id",
      ])
      .execute();

    // Create department_permission table
    await db.schema
      .createTable("core.department_permission")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("department_id", "uuid", (col) =>
        col.notNull().references("core.department.id").onDelete("cascade"),
      )
      .addColumn("permission_id", "uuid", (col) =>
        col.notNull().references("core.permission.id").onDelete("cascade"),
      )
      .addColumn("access", "boolean", (col) => col.notNull())
      .addUniqueConstraint("department_permission_unique", [
        "department_id",
        "permission_id",
      ])
      .execute();

    // Create global_permission table
    await db.schema
      .createTable("core.global_permission")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("permission_id", "uuid", (col) =>
        col
          .notNull()
          .unique()
          .references("core.permission.id")
          .onDelete("cascade"),
      )
      .addColumn("access", "boolean", (col) => col.notNull())
      .execute();

    // Create attendance_log table
    await db.schema
      .createTable("core.attendance_log")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("employee_id", "uuid", (col) =>
        col.notNull().references("core.employee.id").onDelete("cascade"),
      )
      .addColumn("start_date", "timestamptz", (col) => col.notNull())
      .addColumn("end_date", "timestamptz")
      .execute();

    // Create attendance_pause_log table
    await db.schema
      .createTable("core.attendance_pause_log")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
      )
      .addColumn("attendance_log_id", "uuid", (col) =>
        col.notNull().references("core.attendance_log.id").onDelete("cascade"),
      )
      .addColumn("start_date", "timestamptz", (col) => col.notNull())
      .addColumn("end_date", "timestamptz")
      .execute();

    // Create indexes for better query performance
    await db.schema
      .createIndex("idx_department_parent_id")
      .on("core.department")
      .column("parent_id")
      .execute();

    await db.schema
      .createIndex("idx_position_department_id")
      .on("core.position")
      .column("department_id")
      .execute();

    await db.schema
      .createIndex("idx_employee_position_id")
      .on("core.employee")
      .column("position_id")
      .execute();

    await db.schema
      .createIndex("idx_attendance_log_employee_id")
      .on("core.attendance_log")
      .column("employee_id")
      .execute();

    await db.schema
      .createIndex("idx_attendance_pause_log_attendance_log_id")
      .on("core.attendance_pause_log")
      .column("attendance_log_id")
      .execute();
  },

  async down(db: Kysely<unknown>) {
    // Drop indexes
    await db.schema
      .dropIndex("idx_attendance_pause_log_attendance_log_id")
      .ifExists()
      .execute();
    await db.schema
      .dropIndex("idx_attendance_log_employee_id")
      .ifExists()
      .execute();
    await db.schema.dropIndex("idx_employee_position_id").ifExists().execute();
    await db.schema
      .dropIndex("idx_position_department_id")
      .ifExists()
      .execute();
    await db.schema.dropIndex("idx_department_parent_id").ifExists().execute();

    // Drop attendance tables
    await db.schema.dropTable("core.attendance_pause_log").ifExists().execute();
    await db.schema.dropTable("core.attendance_log").ifExists().execute();

    // Drop permission tables
    await db.schema.dropTable("core.global_permission").ifExists().execute();
    await db.schema
      .dropTable("core.department_permission")
      .ifExists()
      .execute();
    await db.schema.dropTable("core.position_permission").ifExists().execute();
    await db.schema.dropTable("core.employee_permission").ifExists().execute();
    await db.schema.dropTable("core.permission").ifExists().execute();

    // Drop main tables (reverse order of creation due to FK dependencies)
    await db.schema.dropTable("core.employee").ifExists().execute();
    await db.schema.dropTable("core.position").ifExists().execute();
    await db.schema.dropTable("core.department").ifExists().execute();

    await db.schema.dropSchema("core").ifExists().execute();
  },
};
