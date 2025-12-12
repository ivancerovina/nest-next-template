import { $route } from "@common/plugin-sdk/shared";
import { z } from "zod";

export const create = $route({
  path: () => "/create",
  query: z.never(),
  body: z.object({
    name: z.string().min(2).max(100),
    age: z.number().min(0).max(150),
  }),
  data: z.object({
    id: z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  errorCodes: [],
});
