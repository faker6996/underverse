"use client";

import * as React from "react";
import {
  TranslationProvider,
  getUnderverseDefaultTranslation,
  useUnderverseLocale,
  useUnderverseTranslations,
  type Locale,
  type TranslationProviderProps,
  type Translations,
} from "../../packages/underverse/src/contexts/TranslationContext";
import { useNextIntlBridge } from "../../packages/underverse/src/contexts/NextIntlAdapter";

function isUnresolvedTranslation(value: string, namespace: string, key: string) {
  return value === key || value === `${namespace}.${key}`;
}

function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

type LegacyTranslations = Record<string, Record<string, string | Record<string, string>>>;

export interface UnderverseProviderProps extends Omit<TranslationProviderProps, "translations"> {
  translations?: LegacyTranslations;
}

function toLocaleTranslations(locale: Locale, translations?: LegacyTranslations): Partial<Record<Locale, Translations>> | undefined {
  if (!translations) return undefined;

  return {
    [locale]: translations as Translations,
  };
}

export const UnderverseProvider: React.FC<UnderverseProviderProps> = ({ children, locale = "en", translations }) => {
  return (
    <TranslationProvider locale={locale} translations={toLocaleTranslations(locale, translations)}>
      {children}
    </TranslationProvider>
  );
};

export function useTranslations(namespace: string): (key: string, params?: Record<string, unknown>) => string {
  const nextIntlBridge = useNextIntlBridge();
  const internalLocale = useUnderverseLocale();
  const internalT = useUnderverseTranslations(namespace);

  return React.useCallback((key: string, params?: Record<string, unknown>) => {
    if (nextIntlBridge) {
      const nextIntlResult = nextIntlBridge.translate(namespace, key, params);
      if (
        nextIntlResult.translated
        && !isUnresolvedTranslation(nextIntlResult.translated, namespace, key)
      ) {
        return nextIntlResult.translated;
      }

      const localizedDefault = getUnderverseDefaultTranslation(nextIntlResult.locale, namespace, key);
      if (localizedDefault !== key) {
        return interpolate(localizedDefault, params);
      }
    }

    const internalValue = internalT(key);
    if (internalValue !== key) {
      return interpolate(internalValue, params);
    }

    return interpolate(getUnderverseDefaultTranslation(internalLocale, namespace, key), params);
  }, [internalLocale, internalT, namespace, nextIntlBridge]);
}

export function useLocale(): Locale {
  const nextIntlBridge = useNextIntlBridge();
  const internalLocale = useUnderverseLocale();

  return nextIntlBridge?.locale ?? internalLocale;
}

export type { Locale };

