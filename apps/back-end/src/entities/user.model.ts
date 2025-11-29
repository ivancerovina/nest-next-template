import type { Generated } from "kysely";

export type User = {
  id: Generated<string>;
  email: string;
};
