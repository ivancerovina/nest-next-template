import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type z from "zod";
import { builtInRoutes } from "../../../shared";
import { ValidateResponse } from "../../utils";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { RequirePermission } from "../permissions/require-permission.decorator";
import { AttendanceService } from "./attendance.service";

type TStatusResponse = z.infer<
  typeof builtInRoutes.attendance.status.response.data
>;
type TClockInResponse = z.infer<
  typeof builtInRoutes.attendance.clockIn.response.data
>;
type TClockOutResponse = z.infer<
  typeof builtInRoutes.attendance.clockOut.response.data
>;
type TPauseResponse = z.infer<
  typeof builtInRoutes.attendance.pause.response.data
>;
type TUnpauseResponse = z.infer<
  typeof builtInRoutes.attendance.unpause.response.data
>;

@Controller("attendance")
@UseGuards(AuthenticatedGuard)
@RequirePermission("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("status")
  @ValidateResponse(builtInRoutes.attendance.status.response.raw)
  async status(@Req() req: Request): Promise<TStatusResponse> {
    return await this.attendanceService.getStatus(req.session.user!.id);
  }

  @Post("clock-in")
  @ValidateResponse(builtInRoutes.attendance.clockIn.response.raw)
  async clockIn(@Req() req: Request): Promise<TClockInResponse> {
    return (await this.attendanceService.clockIn(req.session.user!.id))!;
  }

  @Post("clock-out")
  @ValidateResponse(builtInRoutes.attendance.clockOut.response.raw)
  async clockOut(@Req() req: Request): Promise<TClockOutResponse> {
    return (await this.attendanceService.clockOut(req.session.user!.id))!;
  }

  @Post("pause")
  @ValidateResponse(builtInRoutes.attendance.pause.response.raw)
  async pause(@Req() req: Request): Promise<TPauseResponse> {
    return (await this.attendanceService.startPause(req.session.user!.id))!;
  }

  @Post("unpause")
  @ValidateResponse(builtInRoutes.attendance.unpause.response.raw)
  async unpause(@Req() req: Request): Promise<TUnpauseResponse> {
    return (await this.attendanceService.endPause(req.session.user!.id))!;
  }
}
