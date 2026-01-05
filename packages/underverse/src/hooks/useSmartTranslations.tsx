"use client";

import * as React from "react";
import { useUnderverseTranslations, useUnderverseLocale, type Locale } from "../contexts/TranslationContext";

/**
 * Try to dynamically import next-intl hooks.
 * This allows the package to work with or without next-intl.
 */
let nextIntlHooks: {
  useTranslations?: (namespace: string) => (key: string) => string;
  useLocale?: () => string;
} | null = null;

// Try to load next-intl at module initialization
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nextIntl = require("next-intl");
  nextIntlHooks = {
    useTranslations: nextIntl.useTranslations,
    useLocale: nextIntl.useLocale,
  };
} catch {
  // next-intl not available, will use internal translations
  nextIntlHooks = null;
}

/**
 * Context to force using internal translations even when next-intl is available.
 * Useful for testing or when you want to use the package's built-in translations.
 */
const ForceInternalContext = React.createContext(false);

export const ForceInternalTranslationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ForceInternalContext.Provider value={true}>{children}</ForceInternalContext.Provider>;
};

/**
 * Smart translation hook that:
 * 1. Uses next-intl if available and not forced to use internal
 * 2. Falls back to internal TranslationContext
 * 3. Falls back to English defaults if no provider is available
 *
 * @param namespace - The translation namespace (e.g., "DatePicker", "Common")
 * @returns A function that takes a key and returns the translated string
 *
 * @example
 * ```tsx
 * // Works in Next.js with next-intl
 * // Works in React without next-intl
 * // Works without any provider (English fallback)
 * const t = useSmartTranslations("DatePicker");
 * console.log(t("clear")); // "Clear" or translated value
 * ```
 */
export function useSmartTranslations(namespace: string): (key: string) => string {
  const forceInternal = React.useContext(ForceInternalContext);
  const internalT = useUnderverseTranslations(namespace);

  // If forced to use internal or next-intl is not available, use internal
  if (forceInternal || !nextIntlHooks?.useTranslations) {
    return internalT;
  }

  // Try to use next-intl
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const nextIntlT = nextIntlHooks.useTranslations(namespace);
    return nextIntlT;
  } catch {
    // If next-intl throws (e.g., no provider), fall back to internal
    return internalT;
  }
}

/**
 * Smart locale hook that:
 * 1. Uses next-intl if available
 * 2. Falls back to internal TranslationContext
 * 3. Falls back to "en" if no provider is available
 *
 * @returns The current locale
 */
export function useSmartLocale(): Locale {
  const forceInternal = React.useContext(ForceInternalContext);
  const internalLocale = useUnderverseLocale();

  // If forced to use internal or next-intl is not available, use internal
  if (forceInternal || !nextIntlHooks?.useLocale) {
    return internalLocale;
  }

  // Try to use next-intl
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const nextIntlLocale = nextIntlHooks.useLocale();
    return (nextIntlLocale as Locale) || internalLocale;
  } catch {
    // If next-intl throws (e.g., no provider), fall back to internal
    return internalLocale;
  }
}

export default useSmartTranslations;
