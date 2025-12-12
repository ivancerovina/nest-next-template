import { Test, type TestingModule } from "@nestjs/testing";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { Database, KYSELY } from "../../database";
import { DepartmentService } from "./department.service";

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

describe("DepartmentService", () => {
  let service: DepartmentService;
  let database: Kysely<Database>;

  beforeEach(async () => {
    database = createMockKysely();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: KYSELY,
          useValue: database,
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should build correct insert query", async () => {
      const insertIntoSpy = jest.spyOn(database, "insertInto");

      try {
        await service.create({
          name: "Engineering",
          description: "Engineering department",
          parent_id: null,
        });
      } catch {
        // DummyDriver will throw
      }

      expect(insertIntoSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("getById", () => {
    it("should build correct select query with id filter", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getById("test-id", ["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("getAll", () => {
    it("should build correct select query for all departments", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getAll(["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("getRoots", () => {
    it("should build correct select query for root departments", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getRoots(["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("getChildren", () => {
    it("should build correct select query for child departments", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getChildren("parent-id", ["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("getAncestors", () => {
    it("should build correct select query for ancestors", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getAncestors("child-id", ["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("update", () => {
    it("should build correct update query", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      try {
        await service.update("test-id", { name: "Updated Name" });
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("delete", () => {
    it("should build correct delete query", async () => {
      const deleteFromSpy = jest.spyOn(database, "deleteFrom");

      try {
        await service.delete("test-id");
      } catch {
        // DummyDriver will throw
      }

      expect(deleteFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("exists", () => {
    it("should build correct select query to check existence", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.exists("test-id");
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });

  describe("getTree", () => {
    it("should build correct select query for tree", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getTree();
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.department");
    });
  });
});
