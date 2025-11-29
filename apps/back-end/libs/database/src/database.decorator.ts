import { Inject } from "@nestjs/common";
import { KYSELY } from "./database.module";

export function InjectKysely() {
  return Inject(KYSELY);
}
