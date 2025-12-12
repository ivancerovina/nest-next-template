import { Test, type TestingModule } from "@nestjs/testing";
import argon2 from "argon2";
import { EmployeeService } from "../employee";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let employeeService: jest.Mocked<EmployeeService>;

  const mockEmployee = {
    id: "test-uuid",
    username: "johndoe",
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe",
    is_admin: false,
    password_hash: "",
  };

  beforeEach(async () => {
    const mockEmployeeService = {
      getByEmail: jest.fn(),
      getByUsername: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    employeeService = module.get(EmployeeService);

    mockEmployee.password_hash = await argon2.hash("correctPassword");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateCredentials", () => {
    const expectedSelect = [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "is_admin",
      "password_hash",
    ];

    it("should return employee data when credentials are valid (email)", async () => {
      employeeService.getByEmail.mockResolvedValue(mockEmployee);

      const result = await service.validateCredentials(
        "test@example.com",
        "correctPassword",
      );

      expect(result).toEqual({
        id: mockEmployee.id,
        username: mockEmployee.username,
        email: mockEmployee.email,
        first_name: mockEmployee.first_name,
        last_name: mockEmployee.last_name,
        is_admin: mockEmployee.is_admin,
      });
      expect(result).not.toHaveProperty("password_hash");
    });

    it("should return employee data when credentials are valid (username)", async () => {
      employeeService.getByUsername.mockResolvedValue(mockEmployee);

      const result = await service.validateCredentials(
        "johndoe",
        "correctPassword",
      );

      expect(result).toEqual({
        id: mockEmployee.id,
        username: mockEmployee.username,
        email: mockEmployee.email,
        first_name: mockEmployee.first_name,
        last_name: mockEmployee.last_name,
        is_admin: mockEmployee.is_admin,
      });
      expect(result).not.toHaveProperty("password_hash");
    });

    it("should return null when employee is not found by email", async () => {
      employeeService.getByEmail.mockResolvedValue(undefined);

      const result = await service.validateCredentials(
        "nonexistent@example.com",
        "anyPassword",
      );

      expect(result).toBeNull();
    });

    it("should return null when employee is not found by username", async () => {
      employeeService.getByUsername.mockResolvedValue(undefined);

      const result = await service.validateCredentials(
        "nonexistentuser",
        "anyPassword",
      );

      expect(result).toBeNull();
    });

    it("should return null when password is incorrect", async () => {
      employeeService.getByEmail.mockResolvedValue(mockEmployee);

      const result = await service.validateCredentials(
        "test@example.com",
        "wrongPassword",
      );

      expect(result).toBeNull();
    });

    it("should call employeeService.getByEmail when identifier is email", async () => {
      employeeService.getByEmail.mockResolvedValue(undefined);

      await service.validateCredentials("test@example.com", "anyPassword");

      expect(employeeService.getByEmail).toHaveBeenCalledWith(
        "test@example.com",
        expectedSelect,
      );
      expect(employeeService.getByUsername).not.toHaveBeenCalled();
    });

    it("should call employeeService.getByUsername when identifier is not email", async () => {
      employeeService.getByUsername.mockResolvedValue(undefined);

      await service.validateCredentials("johndoe", "anyPassword");

      expect(employeeService.getByUsername).toHaveBeenCalledWith(
        "johndoe",
        expectedSelect,
      );
      expect(employeeService.getByEmail).not.toHaveBeenCalled();
    });
  });
});
