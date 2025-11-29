import { Module } from "@nestjs/common";
import { DatabaseModuleBase } from "./database.module-definition";
import { DatabaseService } from "./database.service";

export const KYSELY = Symbol("KYSELY");

@Module({
  providers: [
    DatabaseService,
    {
      provide: KYSELY,
      useExisting: DatabaseService,
    },
  ],
  exports: [DatabaseService, KYSELY],
})
@Module({
  providers: [
    DatabaseService,
    { provide: KYSELY, useExisting: DatabaseService },
  ],
  exports: [KYSELY],
})
export class DatabaseModule extends DatabaseModuleBase {}
