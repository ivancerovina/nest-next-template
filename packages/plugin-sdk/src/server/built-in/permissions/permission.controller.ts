import { Controller, Get, Param, Session, UseGuards } from "@nestjs/common";
import { type SessionData } from "express-session";
import { AuthenticatedGuard } from "../auth";
import { PermissionService } from "./permission.service";

@Controller("permissions")
@UseGuards(AuthenticatedGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get(":id")
  async selfHasPermission(
    @Session() session: SessionData,
    @Param("id") permissionId: string,
  ) {
    const userId = session.user.id;

    return await this.permissionService.hasPermission(userId, permissionId);
  }
}
