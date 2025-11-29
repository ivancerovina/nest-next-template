import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: {
    mode: "always",
    prefixes: {
      "en-US": "/en",
    },
  },
});
