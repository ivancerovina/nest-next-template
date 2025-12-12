import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from "@nestjs/common";
import z from "zod";
import { builtInRoutes } from "../../../shared";
import { ValidateResponse, ZodValidationPipe } from "../../utils";
import { EmployeeService } from "./employee.service";

type TCreateFirstEmployeeBody = z.infer<
  typeof builtInRoutes.employees.createFirstEmployee.body
>;

type TCreateFirstEmployeeResponse = z.infer<
  typeof builtInRoutes.employees.createFirstEmployee.response.data
>;

type TFirstEmployeeExistsResponse = z.infer<
  typeof builtInRoutes.employees.firstEmployeeExists.response.data
>;

@Controller("employees")
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post("create-first-employee")
  @ValidateResponse(builtInRoutes.employees.createFirstEmployee.response.raw)
  async createFirstEmployee(
    @Body(
      new ZodValidationPipe(builtInRoutes.employees.createFirstEmployee.body),
    )
    body: TCreateFirstEmployeeBody,
  ): Promise<TCreateFirstEmployeeResponse> {
    const result = await this.employeeService.create({
      ...body,
      is_admin: true,
    });

    if (!result) {
      throw new InternalServerErrorException("Failed to create first employee");
    }

    return { id: result.id };
  }

  @Post("first-employee-exists")
  @ValidateResponse(builtInRoutes.employees.firstEmployeeExists.response.raw)
  async firstEmployeeExists(): Promise<TFirstEmployeeExistsResponse> {
    return {
      firstEmployeeExists: await this.employeeService.employeesExist(),
    };
  }
}
