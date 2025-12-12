declare module "virtual-external-plugins" {
  import type { DynamicModule, Type } from "@nestjs/common";

  interface ServerPluginDefinition {
    module: Type | DynamicModule;
  }

  interface ExternalPlugin extends ServerPluginDefinition {
    __name: string;
    __displayName?: string;
  }

  export const plugins: ExternalPlugin[];
}
