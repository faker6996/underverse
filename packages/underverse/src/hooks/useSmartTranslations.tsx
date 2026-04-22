"use client";

import * as React from "react";
import {
  getUnderverseDefaultTranslation,
  useUnderverseTranslations,
  useUnderverseLocale,
  type Locale,
} from "../contexts/TranslationContext";
import { useNextIntlBridge } from "../contexts/NextIntlAdapter";

/**
 * Context to force using internal translations even when next-intl is available.
 * Useful for testing or when you want to use the package's built-in translations.
 */
const ForceInternalContext = React.createContext(false);

export const ForceInternalTranslationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ForceInternalContext.Provider value={true}>{children}</ForceInternalContext.Provider>;
};

function normalizeLocale(locale: string | null | undefined, fallback: Locale): Locale {
  const normalized = locale?.toLowerCase().split("-")[0];
  if (normalized === "en" || normalized === "vi" || normalized === "ko" || normalized === "ja") {
    return normalized;
  }

  return fallback;
}

function isUnresolvedTranslation(value: string, namespace: string, key: string) {
  return value === key || value === `${namespace}.${key}`;
}

function getEnvironmentLocale(fallback: Locale): Locale {
  if (typeof document !== "undefined") {
    const documentLocale = document.documentElement?.lang?.trim();
    if (documentLocale) {
      return normalizeLocale(documentLocale, fallback);
    }
  }

  if (typeof navigator !== "undefined") {
    const navigatorLocale = navigator.language?.trim();
    if (navigatorLocale) {
      return normalizeLocale(navigatorLocale, fallback);
    }
  }

  return fallback;
}

/**
 * Smart translation hook that:
 * 1. Uses NextIntlAdapter if available and not forced to use internal
 * 2. Falls back to internal TranslationContext
 * 3. Falls back to English defaults if no provider is available
 *
 * @param namespace - The translation namespace (e.g., "DatePicker", "Common")
 * @returns A function that takes a key and returns the translated string
 *
 * @example
 * ```tsx
 * // Works in Next.js with <NextIntlAdapter />
 * // Works in React without next-intl
 * // Works without any provider (English fallback)
 * const t = useSmartTranslations("DatePicker");
 * console.log(t("clear")); // "Clear" or translated value
 * ```
 */
export function useSmartTranslations(namespace: string): (key: string) => string {
  const forceInternal = React.useContext(ForceInternalContext);
  const nextIntlBridge = useNextIntlBridge();
  const internalT = useUnderverseTranslations(namespace);
  const internalLocale = useUnderverseLocale();
  const [environmentLocale, setEnvironmentLocale] = React.useState<Locale | null>(null);

  React.useEffect(() => {
    if (forceInternal) return;
    if (nextIntlBridge) return;
    if (internalLocale !== "en") return;
    const detected = getEnvironmentLocale(internalLocale);
    if (detected !== internalLocale) {
      setEnvironmentLocale(detected);
    }
  }, [forceInternal, internalLocale, nextIntlBridge]);

  if (forceInternal) {
    return internalT;
  }

  return (key: string) => {
    const resolvedEnvironmentLocale = environmentLocale && environmentLocale !== internalLocale ? environmentLocale : null;
    const primaryLocale = nextIntlBridge?.locale ?? resolvedEnvironmentLocale ?? internalLocale;
    const fallbackLocale = resolvedEnvironmentLocale && resolvedEnvironmentLocale !== primaryLocale ? resolvedEnvironmentLocale : null;
    let translated: string | null = null;

    if (nextIntlBridge) {
      const nextIntlResult = nextIntlBridge.translate(namespace, key);
      translated = nextIntlResult.translated;
    }

    const localizedDefault = getUnderverseDefaultTranslation(primaryLocale, namespace, key);
    const fallbackLocalizedDefault = fallbackLocale ? getUnderverseDefaultTranslation(fallbackLocale, namespace, key) : key;
    const englishDefault = getUnderverseDefaultTranslation("en", namespace, key);
    const internalValue = internalT(key);

    if (
      translated
      && !isUnresolvedTranslation(translated, namespace, key)
      && !(primaryLocale !== "en" && localizedDefault !== englishDefault && translated === englishDefault)
    ) {
      return translated;
    }

    // Only trust internal translations ahead of locale defaults when the
    // internal provider is actually aligned with the resolved locale.
    if (internalLocale === primaryLocale && internalValue !== key) {
      return internalValue;
    }

    if (localizedDefault !== key) {
      return localizedDefault;
    }

    if (fallbackLocalizedDefault !== key) {
      return fallbackLocalizedDefault;
    }

    if (internalValue !== key) {
      return internalValue;
    }

    return key;
  };
}

/**
 * Smart locale hook that:
 * 1. Uses NextIntlAdapter if available
 * 2. Falls back to internal TranslationContext
 * 3. Falls back to "en" if no provider is available
 *
 * @returns The current locale
 */
export function useSmartLocale(): Locale {
  const forceInternal = React.useContext(ForceInternalContext);
  const nextIntlBridge = useNextIntlBridge();
  const internalLocale = useUnderverseLocale();
  const [environmentLocale, setEnvironmentLocale] = React.useState<Locale | null>(null);

  React.useEffect(() => {
    if (forceInternal) return;
    if (nextIntlBridge) return;
    if (internalLocale !== "en") return;
    const detected = getEnvironmentLocale(internalLocale);
    if (detected !== internalLocale) {
      setEnvironmentLocale(detected);
    }
  }, [forceInternal, internalLocale, nextIntlBridge]);

  if (forceInternal) {
    return internalLocale;
  }

  return nextIntlBridge?.locale ?? environmentLocale ?? internalLocale;
}

export default useSmartTranslations;
