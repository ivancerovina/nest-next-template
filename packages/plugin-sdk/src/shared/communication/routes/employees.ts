import z from "zod";
import { username } from "../fields";
import { $route } from "../route-definition";

export const firstEmployeeExists = $route({
  path: () => "/employees/first-employee-exists",
  body: z.never(),
  query: z.never(),
  data: z.object({
    firstEmployeeExists: z.boolean(),
  }),
  errorCodes: [],
});

export const createFirstEmployee = $route({
  path: () => "/employees/create-first-employee",
  body: z.object({
    username,
    email: z.email().optional(),
    password: z.string().min(8).max(100),
    first_name: z.string(),
    last_name: z.string(),
  }),
  query: z.never(),
  data: z.object({
    id: z.string(),
  }),
  errorCodes: [],
});
