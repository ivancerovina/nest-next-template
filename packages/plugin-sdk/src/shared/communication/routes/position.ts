import z from "zod";
import { $route } from "../route-definition";

const basePosition = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  department_id: z.uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const positionWithDepartment = basePosition.extend({
  department_name: z.string(),
});

export const create = $route({
  path: () => "/positions",
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).nullable().optional(),
    department_id: z.uuid(),
  }),
  query: z.never(),
  data: z.object({
    id: z.uuid(),
  }),
  errorCodes: ["DEPARTMENT_NOT_FOUND"],
});

export const getById = $route({
  path: (id: string) => `/positions/${id}`,
  body: z.never(),
  query: z.object({
    include_department: z.coerce.boolean().optional(),
  }),
  data: z.object({
    position: basePosition.or(positionWithDepartment),
  }),
  errorCodes: ["POSITION_NOT_FOUND"],
});

export const getAll = $route({
  path: () => "/positions",
  body: z.never(),
  query: z.object({
    department_id: z.uuid().optional(),
  }),
  data: z.object({
    positions: z.array(basePosition),
  }),
  errorCodes: [],
});

export const getByDepartment = $route({
  path: (departmentId: string) => `/departments/${departmentId}/positions`,
  body: z.never(),
  query: z.never(),
  data: z.object({
    positions: z.array(basePosition),
  }),
  errorCodes: ["DEPARTMENT_NOT_FOUND"],
});

export const update = $route({
  path: (id: string) => `/positions/${id}`,
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    department_id: z.uuid().optional(),
  }),
  query: z.never(),
  data: z.object({
    id: z.uuid(),
  }),
  errorCodes: ["POSITION_NOT_FOUND", "DEPARTMENT_NOT_FOUND"],
});

export const remove = $route({
  path: (id: string) => `/positions/${id}`,
  body: z.never(),
  query: z.never(),
  data: z.object({
    id: z.uuid(),
  }),
  errorCodes: ["POSITION_NOT_FOUND"],
});
