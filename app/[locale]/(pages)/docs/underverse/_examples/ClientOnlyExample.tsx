"use client";

import React from "react";
import ClientOnly from "@/components/ui/ClientOnly";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";

export default function ClientOnlyExample() {
  const t = useTranslations("DocsUnderverse");
  const code = `import { ClientOnly } from '@underverse-ui/underverse'

<ClientOnly fallback={<div>Loading…</div>}>
  Client content
</ClientOnly>`;
  const demo = (
    <ClientOnly fallback={<div className="text-sm text-muted-foreground">Loading on client…</div>}>
      <div className="text-sm">Rendered on client at: {new Date().toLocaleTimeString()}</div>
    </ClientOnly>
  );

  return (
    <Tabs
      id="client-only-tabs"
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
