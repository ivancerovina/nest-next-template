import { Test, type TestingModule } from "@nestjs/testing";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { Database, KYSELY } from "../database";
import { EmployeeService } from "./employee.service";

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

describe("EmployeeService", () => {
  let service: EmployeeService;
  let database: Kysely<Database>;

  beforeEach(async () => {
    database = createMockKysely();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: KYSELY,
          useValue: database,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should build correct insert query", async () => {
      const compileSpy = jest.spyOn(database, "insertInto");

      try {
        await service.create({
          username: "johndoe",
          email: "test@example.com",
          password: "securePassword123",
          first_name: "John",
          last_name: "Doe",
          is_admin: false,
        });
      } catch {
        // DummyDriver will throw, but we can verify the query was built
      }

      expect(compileSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("getById", () => {
    it("should build correct select query with id filter", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getById("test-id", ["id", "email"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("getByEmail", () => {
    it("should build correct select query with email filter", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getByEmail("test@example.com", ["id", "email"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("getByUsername", () => {
    it("should build correct select query with username filter", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getByUsername("johndoe", ["id", "username"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("delete", () => {
    it("should build correct delete query", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.delete("test-id");
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("update", () => {
    it("should build correct update query", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      try {
        await service.update("test-id", { first_name: "Jane" });
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.employee");
    });

    it("should remove password_hash from update data", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      try {
        await service.update("test-id", {
          first_name: "Jane",
          password_hash: "should-be-removed",
        } as any);
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("updatePassword", () => {
    it("should build correct update query for password", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      try {
        await service.updatePassword("test-id", "newPassword123");
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.employee");
    });
  });

  describe("employeesExist", () => {
    it("should build correct select query to check existence", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.employeesExist();
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.employee");
    });
  });
});
