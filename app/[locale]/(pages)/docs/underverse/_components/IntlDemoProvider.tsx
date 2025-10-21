"use client";

import React from "react";
import { useLocale, useMessages } from "next-intl";

export default function IntlDemoProvider({ children }: { children: React.ReactNode }) {
  // Use the locale and messages from the parent NextIntlClientProvider
  // This component now just passes through children without wrapping
  // The locale context is already provided by app/[locale]/layout.tsx
  return <>{children}</>;
}
