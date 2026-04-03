"use client";

import React from "react";
import { useLocale, useMessages } from "next-intl";
import { NextIntlAdapter } from "@underverse-ui/underverse";

export default function IntlDemoProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const messages = useMessages();

  return (
    <NextIntlAdapter locale={locale} messages={messages}>
      {children}
    </NextIntlAdapter>
  );
}
