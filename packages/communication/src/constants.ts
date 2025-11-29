// Password related constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_MIN_UPPERCASE = 1;
export const PASSWORD_MIN_LOWERCASE = 1;
export const PASSWORD_MIN_NUMBERS = 1;
export const PASSWORD_MIN_SPECIAL = 1;
export const PASSWORD_SPECIAL_CHARS =
  "!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?~`";

// Password related regex
export const passwordRegex = {
  uppercase: new RegExp(`(?=(.*[A-Z]){${PASSWORD_MIN_UPPERCASE}})`),
  lowercase: new RegExp(`(?=(.*[a-z]){${PASSWORD_MIN_LOWERCASE}})`),
  number: new RegExp(`(?=(.*\\d){${PASSWORD_MIN_NUMBERS}})`),
  special: new RegExp(
    `(?=(.*[${PASSWORD_SPECIAL_CHARS}]){${PASSWORD_MIN_SPECIAL}})`,
  ),
};
