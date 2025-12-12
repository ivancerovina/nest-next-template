import z from "zod";
import { $route } from "../route-definition";

export const systemInfo = $route({
  path: () => "/system",
  body: z.never(),
  query: z.never(),
  data: z.object({
    uptime: z.number(),
    memory: z.object({
      rss: z.number(),
      heapTotal: z.number(),
      heapUsed: z.number(),
    }),
  }),
  errorCodes: [],
});
