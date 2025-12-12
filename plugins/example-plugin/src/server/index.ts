import { defineServerPlugin, Plugin } from "@common/plugin-sdk/server";
import { CatsController } from "./test.controller";

@Plugin({
  controllers: [CatsController],
  providers: [],
  exports: [],
  migrations: {},
})
export class ExamplePluginModule {}

export default defineServerPlugin(ExamplePluginModule);
