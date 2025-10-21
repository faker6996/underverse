import { defineRouting } from "next-intl/routing";
import { LOCALE } from "@/lib/constants/enum";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [LOCALE.EN, LOCALE.VI],

  // Used when no locale matches
  defaultLocale: LOCALE.VI,
  
  // Always show locale in URL
  localePrefix: "always",
  
  // Automatically detect locale from browser
  localeDetection: true
});
