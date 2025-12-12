import { Injectable } from "@nestjs/common";
import { Insertable, Kysely, Updateable } from "kysely";
import { Database, InjectKysely, Tables } from "../../database";
import { Position } from "./position.entity";

type PositionSelect = keyof Tables["core.position"];

@Injectable()
export class PositionService {
  constructor(@InjectKysely() private readonly db: Kysely<Database>) {}

  /**
   * Creates a new position.
   * @param data - Position data to insert
   * @returns The created position's ID
   */
  public async create(data: Insertable<Position>) {
    return await this.db
      .insertInto("core.position")
      .values(data)
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Retrieves a position by ID.
   * @param id - The position's unique identifier
   * @param select - Array of column names to include in the result
   * @returns The position record with selected fields, or undefined if not found
   */
  public async getById<S extends PositionSelect>(id: string, select: S[]) {
    return await this.db
      .selectFrom("core.position")
      .where("id", "=", id)
      .select(select)
      .executeTakeFirst();
  }

  /**
   * Retrieves all positions.
   * @param select - Array of column names to include in the result
   * @returns Array of all position records
   */
  public async getAll<S extends PositionSelect>(select: S[]) {
    return await this.db
      .selectFrom("core.position")
      .select(select)
      .orderBy("name", "asc")
      .execute();
  }

  /**
   * Retrieves all positions in a specific department.
   * @param departmentId - The department's ID
   * @param select - Array of column names to include in the result
   * @returns Array of position records in the department
   */
  public async getByDepartment<S extends PositionSelect>(
    departmentId: string,
    select: S[],
  ) {
    return await this.db
      .selectFrom("core.position")
      .where("department_id", "=", departmentId)
      .select(select)
      .orderBy("name", "asc")
      .execute();
  }

  /**
   * Retrieves a position with its department information.
   * @param id - The position's unique identifier
   * @returns The position with department details, or undefined if not found
   */
  public async getWithDepartment(id: string) {
    return await this.db
      .selectFrom("core.position")
      .innerJoin(
        "core.department",
        "core.department.id",
        "core.position.department_id",
      )
      .where("core.position.id", "=", id)
      .select([
        "core.position.id",
        "core.position.name",
        "core.position.description",
        "core.position.department_id",
        "core.position.created_at",
        "core.position.updated_at",
        "core.department.name as department_name",
      ])
      .executeTakeFirst();
  }

  /**
   * Updates a position's data.
   * @param id - The position's unique identifier
   * @param data - The fields to update
   * @returns The result of the update operation
   */
  public async update(id: string, data: Updateable<Position>) {
    return await this.db
      .updateTable("core.position")
      .where("id", "=", id)
      .set({ ...data, updated_at: new Date().toISOString() })
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Deletes a position by ID.
   * Note: Employees with this position will have their position_id set to null.
   * @param id - The position's unique identifier
   * @returns The result of the delete operation
   */
  public async delete(id: string) {
    return await this.db
      .deleteFrom("core.position")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Checks if a position exists.
   * @param id - The position's unique identifier
   * @returns True if the position exists
   */
  public async exists(id: string): Promise<boolean> {
    const result = await this.db
      .selectFrom("core.position")
      .where("id", "=", id)
      .select("id")
      .executeTakeFirst();

    return result !== undefined;
  }

  /**
   * Counts positions in a department.
   * @param departmentId - The department's ID
   * @returns The number of positions in the department
   */
  public async countByDepartment(departmentId: string): Promise<number> {
    const result = await this.db
      .selectFrom("core.position")
      .where("department_id", "=", departmentId)
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
  }
}
