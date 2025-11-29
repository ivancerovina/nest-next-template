import { Module } from "@nestjs/common";
import { ConfigModule, type ConfigType } from "@nestjs/config";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DatabaseModule } from "@/database";
import { databaseConfig } from "./configs";

@Module({
  imports: [
    ConfigModule.forRoot({ load: [databaseConfig] }),
    DatabaseModule.registerAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => {
        const pool = new Pool(config);

        return {
          dialect: new PostgresDialect({ pool }),
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
