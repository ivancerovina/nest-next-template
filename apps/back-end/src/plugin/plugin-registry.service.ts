import {
  coreMigrations,
  type Database,
  InjectKysely,
  PLUGIN_KEY,
  type PluginData,
} from "@common/plugin-sdk/server";
import { Injectable, Logger } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { type Kysely, type Migration, Migrator } from "kysely";

@Injectable()
export class PluginRegistryService {
  private readonly logger = new Logger(PluginRegistryService.name);

  constructor(
    private readonly modulesContainer: ModulesContainer,
    @InjectKysely() private readonly database: Kysely<Database>,
  ) {}

  /**
   * Retrieves all plugin data from registered modules.
   */
  public findAll(): PluginData[] {
    const plugins: PluginData[] = [];

    for (const module of this.modulesContainer.values()) {
      const pluginData = Reflect.getMetadata(PLUGIN_KEY, module.metatype) as
        | PluginData
        | undefined;

      if (pluginData) {
        plugins.push(pluginData);
      }
    }

    return plugins;
  }

  /**
   * Collects all migrations from core and plugins.
   */
  private collectMigrations(): Record<string, Migration> {
    const allMigrations: Record<string, Migration> = {};

    for (const plugin of this.findAll()) {
      if (plugin.migrations) {
        Object.assign(allMigrations, plugin.migrations);
      }
    }

    return allMigrations;
  }

  /**
   * Runs all pending migrations.
   */
  public async runMigrations(): Promise<void> {
    const pluginMigrations = this.collectMigrations();

    this.logger.debug(
      `Found ${Object.keys(coreMigrations).length} core migration(s).`,
    );
    this.logger.debug(
      `Found ${Object.keys(pluginMigrations).length} plugin migration(s).`,
    );

    const allMigrations = { ...pluginMigrations, ...coreMigrations };

    if (Object.keys(allMigrations).length === 0) {
      return;
    }

    const migrator = new Migrator({
      db: this.database,
      provider: {
        getMigrations: async () => allMigrations,
      },
    });

    this.logger.log("Running migrations...");

    const { error, results } = await migrator.migrateToLatest();

    for (const result of results ?? []) {
      if (result.status === "Success") {
        this.logger.log(
          `Migration "${result.migrationName}" was executed successfully.`,
        );
      } else if (result.status === "Error") {
        this.logger.error(`Migration "${result.migrationName}" failed.`);
      } else if (result.status === "NotExecuted") {
        this.logger.log(`Migration "${result.migrationName}" was skipped.`);
      }
    }

    if (error) {
      this.logger.error("Migration failed:", error);
      throw error;
    }

    this.logger.log("Migrations completed.");
  }
}
