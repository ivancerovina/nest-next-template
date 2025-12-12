import { Test, type TestingModule } from "@nestjs/testing";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { HttpError } from "../../utils/http.error";
import { Database, KYSELY } from "../database";
import { AttendanceService } from "./attendance.service";

const createMockKysely = () => {
  return new Kysely<Database>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });
};

describe("AttendanceService", () => {
  let service: AttendanceService;
  let database: Kysely<Database>;

  beforeEach(async () => {
    database = createMockKysely();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: KYSELY,
          useValue: database,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getStatus", () => {
    it("should build correct query to check attendance status", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getStatus("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.attendance_log");
    });
  });

  describe("clockIn", () => {
    it("should build correct insert query", async () => {
      const insertIntoSpy = jest.spyOn(database, "insertInto");

      // Mock getStatus to return not clocked in
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: false,
        paused: false,
        activeLog: null,
        activePause: null,
        totalToday: 0,
      });

      try {
        await service.clockIn("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(insertIntoSpy).toHaveBeenCalledWith("core.attendance_log");
    });

    it("should throw NOT_CLOCKED_OUT when already clocked in", async () => {
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: false,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: null,
        totalToday: 3600000,
      });

      await expect(service.clockIn("employee-uuid")).rejects.toThrow(HttpError);

      try {
        await service.clockIn("employee-uuid");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).errorCode).toBe("NOT_CLOCKED_OUT");
        expect((error as HttpError).statusCode).toBe(400);
      }
    });
  });

  describe("clockOut", () => {
    it("should build correct update query", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: false,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: null,
        totalToday: 3600000,
      });

      try {
        await service.clockOut("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.attendance_log");
    });

    it("should end pause before clocking out", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: true,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: {
          id: "pause-uuid",
          attendance_log_id: "log-uuid",
          start_date: new Date(),
          end_date: null,
        },
        totalToday: 3600000,
      });

      try {
        await service.clockOut("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.attendance_pause_log");
    });

    it("should throw NOT_CLOCKED_IN when not clocked in", async () => {
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: false,
        paused: false,
        activeLog: null,
        activePause: null,
        totalToday: 0,
      });

      await expect(service.clockOut("employee-uuid")).rejects.toThrow(
        HttpError,
      );

      try {
        await service.clockOut("employee-uuid");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).errorCode).toBe("NOT_CLOCKED_IN");
        expect((error as HttpError).statusCode).toBe(400);
      }
    });
  });

  describe("startPause", () => {
    it("should build correct insert query", async () => {
      const insertIntoSpy = jest.spyOn(database, "insertInto");

      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: false,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: null,
        totalToday: 3600000,
      });

      try {
        await service.startPause("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(insertIntoSpy).toHaveBeenCalledWith("core.attendance_pause_log");
    });

    it("should throw NOT_CLOCKED_IN when not clocked in", async () => {
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: false,
        paused: false,
        activeLog: null,
        activePause: null,
        totalToday: 0,
      });

      await expect(service.startPause("employee-uuid")).rejects.toThrow(
        HttpError,
      );

      try {
        await service.startPause("employee-uuid");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).errorCode).toBe("NOT_CLOCKED_IN");
        expect((error as HttpError).statusCode).toBe(400);
      }
    });

    it("should throw ALREADY_PAUSED when already paused", async () => {
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: true,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: {
          id: "pause-uuid",
          attendance_log_id: "log-uuid",
          start_date: new Date(),
          end_date: null,
        },
        totalToday: 3600000,
      });

      await expect(service.startPause("employee-uuid")).rejects.toThrow(
        HttpError,
      );

      try {
        await service.startPause("employee-uuid");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).errorCode).toBe("ALREADY_PAUSED");
        expect((error as HttpError).statusCode).toBe(400);
      }
    });
  });

  describe("endPause", () => {
    it("should build correct update query", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: true,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: {
          id: "pause-uuid",
          attendance_log_id: "log-uuid",
          start_date: new Date(),
          end_date: null,
        },
        totalToday: 3600000,
      });

      try {
        await service.endPause("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.attendance_pause_log");
    });

    it("should throw NOT_CLOCKED_IN when not clocked in", async () => {
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: false,
        paused: false,
        activeLog: null,
        activePause: null,
        totalToday: 0,
      });

      await expect(service.endPause("employee-uuid")).rejects.toThrow(
        HttpError,
      );

      try {
        await service.endPause("employee-uuid");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).errorCode).toBe("NOT_CLOCKED_IN");
        expect((error as HttpError).statusCode).toBe(400);
      }
    });

    it("should throw NOT_PAUSED when not paused", async () => {
      jest.spyOn(service, "getStatus").mockResolvedValue({
        clockedIn: true,
        paused: false,
        activeLog: {
          id: "log-uuid",
          employee_id: "employee-uuid",
          start_date: new Date(),
          end_date: null,
        },
        activePause: null,
        totalToday: 3600000,
      });

      await expect(service.endPause("employee-uuid")).rejects.toThrow(
        HttpError,
      );

      try {
        await service.endPause("employee-uuid");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).errorCode).toBe("NOT_PAUSED");
        expect((error as HttpError).statusCode).toBe(400);
      }
    });
  });

  describe("getTotalToday", () => {
    it("should build correct query to get today's attendance logs", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getTotalToday("employee-uuid");
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.attendance_log");
    });
  });
});
