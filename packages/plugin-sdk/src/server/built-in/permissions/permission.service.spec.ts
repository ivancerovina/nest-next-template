import { Test, type TestingModule } from "@nestjs/testing";
import { KYSELY } from "../database";
import { PermissionService } from "./permission.service";

describe("PermissionService", () => {
  let service: PermissionService;
  let mockDb: {
    selectFrom: jest.Mock;
    insertInto: jest.Mock;
  };

  const permissionId = "permission-uuid";
  const employeeId = "employee-uuid";
  const positionId = "position-uuid";
  const departmentId = "department-uuid";
  const parentDepartmentId = "parent-department-uuid";

  beforeEach(async () => {
    mockDb = {
      selectFrom: jest.fn(),
      insertInto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: KYSELY,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("hasPermission", () => {
    const createSelectChain = (result: unknown) => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn().mockResolvedValue(result),
    });

    it("should return false when permission does not exist", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain(undefined);

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain); // permission lookup

      const result = await service.hasPermission(
        employeeId,
        "nonexistent.permission",
      );

      expect(result).toBe(false);
    });

    it("should return employee-level access when set (granted)", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: false,
      });
      const employeePermissionChain = createSelectChain({ access: true });

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain) // permission lookup
        .mockReturnValueOnce(employeePermissionChain); // employee_permission lookup

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true);
    });

    it("should return employee-level access when set (denied)", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: true,
      });
      const employeePermissionChain = createSelectChain({ access: false });

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(false);
    });

    it("should return false when employee does not exist", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: true,
      });
      const employeePermissionChain = createSelectChain(undefined); // no employee permission
      const employeeChain = createSelectChain(undefined); // employee not found

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(false);
    });

    it("should return position-level access when employee has no explicit permission", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: false,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: positionId });
      const positionPermissionChain = createSelectChain({ access: true });

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(positionPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true);
    });

    it("should return department-level access when position has no explicit permission", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: false,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: positionId });
      const positionPermissionChain = createSelectChain(undefined);
      const positionChain = createSelectChain({ department_id: departmentId });
      const departmentPermissionChain = createSelectChain({ access: true });

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(positionPermissionChain)
        .mockReturnValueOnce(positionChain)
        .mockReturnValueOnce(departmentPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true);
    });

    it("should traverse up the department tree", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: false,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: positionId });
      const positionPermissionChain = createSelectChain(undefined);
      const positionChain = createSelectChain({ department_id: departmentId });
      const departmentPermissionChain = createSelectChain(undefined); // no permission on dept
      const departmentChain = createSelectChain({
        parent_id: parentDepartmentId,
      }); // has parent
      const parentDepartmentPermissionChain = createSelectChain({
        access: true,
      }); // parent has permission

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(positionPermissionChain)
        .mockReturnValueOnce(positionChain)
        .mockReturnValueOnce(departmentPermissionChain)
        .mockReturnValueOnce(departmentChain)
        .mockReturnValueOnce(parentDepartmentPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true);
    });

    it("should return global permission when no hierarchy permission found", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: false,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: null }); // no position
      const globalPermissionChain = createSelectChain({ access: true });

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(globalPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true);
    });

    it("should return default_access when no permission found at any level", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: true,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: null });
      const globalPermissionChain = createSelectChain(undefined);

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(globalPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true);
    });

    it("should return false (default_access) when no permission found anywhere", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: false,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: null });
      const globalPermissionChain = createSelectChain(undefined);

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(globalPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(false);
    });

    it("should stop at root department (parent_id is null)", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: true,
      });
      const employeePermissionChain = createSelectChain(undefined);
      const employeeChain = createSelectChain({ position_id: positionId });
      const positionPermissionChain = createSelectChain(undefined);
      const positionChain = createSelectChain({ department_id: departmentId });
      const departmentPermissionChain = createSelectChain(undefined);
      const departmentChain = createSelectChain({ parent_id: null }); // root department
      const globalPermissionChain = createSelectChain(undefined);

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain)
        .mockReturnValueOnce(employeeChain)
        .mockReturnValueOnce(positionPermissionChain)
        .mockReturnValueOnce(positionChain)
        .mockReturnValueOnce(departmentPermissionChain)
        .mockReturnValueOnce(departmentChain)
        .mockReturnValueOnce(globalPermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(true); // falls back to default_access
    });

    it("should prioritize employee denial over position grant", async () => {
      const isAdminChain = createSelectChain({ is_admin: false });
      const permissionChain = createSelectChain({
        id: permissionId,
        default_access: true,
      });
      const employeePermissionChain = createSelectChain({ access: false }); // denied at employee level

      mockDb.selectFrom
        .mockReturnValueOnce(isAdminChain) // isAdmin check
        .mockReturnValueOnce(permissionChain)
        .mockReturnValueOnce(employeePermissionChain);

      const result = await service.hasPermission(employeeId, "test.permission");

      expect(result).toBe(false);
    });
  });

  describe("ensureRegistered", () => {
    it("should insert permission with upsert on conflict", async () => {
      const mockExecute = jest.fn().mockResolvedValue([{ id: permissionId }]);
      const mockReturning = jest.fn().mockReturnValue({ execute: mockExecute });
      const mockDoUpdateSet = jest
        .fn()
        .mockReturnValue({ returning: mockReturning });
      const mockColumn = jest
        .fn()
        .mockReturnValue({ doUpdateSet: mockDoUpdateSet });
      const mockOnConflictBuilder = { column: mockColumn };
      const mockOnConflict = jest.fn((callback) => {
        callback(mockOnConflictBuilder);
        return { returning: mockReturning };
      });
      const mockValues = jest
        .fn()
        .mockReturnValue({ onConflict: mockOnConflict });

      mockDb.insertInto.mockReturnValue({ values: mockValues });

      const data = {
        code: "test.permission",
        title: "Test Permission",
        description: "A test permission",
        default_access: false,
      };

      await service.ensureRegistered(data);

      expect(mockDb.insertInto).toHaveBeenCalledWith("core.permission");
      expect(mockValues).toHaveBeenCalledWith(data);
    });
  });
});
