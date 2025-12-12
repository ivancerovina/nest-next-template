import { Controller, Get } from "@nestjs/common";
import z from "zod";
import { builtInRoutes } from "../../../shared";

@Controller("system")
export class SystemController {
  @Get()
  async getSystemInfo(): Promise<
    z.infer<typeof builtInRoutes.system.systemInfo.response.data>
  > {
    const memory = process.memoryUsage();

    return {
      uptime: process.uptime(),
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
      },
    };
  }
}
