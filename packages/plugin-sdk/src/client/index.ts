export * from "./lib";
export * from "./types";

import type { ClientPluginDefinition } from "./types";

export function defineClientPlugin(
  definition: ClientPluginDefinition,
): ClientPluginDefinition {
  return definition;
}
