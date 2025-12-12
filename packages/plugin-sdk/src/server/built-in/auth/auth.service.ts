import { Injectable } from "@nestjs/common";
import argon2 from "argon2";
import z from "zod";
import { Employee, EmployeeService } from "../employee";

/**
 * Service handling authentication operations for employees.
 */
@Injectable()
export class AuthService {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * Validates employee credentials by checking email and password.
   * @param email - The employee's email address
   * @param password - The plain text password to verify
   * @returns The employee data (without password_hash) if valid, null otherwise
   */
  public async validateCredentials(identifier: string, password: string) {
    const field: "username" | "email" = z.email().safeParse(identifier).success
      ? "email"
      : "username";

    const select = [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "is_admin",
      "password_hash",
    ] satisfies (keyof Employee)[];

    const employee =
      field === "email"
        ? await this.employeeService.getByEmail(identifier, select)
        : await this.employeeService.getByUsername(identifier, select);

    if (!employee) {
      return null;
    }

    const isValidPassword = await argon2.verify(
      employee.password_hash,
      password,
    );

    if (!isValidPassword) {
      return null;
    }

    const { password_hash: _, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }
}
