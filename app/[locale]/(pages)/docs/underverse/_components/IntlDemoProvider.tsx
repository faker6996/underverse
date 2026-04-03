"use client";

import React from "react";
import { NextIntlAdapter } from "@underverse-ui/underverse";

export default function IntlDemoProvider({ children }: { children: React.ReactNode }) {
  return <NextIntlAdapter>{children}</NextIntlAdapter>;
}
