import { Module, OnModuleInit } from "@nestjs/common";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";

@Module({
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
  imports: [],
})
export class PermissionModule implements OnModuleInit {
  async onModuleInit() {}
}
