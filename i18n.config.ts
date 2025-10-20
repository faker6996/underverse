import { LOCALE } from "@/lib/constants/enum";

export const locales = [LOCALE.EN, LOCALE.VI] as const;
export const defaultLocale = LOCALE.VI;
export type Locale = (typeof locales)[number];
