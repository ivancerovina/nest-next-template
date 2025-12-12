import { Selectable } from "kysely";
import { Permission } from "./entities";

export type PermissionData = Pick<
  Selectable<Permission>,
  "code" | "title" | "description" | "default_access"
>;
