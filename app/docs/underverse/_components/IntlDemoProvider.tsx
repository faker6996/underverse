"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/i18n/locales/vi.json";

export default function IntlDemoProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="vi" messages={viMessages as any}>{children}</NextIntlClientProvider>
  );
}
