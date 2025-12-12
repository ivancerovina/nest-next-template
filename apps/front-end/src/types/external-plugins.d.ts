declare module "virtual:external-plugins" {
  import { ClientPluginDefinition } from "@common/plugin-sdk/client";

  export interface ExternalPlugin extends ClientPluginDefinition {
    __name: string;
    __displayName?: string;
  }

  export const plugins: ExternalPlugin[];
}
