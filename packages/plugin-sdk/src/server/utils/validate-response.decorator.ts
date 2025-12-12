import { SetMetadata } from "@nestjs/common";
import type { z } from "zod";

export const RESPONSE_SCHEMA_KEY = Symbol("RESPONSE_SCHEMA");

/**
 * Decorator to validate controller method responses against a Zod schema
 *
 * @param schema - The Zod schema to validate the response against (should use .response.all from $schema)
 *
 * @example
 * ```typescript
 * @Get(EMPLOYEE_ROUTES.LIST.path)
 * @ValidateResponse($schema.routes.employee.getAll.response.all)
 * async getAllEmployees(): Promise<z.infer<typeof $schema.routes.employee.getAll.response.data>> {
 *   return await this.employeeService.findAll();
 * }
 * ```
 */
export const ValidateResponse = (schema: z.ZodSchema) =>
  SetMetadata(RESPONSE_SCHEMA_KEY, schema);
