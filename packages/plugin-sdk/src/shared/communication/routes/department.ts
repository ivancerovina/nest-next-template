import z from "zod";
import { $route } from "../route-definition";

const baseDepartment = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  parent_id: z.uuid().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

type DepartmentTreeNode = z.infer<typeof baseDepartment> & {
  children: DepartmentTreeNode[];
};

const departmentTreeNode: z.ZodType<DepartmentTreeNode> = baseDepartment.extend(
  {
    children: z.lazy(() => z.array(departmentTreeNode)),
  },
);

export const create = $route({
  path: () => "/departments",
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).nullable().optional(),
    parent_id: z.uuid().nullable().optional(),
  }),
  query: z.never(),
  data: z.object({
    id: z.uuid(),
  }),
  errorCodes: ["PARENT_NOT_FOUND"],
});

export const getById = $route({
  path: (id: string) => `/departments/${id}`,
  body: z.never(),
  query: z.never(),
  data: z.object({
    department: baseDepartment,
  }),
  errorCodes: ["DEPARTMENT_NOT_FOUND"],
});

export const getAll = $route({
  path: () => "/departments",
  body: z.never(),
  query: z.object({
    roots_only: z.coerce.boolean().optional(),
  }),
  data: z.object({
    departments: z.array(baseDepartment),
  }),
  errorCodes: [],
});

export const getChildren = $route({
  path: (id: string) => `/departments/${id}/children`,
  body: z.never(),
  query: z.never(),
  data: z.object({
    departments: z.array(baseDepartment),
  }),
  errorCodes: ["DEPARTMENT_NOT_FOUND"],
});

export const getAncestors = $route({
  path: (id: string) => `/departments/${id}/ancestors`,
  body: z.never(),
  query: z.never(),
  data: z.object({
    departments: z.array(baseDepartment),
  }),
  errorCodes: ["DEPARTMENT_NOT_FOUND"],
});

export const update = $route({
  path: (id: string) => `/departments/${id}`,
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    parent_id: z.uuid().nullable().optional(),
  }),
  query: z.never(),
  data: z.object({
    id: z.uuid(),
  }),
  errorCodes: [
    "DEPARTMENT_NOT_FOUND",
    "PARENT_NOT_FOUND",
    "CIRCULAR_REFERENCE",
  ],
});

export const remove = $route({
  path: (id: string) => `/departments/${id}`,
  body: z.never(),
  query: z.never(),
  data: z.object({
    id: z.uuid(),
  }),
  errorCodes: ["DEPARTMENT_NOT_FOUND"],
});

export const getTree = $route({
  path: () => "/departments/tree",
  body: z.never(),
  query: z.never(),
  data: z.object({
    tree: z.array(departmentTreeNode),
  }),
  errorCodes: [],
});
