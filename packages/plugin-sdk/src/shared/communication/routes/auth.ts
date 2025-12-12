import z from "zod";
import { baseEmployee } from "../fields";
import { $route } from "../route-definition";

export const session = $route({
  path: () => "/auth/session",
  body: z.never(),
  query: z.never(),
  data: z.object({
    employee: baseEmployee,
  }),
  errorCodes: [],
});

export const login = $route({
  path: () => "/auth/login",
  body: z.object({
    identifier: z.email().or(z.string()),
    password: z.string(),
  }),
  query: z.never(),
  data: z.object({
    employee: baseEmployee,
  }),
  errorCodes: ["INVALID_CREDENTIALS"],
});

export const logout = $route({
  path: () => "/auth/logout",
  body: z.never(),
  query: z.never(),
  data: z.null(),
  errorCodes: [],
});
