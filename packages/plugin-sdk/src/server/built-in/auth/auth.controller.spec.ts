import { Test, type TestingModule } from "@nestjs/testing";
import { HttpError } from "../../utils";
import { EmployeeService } from "../employee";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let employeeService: jest.Mocked<EmployeeService>;

  const mockEmployee = {
    id: "test-uuid",
    username: "johndoe",
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe",
    is_admin: false,
    disabled_at: null,
  };

  const createMockRequest = (sessionData: Record<string, unknown> = {}) => {
    const session = {
      ...sessionData,
      destroy: jest.fn((callback: (err: Error | null) => void) => {
        callback(null);
      }),
    };
    return { session } as any;
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateCredentials: jest.fn(),
    };

    const mockEmployeeService = {
      getById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    employeeService = module.get(EmployeeService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return employee data on successful login with email", async () => {
      authService.validateCredentials.mockResolvedValue(mockEmployee);
      const mockReq = createMockRequest();

      const result = await controller.login(
        { identifier: "test@example.com", password: "correctPassword" },
        mockReq,
      );

      expect(result).toEqual({ employee: mockEmployee });
      expect(mockReq.session.user).toEqual({ id: mockEmployee.id });
    });

    it("should return employee data on successful login with username", async () => {
      authService.validateCredentials.mockResolvedValue(mockEmployee);
      const mockReq = createMockRequest();

      const result = await controller.login(
        { identifier: "johndoe", password: "correctPassword" },
        mockReq,
      );

      expect(result).toEqual({ employee: mockEmployee });
      expect(mockReq.session.user).toEqual({ id: mockEmployee.id });
    });

    it("should throw HttpError with 401 on invalid credentials", async () => {
      authService.validateCredentials.mockResolvedValue(null);
      const mockReq = createMockRequest();

      await expect(
        controller.login(
          { identifier: "test@example.com", password: "wrongPassword" },
          mockReq,
        ),
      ).rejects.toThrow(HttpError);

      try {
        await controller.login(
          { identifier: "test@example.com", password: "wrongPassword" },
          mockReq,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).statusCode).toBe(401);
        expect((error as HttpError).errorCode).toBe("INVALID_CREDENTIALS");
      }
    });

    it("should call authService.validateCredentials with identifier and password", async () => {
      authService.validateCredentials.mockResolvedValue(mockEmployee);
      const mockReq = createMockRequest();

      await controller.login(
        { identifier: "test@example.com", password: "testPassword" },
        mockReq,
      );

      expect(authService.validateCredentials).toHaveBeenCalledWith(
        "test@example.com",
        "testPassword",
      );
    });
  });

  describe("logout", () => {
    it("should destroy session and return null", async () => {
      const mockReq = createMockRequest({ user: { id: mockEmployee.id } });

      const result = await controller.logout(mockReq);

      expect(result).toBeNull();
      expect(mockReq.session.destroy).toHaveBeenCalled();
    });

    it("should reject if session destroy fails", async () => {
      const destroyError = new Error("Session destroy failed");
      const mockReq = {
        session: {
          destroy: jest.fn((callback: (err: Error | null) => void) => {
            callback(destroyError);
          }),
        },
      } as any;

      await expect(controller.logout(mockReq)).rejects.toThrow(
        "Session destroy failed",
      );
    });
  });

  describe("session", () => {
    it("should return employee data when authenticated", async () => {
      const mockReq = createMockRequest({ user: { id: mockEmployee.id } });
      employeeService.getById.mockResolvedValue(mockEmployee);

      const result = await controller.session(mockReq);

      expect(result).toEqual({ employee: mockEmployee });
      expect(employeeService.getById).toHaveBeenCalledWith(mockEmployee.id, [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_admin",
        "disabled_at",
      ]);
    });

    it("should throw HttpError with 401 when session has no user", async () => {
      const mockReq = createMockRequest();

      await expect(controller.session(mockReq)).rejects.toThrow(HttpError);

      try {
        await controller.session(mockReq);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).statusCode).toBe(401);
        expect((error as HttpError).errorCode).toBe("UNAUTHORIZED");
      }
    });

    it("should throw HttpError with 404 when employee not found", async () => {
      const mockReq = createMockRequest({ user: { id: "nonexistent-id" } });
      employeeService.getById.mockResolvedValue(undefined);

      await expect(controller.session(mockReq)).rejects.toThrow(HttpError);

      try {
        await controller.session(mockReq);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).statusCode).toBe(404);
        expect((error as HttpError).errorCode).toBe("USER_NOT_FOUND");
      }
    });

    it("should throw HttpError with 404 when employee is disabled", async () => {
      const disabledEmployee = {
        ...mockEmployee,
        disabled_at: new Date("2024-01-01"),
      };
      const mockReq = createMockRequest({ user: { id: mockEmployee.id } });
      employeeService.getById.mockResolvedValue(disabledEmployee);

      await expect(controller.session(mockReq)).rejects.toThrow(HttpError);

      try {
        await controller.session(mockReq);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).statusCode).toBe(404);
        expect((error as HttpError).errorCode).toBe("USER_NOT_FOUND");
      }
    });

    it("should destroy session when employee not found or disabled", async () => {
      const mockReq = createMockRequest({ user: { id: "nonexistent-id" } });
      employeeService.getById.mockResolvedValue(undefined);

      try {
        await controller.session(mockReq);
      } catch {
        // Expected to throw
      }

      expect(mockReq.session.destroy).toHaveBeenCalled();
    });
  });
});
