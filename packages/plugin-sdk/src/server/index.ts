import type { ServerPluginDefinition, ServerPluginModule } from "./types";

export function defineServerPlugin<T extends ServerPluginModule>(
  module: T,
): ServerPluginDefinition<T> {
  return { module };
}

export * from "./built-in";
export * as coreMigrations from "./migrations";
export * from "./plugin";
export type { ServerPluginDefinition, ServerPluginModule } from "./types";
export * from "./utils";
