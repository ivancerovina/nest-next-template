import type { DynamicModule, Type } from "@nestjs/common";

export type ServerPluginModule = Type | DynamicModule;

export type ServerPluginDefinition<
  T extends ServerPluginModule = ServerPluginModule,
> = {
  module: T;
};
