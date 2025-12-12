import { Global, Module } from "@nestjs/common";
import { DatabaseModuleBase } from "./database.module-definition";
import { DatabaseService } from "./database.service";

export const KYSELY = Symbol("KYSELY");

@Global()
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
export class DatabaseModule extends DatabaseModuleBase {}
