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
  translate: (namespace: string, key: string, values?: Record<string, unknown>) => NextIntlTranslationResult;
};

const NextIntlBridgeContext = React.createContext<NextIntlBridgeContextValue | null>(null);

/** Public props for the `NextIntlAdapter` component. */
export interface NextIntlAdapterProps {
  children: React.ReactNode;
  locale?: string | null;
  messages?: Record<string, unknown> | null;
}

function isMissingIntlContextError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message || "";
  const stack = error.stack || "";

  return (
    message.includes("No intl context found.")
    || (
      !message
      && stack.includes("use-intl/dist/esm/")
      && stack.includes("NextIntlAdapterWithContext")
    )
  );
}

class NextIntlAdapterBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prevProps: Readonly<{ children: React.ReactNode; fallback: React.ReactNode }>) {
    if (this.state.error && prevProps.children !== this.props.children) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    if (isMissingIntlContextError(this.state.error)) {
      return this.props.fallback;
    }

    throw this.state.error;
  }
}

function NextIntlAdapterProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  const normalizedLocale = normalizeLocale(locale, "en");
  const translatorCache = React.useMemo(
    () => new Map<string, (key: string, values?: Record<string, unknown>) => string>(),
    [normalizedLocale, messages]
  );

  const translate = React.useCallback((namespace: string, key: string, values?: Record<string, unknown>): NextIntlTranslationResult => {
    let translator = translatorCache.get(namespace);

    if (!translator) {
      const runtimeTranslator = createTranslator({
        locale: normalizedLocale,
        messages,
        namespace,
        onError: () => {},
      });
      translator = (translationKey: string, translationValues?: Record<string, unknown>) => (
        runtimeTranslator(translationKey as never, translationValues as never)
      );
      translatorCache.set(namespace, translator);
    }

    try {
      return {
        locale: normalizedLocale,
        translated: translator(key, values),
      };
    } catch {
      return {
        locale: normalizedLocale,
        translated: null,
      };
    }
  }, [messages, normalizedLocale, translatorCache]);

  const value = React.useMemo<NextIntlBridgeContextValue>(() => ({
    locale: normalizedLocale,
    translate,
  }), [normalizedLocale, translate]);

  return <NextIntlBridgeContext.Provider value={value}>{children}</NextIntlBridgeContext.Provider>;
}

function NextIntlAdapterWithContext({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const messages = useMessages();
  return (
    <NextIntlAdapterProvider locale={locale} messages={messages}>
      {children}
    </NextIntlAdapterProvider>
  );
}

export function NextIntlAdapter({ children, locale, messages }: NextIntlAdapterProps) {
  if (locale && messages) {
    return (
      <NextIntlAdapterProvider locale={locale} messages={messages}>
        {children}
      </NextIntlAdapterProvider>
    );
  }

  return (
    <NextIntlAdapterBoundary fallback={children}>
      <NextIntlAdapterWithContext>{children}</NextIntlAdapterWithContext>
    </NextIntlAdapterBoundary>
  );
}

export const UnderverseNextIntlProvider = NextIntlAdapter;

export function useNextIntlBridge() {
  return React.useContext(NextIntlBridgeContext);
}
