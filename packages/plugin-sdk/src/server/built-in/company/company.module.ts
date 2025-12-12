import { Module } from "@nestjs/common";
import { DepartmentService } from "./department";
import { DepartmentController } from "./department/department.controller";
import { PositionController, PositionService } from "./position";

@Module({
  imports: [],
  controllers: [DepartmentController, PositionController],
  providers: [DepartmentService, PositionService],
  exports: [DepartmentService, PositionService],
})
export class CompanyModule {}
