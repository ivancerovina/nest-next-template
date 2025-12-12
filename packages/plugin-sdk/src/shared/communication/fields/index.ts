import { z } from "zod";

export const username = z
  .string()
  .min(4)
  .max(32)
  .regex(/^[a-zA-Z0-9_.]+$/);

export const baseEmployee = z.object({
  id: z.uuid(),
  username,
  email: z.email().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  is_admin: z.boolean(),
});

export const password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[\W_]/, {
    message: "Password must contain at least one special character",
  });
