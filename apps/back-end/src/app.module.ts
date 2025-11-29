import { $schema } from "@common/communication";
import { Module } from "@nestjs/common";
import { ConfigModule, type ConfigType } from "@nestjs/config";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DatabaseModule } from "@/database";
import { databaseConfig } from "./configs";

console.info(
  $schema.routes.login.body.parse({
    email: "ivancerovina@gmail.com",
    password: "TestPassword1234$$",
  }),
);

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
