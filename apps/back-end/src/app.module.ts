import {
  AttendanceModule,
  AuthModule,
  CompanyModule,
  DatabaseModule,
  EmployeeModule,
  PermissionModule,
  SystemModule,
} from "@common/plugin-sdk/server";
import { Module } from "@nestjs/common";
import { ConfigModule, type ConfigType } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { databaseConfig } from "./configs";
import { PluginRegistryModule } from "./plugin/plugin-registry.module";

const BUILT_IN_MODULES = [
  PluginRegistryModule,
  AuthModule,
  PermissionModule,
  EmployeeModule,
  SystemModule,
  CompanyModule,
  AttendanceModule,
] as const;

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
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 3,
      },
      {
        name: "medium",
        ttl: 10000,
        limit: 20,
      },
      {
        name: "long",
        ttl: 60000,
        limit: 100,
      },
    ]),
    ...BUILT_IN_MODULES,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
