import z from "zod";
import { $route } from "../route-definition";

const attendanceLog = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
});

const attendancePauseLog = z.object({
  id: z.string().uuid(),
  attendance_log_id: z.string().uuid(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
});

export const status = $route({
  path: () => "/attendance/status",
  body: z.never(),
  query: z.never(),
  data: z.object({
    clockedIn: z.boolean(),
    paused: z.boolean(),
    activeLog: attendanceLog.nullable(),
    activePause: attendancePauseLog.nullable(),
    totalToday: z.number(),
    totalPauseToday: z.number(),
  }),
  errorCodes: [],
});

export const clockIn = $route({
  path: () => "/attendance/clock-in",
  body: z.never(),
  query: z.never(),
  data: attendanceLog,
  errorCodes: ["NOT_CLOCKED_OUT"],
});

export const clockOut = $route({
  path: () => "/attendance/clock-out",
  body: z.never(),
  query: z.never(),
  data: attendanceLog,
  errorCodes: ["NOT_CLOCKED_IN"],
});

export const pause = $route({
  path: () => "/attendance/pause",
  body: z.never(),
  query: z.never(),
  data: attendancePauseLog,
  errorCodes: ["NOT_CLOCKED_IN", "ALREADY_PAUSED"],
});

export const unpause = $route({
  path: () => "/attendance/unpause",
  body: z.never(),
  query: z.never(),
  data: attendancePauseLog,
  errorCodes: ["NOT_CLOCKED_IN", "NOT_PAUSED"],
});
