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
import { PositionService } from "../position/position.service";
import { DepartmentService } from "./department.service";

type TCreateBody = z.infer<typeof builtInRoutes.department.create.body>;
type TCreateResponse = z.infer<
  typeof builtInRoutes.department.create.response.data
>;

type TGetByIdResponse = z.infer<
  typeof builtInRoutes.department.getById.response.data
>;

type TGetAllQuery = z.infer<typeof builtInRoutes.department.getAll.query>;
type TGetAllResponse = z.infer<
  typeof builtInRoutes.department.getAll.response.data
>;

type TGetChildrenResponse = z.infer<
  typeof builtInRoutes.department.getChildren.response.data
>;

type TGetAncestorsResponse = z.infer<
  typeof builtInRoutes.department.getAncestors.response.data
>;

type TUpdateBody = z.infer<typeof builtInRoutes.department.update.body>;
type TUpdateResponse = z.infer<
  typeof builtInRoutes.department.update.response.data
>;

type TRemoveResponse = z.infer<
  typeof builtInRoutes.department.remove.response.data
>;

type TGetPositionsResponse = z.infer<
  typeof builtInRoutes.position.getByDepartment.response.data
>;

type TGetTreeResponse = z.infer<
  typeof builtInRoutes.department.getTree.response.data
>;

const departmentSelect = [
  "id",
  "name",
  "description",
  "parent_id",
  "created_at",
  "updated_at",
] as const;

const positionSelect = [
  "id",
  "name",
  "description",
  "department_id",
  "created_at",
  "updated_at",
] as const;

@Controller("departments")
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly positionService: PositionService,
  ) {}

  @Post()
  @ValidateResponse(builtInRoutes.department.create.response.raw)
  async create(
    @Body(new ZodValidationPipe(builtInRoutes.department.create.body))
    body: TCreateBody,
  ): Promise<TCreateResponse> {
    if (body.parent_id) {
      const parentExists = await this.departmentService.exists(body.parent_id);
      if (!parentExists) {
        throw new HttpError({
          message: "Parent department not found",
          errorCode: "PARENT_NOT_FOUND",
          statusCode: 404,
        });
      }
    }

    const result = await this.departmentService.create({
      name: body.name,
      description: body.description ?? null,
      parent_id: body.parent_id ?? null,
    });

    return { id: result!.id };
  }

  @Get()
  @ValidateResponse(builtInRoutes.department.getAll.response.raw)
  async getAll(
    @Query(new ZodValidationPipe(builtInRoutes.department.getAll.query))
    query: TGetAllQuery,
  ): Promise<TGetAllResponse> {
    const departments = query.roots_only
      ? await this.departmentService.getRoots([...departmentSelect])
      : await this.departmentService.getAll([...departmentSelect]);

    return { departments };
  }

  @Get("tree")
  @ValidateResponse(builtInRoutes.department.getTree.response.raw)
  async getTree(): Promise<TGetTreeResponse> {
    const tree = await this.departmentService.getTree();
    return { tree };
  }

  @Get(":id")
  @ValidateResponse(builtInRoutes.department.getById.response.raw)
  async getById(@Param("id") id: string): Promise<TGetByIdResponse> {
    const department = await this.departmentService.getById(id, [
      ...departmentSelect,
    ]);

    if (!department) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    return { department };
  }

  @Get(":id/children")
  @ValidateResponse(builtInRoutes.department.getChildren.response.raw)
  async getChildren(@Param("id") id: string): Promise<TGetChildrenResponse> {
    const exists = await this.departmentService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    const departments = await this.departmentService.getChildren(id, [
      ...departmentSelect,
    ]);

    return { departments };
  }

  @Get(":id/ancestors")
  @ValidateResponse(builtInRoutes.department.getAncestors.response.raw)
  async getAncestors(@Param("id") id: string): Promise<TGetAncestorsResponse> {
    const exists = await this.departmentService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    const departments = await this.departmentService.getAncestors(id);

    return { departments };
  }

  @Get(":id/positions")
  @ValidateResponse(builtInRoutes.position.getByDepartment.response.raw)
  async getPositions(@Param("id") id: string): Promise<TGetPositionsResponse> {
    const exists = await this.departmentService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    const positions = await this.positionService.getByDepartment(id, [
      ...positionSelect,
    ]);

    return { positions };
  }

  @Patch(":id")
  @ValidateResponse(builtInRoutes.department.update.response.raw)
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(builtInRoutes.department.update.body))
    body: TUpdateBody,
  ): Promise<TUpdateResponse> {
    const exists = await this.departmentService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    if (body.parent_id !== undefined) {
      if (body.parent_id === id) {
        throw new HttpError({
          message: "Department cannot be its own parent",
          errorCode: "CIRCULAR_REFERENCE",
          statusCode: 400,
        });
      }

      if (body.parent_id !== null) {
        const parentExists = await this.departmentService.exists(
          body.parent_id,
        );
        if (!parentExists) {
          throw new HttpError({
            message: "Parent department not found",
            errorCode: "PARENT_NOT_FOUND",
            statusCode: 404,
          });
        }

        // Check for circular reference in ancestors
        const ancestors = await this.departmentService.getAncestors(
          body.parent_id,
        );
        if (ancestors.some((a) => a.id === id)) {
          throw new HttpError({
            message: "Circular reference detected in department hierarchy",
            errorCode: "CIRCULAR_REFERENCE",
            statusCode: 400,
          });
        }
      }
    }

    const result = await this.departmentService.update(id, body);

    return { id: result!.id };
  }

  @Delete(":id")
  @ValidateResponse(builtInRoutes.department.remove.response.raw)
  async remove(@Param("id") id: string): Promise<TRemoveResponse> {
    const exists = await this.departmentService.exists(id);
    if (!exists) {
      throw new HttpError({
        message: "Department not found",
        errorCode: "DEPARTMENT_NOT_FOUND",
        statusCode: 404,
      });
    }

    const result = await this.departmentService.delete(id);

    return { id: result!.id };
  }
}
