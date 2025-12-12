import type { builtInFields } from "@common/plugin-sdk/shared";
import type { z } from "zod";

export type TUser = z.infer<typeof builtInFields.baseUser>;
export type TAuthAtom = {
  user?: TUser;
  loading: boolean;
};
