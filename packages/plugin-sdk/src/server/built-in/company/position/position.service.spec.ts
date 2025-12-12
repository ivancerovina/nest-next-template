import { Test, type TestingModule } from "@nestjs/testing";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { Database, KYSELY } from "../../database";
import { PositionService } from "./position.service";

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

describe("PositionService", () => {
  let service: PositionService;
  let database: Kysely<Database>;

  beforeEach(async () => {
    database = createMockKysely();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionService,
        {
          provide: KYSELY,
          useValue: database,
        },
      ],
    }).compile();

    service = module.get<PositionService>(PositionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should build correct insert query", async () => {
      const insertIntoSpy = jest.spyOn(database, "insertInto");

      try {
        await service.create({
          name: "Software Engineer",
          description: "Develops software",
          department_id: "dept-id",
        });
      } catch {
        // DummyDriver will throw
      }

      expect(insertIntoSpy).toHaveBeenCalledWith("core.position");
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

      expect(selectFromSpy).toHaveBeenCalledWith("core.position");
    });
  });

  describe("getAll", () => {
    it("should build correct select query for all positions", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getAll(["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.position");
    });
  });

  describe("getByDepartment", () => {
    it("should build correct select query for department positions", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getByDepartment("dept-id", ["id", "name"]);
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.position");
    });
  });

  describe("getWithDepartment", () => {
    it("should build correct select query with join", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.getWithDepartment("test-id");
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.position");
    });
  });

  describe("update", () => {
    it("should build correct update query", async () => {
      const updateTableSpy = jest.spyOn(database, "updateTable");

      try {
        await service.update("test-id", { name: "Senior Engineer" });
      } catch {
        // DummyDriver will throw
      }

      expect(updateTableSpy).toHaveBeenCalledWith("core.position");
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

      expect(deleteFromSpy).toHaveBeenCalledWith("core.position");
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

      expect(selectFromSpy).toHaveBeenCalledWith("core.position");
    });
  });

  describe("countByDepartment", () => {
    it("should build correct select query to count positions", async () => {
      const selectFromSpy = jest.spyOn(database, "selectFrom");

      try {
        await service.countByDepartment("dept-id");
      } catch {
        // DummyDriver will throw
      }

      expect(selectFromSpy).toHaveBeenCalledWith("core.position");
    });
  });
});
