import "@/database";
import type { Generated } from "kysely";

interface User {
  id: Generated<number>;
  first_name: string;
}

declare module "@/database" {
  interface Tables {
    users: User;
  }
}
