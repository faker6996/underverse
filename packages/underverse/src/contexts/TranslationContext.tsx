"use client";

import * as React from "react";
import enLocale from "../../locales/en.json";
import viLocale from "../../locales/vi.json";
import koLocale from "../../locales/ko.json";
import jaLocale from "../../locales/ja.json";

export type Locale = "en" | "vi" | "ko" | "ja";
export type Translations = Record<string, Record<string, string | Record<string, string>>>;

interface TranslationContextType {
  locale: Locale;
  t: (namespace: string) => (key: string) => string;
}

const defaultTranslations: Record<Locale, Translations> = {
  en: enLocale as Translations,
  vi: viLocale as Translations,
  ko: koLocale as Translations,
  ja: jaLocale as Translations,
};

const TranslationContext = React.createContext<TranslationContextType | null>(null);

export interface TranslationProviderProps {
  children: React.ReactNode;
  /** Current locale. Defaults to "en" */
  locale?: Locale;
  /** Custom translations to merge with defaults */
  translations?: Partial<Record<Locale, Translations>>;
}

/**
 * TranslationProvider for Underverse UI components.
 *
 * This provider is OPTIONAL. Components will use English fallback texts
 * when no provider is available.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TranslationProvider locale="vi">
 *   <App />
 * </TranslationProvider>
 *
 * // With custom translations
 * <TranslationProvider
 *   locale="vi"
 *   translations={{
 *     vi: { DatePicker: { clear: "Xóa ngay" } }
 *   }}
 * >
 *   <App />
 * </TranslationProvider>
 * ```
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children, locale = "en", translations }) => {
  const t = React.useCallback(
    (namespace: string) => {
      return (key: string): string => {
        // Merge custom translations with defaults
        const mergedTranslations = {
          ...defaultTranslations[locale],
          ...translations?.[locale],
        };

        // Handle nested namespaces like "OCR.imageUpload"
        const parts = namespace.split(".");
        let current: unknown = mergedTranslations;

        for (const part of parts) {
          if (current && typeof current === "object" && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return key; // Fallback to key
          }
        }

        if (current && typeof current === "object" && key in current) {
          const value = (current as Record<string, unknown>)[key];
          return typeof value === "string" ? value : key;
        }

        return key; // Fallback to key
      };
    },
    [locale, translations]
  );

  return <TranslationContext.Provider value={{ locale, t }}>{children}</TranslationContext.Provider>;
};

/**
 * Hook to get translations for a specific namespace.
 * Falls back to the key itself when TranslationProvider is not available.
 *
 * @param namespace - The translation namespace (e.g., "DatePicker", "Common")
 * @returns A function that takes a key and returns the translated string
 *
 * @example
 * ```tsx
 * const t = useTranslations("DatePicker");
 * console.log(t("clear")); // "Clear" or "Xóa" depending on locale
 * ```
 */
export const useUnderverseTranslations = (namespace: string) => {
  const context = React.useContext(TranslationContext);

  // Fallback for when provider is not available - use English defaults
  if (!context) {
    return (key: string): string => {
      const parts = namespace.split(".");
      let current: unknown = defaultTranslations.en;

      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }

      if (current && typeof current === "object" && key in current) {
        const value = (current as Record<string, unknown>)[key];
        return typeof value === "string" ? value : key;
      }

      return key;
    };
  }

  return context.t(namespace);
};

/**
 * Hook to get the current locale.
 * Falls back to "en" when TranslationProvider is not available.
 *
 * @returns The current locale ("en" or "vi")
 */
export const useUnderverseLocale = (): Locale => {
  const context = React.useContext(TranslationContext);
  return context?.locale || "en";
};

export default TranslationProvider;
