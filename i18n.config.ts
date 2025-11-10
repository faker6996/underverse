import { LOCALE } from "@/lib/constants/enum";

// Keep in sync with i18n/routing.ts
export const locales = [LOCALE.EN, LOCALE.VI, LOCALE.KO, LOCALE.JA] as const;
export const defaultLocale = LOCALE.VI;
export type Locale = (typeof locales)[number];
