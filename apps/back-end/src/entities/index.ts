import "@/database";
import type { User } from "./user.model";

declare module "@/database" {
  interface Tables {
    users: User;
  }
}
