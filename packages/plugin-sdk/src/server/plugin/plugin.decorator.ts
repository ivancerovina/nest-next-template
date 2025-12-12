import { Module, type ModuleMetadata } from "@nestjs/common";
import type { Migration } from "kysely";

export const PLUGIN_KEY = Symbol("PLUGIN");

export interface PluginData {
  migrations?: Record<string, Migration>;
}

export interface PluginMetadata extends ModuleMetadata, PluginData {}

/**
 * Decorator that marks this class as a plugin module.
 * @param metadata Module metadata and plugin-specific metadata.
 */
export function Plugin(metadata: PluginMetadata): ClassDecorator {
  const { migrations, ...moduleMetadata } = metadata;

  return (target) => {
    const pluginData: PluginData = {
      migrations,
    };

    Reflect.defineMetadata(PLUGIN_KEY, pluginData, target);
    Module(moduleMetadata)(target);
  };
}
