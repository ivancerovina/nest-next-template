import { Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { HttpError } from "../../utils/http.error";
import { Database, InjectKysely } from "../database";

@Injectable()
export class AttendanceService {
  constructor(@InjectKysely() private readonly db: Kysely<Database>) {}

  /**
   * Gets the current attendance status for an employee.
   * Returns the active attendance log (if clocked in) and any active pause.
   */
  public async getStatus(employeeId: string) {
    const activeLog = await this.db
      .selectFrom("core.attendance_log")
      .where("employee_id", "=", employeeId)
      .where("end_date", "is", null)
      .selectAll()
      .executeTakeFirst();

    const totalToday = await this.getTotalToday(employeeId);
    const totalPauseToday = await this.getTotalPauseToday(employeeId);

    if (!activeLog) {
      return {
        clockedIn: false,
        paused: false,
        activeLog: null,
        activePause: null,
        totalToday,
        totalPauseToday,
      };
    }

    const activePause = await this.db
      .selectFrom("core.attendance_pause_log")
      .where("attendance_log_id", "=", activeLog.id)
      .where("end_date", "is", null)
      .selectAll()
      .executeTakeFirst();

    return {
      clockedIn: true,
      paused: !!activePause,
      activeLog,
      activePause: activePause ?? null,
      totalToday,
      totalPauseToday,
    };
  }

  /**
   * Calculates the total milliseconds worked today for an employee.
   * Sums up all attendance log durations (start_date to end_date or now).
   */
  public async getTotalToday(employeeId: string): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const todayLogs = await this.db
      .selectFrom("core.attendance_log")
      .where("employee_id", "=", employeeId)
      .where("start_date", ">=", startOfDay)
      .select(["start_date", "end_date"])
      .execute();

    let totalMs = 0;

    for (const log of todayLogs) {
      const logStart = new Date(log.start_date).getTime();
      const logEnd = log.end_date
        ? new Date(log.end_date).getTime()
        : now.getTime();
      totalMs += logEnd - logStart;
    }

    return totalMs;
  }

  /**
   * Calculates the total milliseconds paused today for an employee.
   * Sums up all pause log durations from today's attendance logs.
   */
  public async getTotalPauseToday(employeeId: string): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Get today's attendance log IDs
    const todayLogs = await this.db
      .selectFrom("core.attendance_log")
      .where("employee_id", "=", employeeId)
      .where("start_date", ">=", startOfDay)
      .select(["id"])
      .execute();

    if (todayLogs.length === 0) {
      return 0;
    }

    const logIds = todayLogs.map((log) => log.id);

    // Get all pauses for today's logs
    const pauses = await this.db
      .selectFrom("core.attendance_pause_log")
      .where("attendance_log_id", "in", logIds)
      .select(["start_date", "end_date"])
      .execute();

    let totalMs = 0;

    for (const pause of pauses) {
      const pauseStart = new Date(pause.start_date).getTime();
      const pauseEnd = pause.end_date
        ? new Date(pause.end_date).getTime()
        : now.getTime();
      totalMs += pauseEnd - pauseStart;
    }

    return totalMs;
  }

  /**
   * Clocks in an employee, creating a new attendance log entry.
   * Throws NOT_CLOCKED_OUT if already clocked in.
   */
  public async clockIn(employeeId: string) {
    const status = await this.getStatus(employeeId);

    if (status.clockedIn) {
      throw new HttpError({
        message: "Already clocked in",
        errorCode: "NOT_CLOCKED_OUT",
        statusCode: 400,
      });
    }

    return await this.db
      .insertInto("core.attendance_log")
      .values({
        employee_id: employeeId,
        start_date: new Date(),
        end_date: null,
      })
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Clocks out an employee, ending the active attendance log.
   * Also ends any active pause.
   * Throws NOT_CLOCKED_IN if not clocked in.
   */
  public async clockOut(employeeId: string) {
    const status = await this.getStatus(employeeId);

    if (!status.clockedIn || !status.activeLog) {
      throw new HttpError({
        message: "Not clocked in",
        errorCode: "NOT_CLOCKED_IN",
        statusCode: 400,
      });
    }

    // End any active pause first
    if (status.activePause) {
      await this.db
        .updateTable("core.attendance_pause_log")
        .where("id", "=", status.activePause.id)
        .set({ end_date: new Date() })
        .execute();
    }

    return await this.db
      .updateTable("core.attendance_log")
      .where("id", "=", status.activeLog.id)
      .set({ end_date: new Date() })
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Starts a pause for an employee.
   * Throws NOT_CLOCKED_IN if not clocked in.
   * Throws ALREADY_PAUSED if already paused.
   */
  public async startPause(employeeId: string) {
    const status = await this.getStatus(employeeId);

    if (!status.clockedIn || !status.activeLog) {
      throw new HttpError({
        message: "Not clocked in",
        errorCode: "NOT_CLOCKED_IN",
        statusCode: 400,
      });
    }

    if (status.paused) {
      throw new HttpError({
        message: "Already paused",
        errorCode: "ALREADY_PAUSED",
        statusCode: 400,
      });
    }

    return await this.db
      .insertInto("core.attendance_pause_log")
      .values({
        attendance_log_id: status.activeLog.id,
        start_date: new Date(),
        end_date: null,
      })
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Ends the current pause for an employee.
   * Throws NOT_CLOCKED_IN if not clocked in.
   * Throws NOT_PAUSED if not currently paused.
   */
  public async endPause(employeeId: string) {
    const status = await this.getStatus(employeeId);

    if (!status.clockedIn || !status.activeLog) {
      throw new HttpError({
        message: "Not clocked in",
        errorCode: "NOT_CLOCKED_IN",
        statusCode: 400,
      });
    }

    if (!status.paused || !status.activePause) {
      throw new HttpError({
        message: "Not paused",
        errorCode: "NOT_PAUSED",
        statusCode: 400,
      });
    }

    return await this.db
      .updateTable("core.attendance_pause_log")
      .where("id", "=", status.activePause.id)
      .set({ end_date: new Date() })
      .returningAll()
      .executeTakeFirst();
  }
}
