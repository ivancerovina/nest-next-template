import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { PermissionGuard } from "./permission.guard";
import { PermissionService } from "./permission.service";
import { PERMISSION_KEY } from "./require-permission.decorator";

describe("PermissionGuard", () => {
  let guard: PermissionGuard;
  let reflector: jest.Mocked<Reflector>;
  let permissionService: jest.Mocked<PermissionService>;

  const userId = "test-user-id";
  const permissionCode = "test.permission";

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const mockPermissionService = {
      hasPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    reflector = module.get(Reflector);
    permissionService = module.get(PermissionService);
  });

  const createMockExecutionContext = (session: unknown) => {
    const mockHandler = jest.fn();
    const mockClass = jest.fn();

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          session,
        }),
      }),
      getHandler: () => mockHandler,
      getClass: () => mockClass,
    } as unknown as ExecutionContext;
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true when no permission is required", async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext({ user: { id: userId } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(permissionService.hasPermission).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when user is not authenticated", async () => {
      reflector.getAllAndOverride.mockReturnValue(permissionCode);
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        "User is not authenticated",
      );
    });

    it("should throw UnauthorizedException when session has no user", async () => {
      reflector.getAllAndOverride.mockReturnValue(permissionCode);
      const context = createMockExecutionContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw ForbiddenException when user lacks permission", async () => {
      reflector.getAllAndOverride.mockReturnValue(permissionCode);
      permissionService.hasPermission.mockResolvedValue(false);
      const context = createMockExecutionContext({ user: { id: userId } });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        "User does not have permission",
      );
    });

    it("should return true when user has permission", async () => {
      reflector.getAllAndOverride.mockReturnValue(permissionCode);
      permissionService.hasPermission.mockResolvedValue(true);
      const context = createMockExecutionContext({ user: { id: userId } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        userId,
        permissionCode,
      );
    });

    it("should call hasPermission with correct arguments", async () => {
      reflector.getAllAndOverride.mockReturnValue("custom.permission");
      permissionService.hasPermission.mockResolvedValue(true);
      const context = createMockExecutionContext({ user: { id: "custom-id" } });

      await guard.canActivate(context);

      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        "custom-id",
        "custom.permission",
      );
    });

    it("should read permission from reflector with correct keys", async () => {
      reflector.getAllAndOverride.mockReturnValue(permissionCode);
      permissionService.hasPermission.mockResolvedValue(true);
      const context = createMockExecutionContext({ user: { id: userId } });

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
