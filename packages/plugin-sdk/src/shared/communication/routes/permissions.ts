import z from "zod";
import { $route } from "../route-definition";

export const hasPermission = $route({
  path: (code: string) => `/permissions/${code}`,
  body: z.never(),
  query: z.never(),
  data: z.boolean(),
  errorCodes: [],
});
