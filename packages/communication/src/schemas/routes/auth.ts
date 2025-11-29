import z from "zod";
import { $route } from "../../utils/route-definition";

export const login = $route({
  path: () => "/auth/login",
  body: z.object({ email: z.email(), password: z.string() }),
  query: z.object({ test: z.string() }),
  data: z.object({ id: z.uuid(), email: z.email() }),
  errorCodes: ["INVALID_CREDENTIALS"],
});

export const logout = $route({
  path: () => "/auth/login",
  body: z.never(),
  query: z.never(),
  data: z.null(),
  errorCodes: [],
});
