import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import z from "zod";
import { builtInRoutes } from "../../../../shared";
import { HttpError, ValidateResponse, ZodValidationPipe } from "../../../utils";
import { DepartmentService } from "../department/department.service";
import { PositionService } from "./position.service";

type TCreateBody = z.infer<typeof builtInRoutes.position.create.body>;
type TCreateResponse = z.infer<
  typeof builtInRoutes.position.create.response.data
>;

type TGetByIdQuery = z.infer<typeof builtInRoutes.position.getById.query>;
type TGetByIdResponse = z.infer<
  typeof builtInRoutes.position.getById.response.data
>;

type TGetAllQuery = z.infer<typeof builtInRoutes.position.getAll.query>;
type TGetAllResponse = z.infer<
  typeof builtInRoutes.position.getAll.response.data
>;

type TUpdateBody = z.infer<typeof builtInRoutes.position.update.body>;
type TUpdateResponse = z.infer<
  typeof builtInRoutes.position.update.response.data
>;

type TRemoveResponse = z.infer<
  typeof builtInRoutes.position.remove.response.data
>;

const positionSelect = [
  "id",
  "name",
  "description",
  "department_id",
  "created_at",
  "updated_at",
] as const;

@Controller("positions")
export class PositionController {
  constructor(
    private readonly positionService: PositionService,
    private readonly departmentService: DepartmentService,
  ) {}

  @Post()
  @ValidateResponse(builtInRoutes.position.create.response.raw)
  async create(
    @Body(new ZodValidationPipe(builtInRoutes.position.create.body))
    body: TCreateBody,
  ): Promise<TCreateResponse> {
    const departmentExists = await this.departmentService.exists(
      body.department_id,
    );
    if (!departmentExists) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    const result = await this.positionService.create({
      name: body.name,
      description: body.description ?? null,
      department_id: body.department_id,
    });

    return { id: result!.id };
  }

  @Get()
  @ValidateResponse(builtInRoutes.position.getAll.response.raw)
  async getAll(
    @Query(new ZodValidationPipe(builtInRoutes.position.getAll.query))
    query: TGetAllQuery,
  ): Promise<TGetAllResponse> {
    const positions = query.department_id
      ? await this.positionService.getByDepartment(query.department_id, [
          ...positionSelect,
        ])
      : await this.positionService.getAll([...positionSelect]);

    return { positions };
  }

  @Get(":id")
  @ValidateResponse(builtInRoutes.position.getById.response.raw)
  async getById(
    @Param("id") id: string,
    @Query(new ZodValidationPipe(builtInRoutes.position.getById.query))
    query: TGetByIdQuery,
  ): Promise<TGetByIdResponse> {
    if (query.include_department) {
      const position = await this.positionService.getWithDepartment(id);

      if (!position) {
        throw new HttpError({
          message: "Position not found",
          errorCode: "POSITION_NOT_FOUND",
          statusCode: 404,
        });
      }

      return { position };
    }

    const position = await this.positionService.getById(id, [
      ...positionSelect,
    ]);

    if (!position) {
      throw new HttpError({
        message: "Position not found",
        errorCode: "POSITION_NOT_FOUND",
        statusCode: 404,
      });
    }

    return { position };
  }

  @Patch(":id")
  @ValidateResponse(builtInRoutes.position.update.response.raw)
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(builtInRoutes.position.update.body))
    body: TUpdateBody,
  ): Promise<TUpdateResponse> {
    const exists = await this.positionService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Position not found",
        errorCode: "POSITION_NOT_FOUND",
        statusCode: 404,
      });
    }

    if (body.department_id) {
      const departmentExists = await this.departmentService.exists(
        body.department_id,
      );
      if (!departmentExists) {
        throw new HttpError({
          message: "Department not found",
          errorCode: "DEPARTMENT_NOT_FOUND",
          statusCode: 404,
        });
      }
    }

    const result = await this.positionService.update(id, body);

    return { id: result!.id };
  }

  @Delete(":id")
  @ValidateResponse(builtInRoutes.position.remove.response.raw)
  async remove(@Param("id") id: string): Promise<TRemoveResponse> {
    const exists = await this.positionService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Position not found",
        errorCode: "POSITION_NOT_FOUND",
        statusCode: 404,
      });
    }

    const result = await this.positionService.delete(id);

    return { id: result!.id };
  }
}
