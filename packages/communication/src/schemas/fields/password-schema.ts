import z from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_NUMBERS,
  PASSWORD_MIN_SPECIAL,
  PASSWORD_MIN_UPPERCASE,
  passwordRegex,
} from "../../constants";

/**
 * Zod schema for validating password fields with security requirements.
 *
 * Enforces the following constraints:
 * - Minimum length: {@link PASSWORD_MIN_LENGTH} characters
 * - Maximum length: {@link PASSWORD_MAX_LENGTH} characters
 * - Uppercase letters: at least {@link PASSWORD_MIN_UPPERCASE}
 * - Lowercase letters: at least {@link PASSWORD_MIN_LOWERCASE}
 * - Numbers: at least {@link PASSWORD_MIN_NUMBERS}
 * - Special characters: at least {@link PASSWORD_MIN_SPECIAL}
 *
 * @example
 * ```ts
 * // Use in a form schema
 * const registerSchema = z.object({
 *   email: z.string().email(),
 *   password: password,
 * });
 *
 * // Validation
 * password.parse("SecureP@ss123"); // Valid
 * password.parse("weak"); // Throws ZodError
 * ```
 */
export const password = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  )
  .regex(
    passwordRegex.uppercase,
    `Password must contain at least ${PASSWORD_MIN_UPPERCASE} uppercase letter(s)`,
  )
  .regex(
    passwordRegex.lowercase,
    `Password must contain at least ${PASSWORD_MIN_LOWERCASE} lowercase letter(s)`,
  )
  .regex(
    passwordRegex.number,
    `Password must contain at least ${PASSWORD_MIN_NUMBERS} number(s)`,
  )
  .regex(
    passwordRegex.special,
    `Password must contain at least ${PASSWORD_MIN_SPECIAL} special character(s)`,
  );
