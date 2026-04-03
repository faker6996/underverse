"use client";

import * as React from "react";
import { createTranslator, useLocale, useMessages } from "next-intl";
import type { Locale } from "./TranslationContext";

function normalizeLocale(locale: string | null | undefined, fallback: Locale): Locale {
  const normalized = locale?.toLowerCase().split("-")[0];
  if (normalized === "en" || normalized === "vi" || normalized === "ko" || normalized === "ja") {
    return normalized;
  }

  return fallback;
}

export type NextIntlTranslationResult = {
  locale: Locale;
  translated: string | null;
};

type NextIntlBridgeContextValue = {
  locale: Locale;
  translate: (namespace: string, key: string) => NextIntlTranslationResult;
};

const NextIntlBridgeContext = React.createContext<NextIntlBridgeContextValue | null>(null);

export function NextIntlAdapter({ children }: { children: React.ReactNode }) {
  const locale = normalizeLocale(useLocale(), "en");
  const messages = useMessages();
  const translatorCache = React.useMemo(() => new Map<string, (key: string) => string>(), [locale, messages]);

  const translate = React.useCallback((namespace: string, key: string): NextIntlTranslationResult => {
    let translator = translatorCache.get(namespace);

    if (!translator) {
      translator = createTranslator({
        locale,
        messages,
        namespace,
        onError: () => {},
      });
      translatorCache.set(namespace, translator);
    }

    try {
      return {
        locale,
        translated: translator(key),
      };
    } catch {
      return {
        locale,
        translated: null,
      };
    }
  }, [locale, messages, translatorCache]);

  const value = React.useMemo<NextIntlBridgeContextValue>(() => ({
    locale,
    translate,
  }), [locale, translate]);

  return <NextIntlBridgeContext.Provider value={value}>{children}</NextIntlBridgeContext.Provider>;
}

export const UnderverseNextIntlProvider = NextIntlAdapter;

export function useNextIntlBridge() {
  return React.useContext(NextIntlBridgeContext);
}

