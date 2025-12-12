import { Test, type TestingModule } from "@nestjs/testing";
import {
  DummyDriver,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { KYSELY_OPTIONS } from "./database.module-definition";
import { DatabaseService } from "./database.service";

describe("DatabaseService", () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: KYSELY_OPTIONS,
          useValue: {
            dialect: {
              createAdapter: () => new PostgresAdapter(),
              createDriver: () => new DummyDriver(),
              createIntrospector: (db: DatabaseService) =>
                new PostgresIntrospector(db),
              createQueryCompiler: () => new PostgresQueryCompiler(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
