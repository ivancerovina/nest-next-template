import { Injectable } from "@nestjs/common";
import argon2 from "argon2";
import { Insertable, Kysely, Updateable } from "kysely";
import { Database, InjectKysely, Tables } from "../database";
import { Employee } from "./employee.entity";

type EmployeeSelect = keyof Tables["core.employee"];

@Injectable()
export class EmployeeService {
  constructor(@InjectKysely() private readonly database: Kysely<Database>) {}

  /**
   * Creates a new employee record with a hashed password.
   * @param data - Employee data with plain text password (password will be hashed before storage)
   * @returns The result of the insert operation
   */
  public async create({
    password,
    ...rest
  }: Omit<Insertable<Employee>, "password_hash"> & { password: string }) {
    const dataWithHash = {
      ...rest,
      password_hash: await argon2.hash(password),
    };

    return await this.database
      .insertInto("core.employee")
      .values(dataWithHash)
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Retrieves an employee by their unique ID.
   * @param id - The employee's unique identifier
   * @param select - Array of column names to include in the result
   * @returns The employee record with selected fields, or undefined if not found
   */
  public async getById<S extends EmployeeSelect>(id: string, select: S[]) {
    return await this.database
      .selectFrom("core.employee")
      .where("id", "=", id)
      .select(select)
      .executeTakeFirst();
  }

  /**
   * Retrieves an employee by their email address.
   * @param email - The employee's email address
   * @param select - Array of column names to include in the result
   * @returns The employee record with selected fields, or undefined if not found
   */
  public async getByEmail<S extends EmployeeSelect>(
    email: string,
    select: S[],
  ) {
    return await this.database
      .selectFrom("core.employee")
      .where("email", "=", email)
      .select(select)
      .executeTakeFirst();
  }

  public async getByUsername<S extends EmployeeSelect>(
    username: string,
    select: S[],
  ) {
    return await this.database
      .selectFrom("core.employee")
      .where("username", "=", username)
      .select(select)
      .executeTakeFirst();
  }

  /**
   * Deletes an employee record by their unique ID.
   * @param id - The employee's unique identifier
   * @returns The result of the delete operation
   */
  public async delete(id: string) {
    return await this.database
      .selectFrom("core.employee")
      .where("id", "=", id)
      .executeTakeFirst();
  }

  /**
   * Updates an employee's data (excluding password).
   * @param id - The employee's unique identifier
   * @param data - The fields to update (password_hash is explicitly excluded)
   * @returns The result of the update operation
   */
  public async update(
    id: string,
    data: Omit<Updateable<Employee>, "password_hash">,
  ) {
    delete (data as { password_hash?: string }).password_hash;

    return await this.database
      .updateTable("core.employee")
      .where("id", "=", id)
      .set(data)
      .executeTakeFirst();
  }

  /**
   * Updates an employee's password.
   * @param id - The employee's unique identifier
   * @param newPassword - The new plain text password (will be hashed before storage)
   */
  public async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await argon2.hash(newPassword);

    await this.database
      .updateTable("core.employee")
      .where("id", "=", id)
      .set({ password_hash: hashedPassword })
      .executeTakeFirst();
  }

  /**
   * Returns whether there are any employees in the database
   */
  public async employeesExist(): Promise<boolean> {
    const firstUser = await this.database
      .selectFrom("core.employee")
      .select(["id"])
      .limit(1)
      .executeTakeFirst();

    return !!firstUser;
  }
}
