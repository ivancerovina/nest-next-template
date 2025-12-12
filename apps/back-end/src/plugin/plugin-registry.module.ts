import {
  Logger,
  Module,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { plugins } from "virtual-external-plugins";
import { PluginRegistryService } from "./plugin-registry.service";

const pluginModules = plugins.filter((p) => p.module).map((p) => p.module);

@Module({
  imports: pluginModules,
  providers: [PluginRegistryService],
  exports: [...pluginModules, PluginRegistryService],
})
export class PluginRegistryModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PluginRegistryModule.name);

  constructor(private readonly pluginRegistry: PluginRegistryService) {}

  async onModuleInit() {
    this.logger.debug(`Found ${pluginModules.length} plugin module(s).`);
    await this.pluginRegistry.runMigrations();
  }

  async onModuleDestroy() {}
}
