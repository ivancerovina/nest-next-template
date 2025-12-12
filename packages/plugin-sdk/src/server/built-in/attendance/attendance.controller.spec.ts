import { Test, type TestingModule } from "@nestjs/testing";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";

describe("AttendanceController", () => {
  let controller: AttendanceController;
  let attendanceService: jest.Mocked<AttendanceService>;

  const mockEmployeeId = "employee-uuid";
  const mockAttendanceLogId = "attendance-log-uuid";
  const mockPauseLogId = "pause-log-uuid";

  const mockAttendanceLog = {
    id: mockAttendanceLogId,
    employee_id: mockEmployeeId,
    start_date: new Date("2024-01-01T09:00:00Z"),
    end_date: null,
  };

  const mockPauseLog = {
    id: mockPauseLogId,
    attendance_log_id: mockAttendanceLogId,
    start_date: new Date("2024-01-01T12:00:00Z"),
    end_date: null,
  };

  const createMockRequest = (userId: string) =>
    ({
      session: {
        user: { id: userId },
      },
    }) as any;

  beforeEach(async () => {
    const mockAttendanceService = {
      getStatus: jest.fn(),
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      startPause: jest.fn(),
      endPause: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    attendanceService = module.get(AttendanceService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("status", () => {
    it("should return status from attendance service", async () => {
      const mockStatus = {
        clockedIn: true,
        paused: false,
        activeLog: mockAttendanceLog,
        activePause: null,
        totalToday: 3600000,
      };
      attendanceService.getStatus.mockResolvedValue(mockStatus);
      const mockReq = createMockRequest(mockEmployeeId);

      const result = await controller.status(mockReq);

      expect(result).toEqual(mockStatus);
      expect(attendanceService.getStatus).toHaveBeenCalledWith(mockEmployeeId);
    });
  });

  describe("clockIn", () => {
    it("should call attendance service clockIn with user id", async () => {
      attendanceService.clockIn.mockResolvedValue(mockAttendanceLog);
      const mockReq = createMockRequest(mockEmployeeId);

      const result = await controller.clockIn(mockReq);

      expect(result).toEqual(mockAttendanceLog);
      expect(attendanceService.clockIn).toHaveBeenCalledWith(mockEmployeeId);
    });
  });

  describe("clockOut", () => {
    it("should call attendance service clockOut with user id", async () => {
      const completedLog = { ...mockAttendanceLog, end_date: new Date() };
      attendanceService.clockOut.mockResolvedValue(completedLog);
      const mockReq = createMockRequest(mockEmployeeId);

      const result = await controller.clockOut(mockReq);

      expect(result).toEqual(completedLog);
      expect(attendanceService.clockOut).toHaveBeenCalledWith(mockEmployeeId);
    });
  });

  describe("pause", () => {
    it("should call attendance service startPause with user id", async () => {
      attendanceService.startPause.mockResolvedValue(mockPauseLog);
      const mockReq = createMockRequest(mockEmployeeId);

      const result = await controller.pause(mockReq);

      expect(result).toEqual(mockPauseLog);
      expect(attendanceService.startPause).toHaveBeenCalledWith(mockEmployeeId);
    });
  });

  describe("unpause", () => {
    it("should call attendance service endPause with user id", async () => {
      const completedPause = { ...mockPauseLog, end_date: new Date() };
      attendanceService.endPause.mockResolvedValue(completedPause);
      const mockReq = createMockRequest(mockEmployeeId);

      const result = await controller.unpause(mockReq);

      expect(result).toEqual(completedPause);
      expect(attendanceService.endPause).toHaveBeenCalledWith(mockEmployeeId);
    });
  });
});
