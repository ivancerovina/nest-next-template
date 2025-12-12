import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { KyselyConfig } from "kysely";

export const {
  ConfigurableModuleClass: DatabaseModuleBase,
  MODULE_OPTIONS_TOKEN: KYSELY_OPTIONS,
} = new ConfigurableModuleBuilder<KyselyConfig>().build();
