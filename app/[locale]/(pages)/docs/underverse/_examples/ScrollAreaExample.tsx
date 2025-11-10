"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/ScrollArea";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ScrollAreaExample() {
  const t = useTranslations("DocsUnderverse");
  const code =
    `import { ScrollArea } from '@underverse-ui/underverse'\n\n` +
    `// 1) Basic (fixed height)\n` +
    `<ScrollArea className=\"h-32 w-full border border-border rounded-md\">\n` +
    `  <div className=\"p-3 space-y-2\">\n` +
    `    {Array.from({ length: 20 }).map((_, i) => (\n` +
    `      <div key={i} className=\"text-sm\">Dòng {i + 1}</div>\n` +
    `    ))}\n` +
    `  </div>\n` +
    `</ScrollArea>\n\n` +
    `// 2) Larger height\n` +
    `<ScrollArea className=\"h-64 w-full border border-border rounded-md\">\n` +
    `  <div className=\"p-3 space-y-2\">\n` +
    `    {Array.from({ length: 50 }).map((_, i) => (\n` +
    `      <div key={i} className=\"text-sm\">Item {i + 1}</div>\n` +
    `    ))}\n` +
    `  </div>\n` +
    `</ScrollArea>\n\n` +
    `// 3) With sticky header\n` +
    `<ScrollArea className=\"h-48 w-full rounded-md border border-border\">\n` +
    `  <div className=\"p-0\">\n` +
    `    <div className=\"sticky top-0 z-10 bg-background border-b border-border px-3 py-2 text-sm font-medium\">\n` +
    `      Sticky Header\n` +
    `    </div>\n` +
    `    <div className=\"p-3 space-y-2\">\n` +
    `      {Array.from({ length: 30 }).map((_, i) => (\n` +
    `        <div key={i} className=\"text-sm\">Row {i + 1}</div>\n` +
    `      ))}\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</ScrollArea>\n\n` +
    `// 4) Inside card container\n` +
    `<div className=\"rounded-md border border-border bg-card p-3\">\n` +
    `  <ScrollArea className=\"h-40 w-full rounded-md\">\n` +
    `    <div className=\"space-y-2\">\n` +
    `      {Array.from({ length: 25 }).map((_, i) => (\n` +
    `        <div key={i} className=\"text-sm\">Card line {i + 1}</div>\n` +
    `      ))}\n` +
    `    </div>\n` +
    `  </ScrollArea>\n` +
    `</div>`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic (fixed height)</p>
        <ScrollArea className="h-32 w-full border border-border rounded-md">
          <div className="p-3 space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="text-sm">Dòng {i + 1}</div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 2) Larger height */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Larger height</p>
        <ScrollArea className="h-64 w-full border border-border rounded-md">
          <div className="p-3 space-y-2">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="text-sm">Item {i + 1}</div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 3) With sticky header */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With sticky header</p>
        <ScrollArea className="h-48 w-full rounded-md border border-border">
          <div className="p-0">
            <div className="sticky top-0 z-10 bg-background border-b border-border px-3 py-2 text-sm font-medium">
              Sticky Header
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="text-sm">Row {i + 1}</div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 4) Inside card container */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Inside card container</p>
        <div className="rounded-md border border-border bg-card p-3">
          <ScrollArea className="h-40 w-full rounded-md">
            <div className="space-y-2">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="text-sm">Card line {i + 1}</div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "className", description: t("props.scrollArea.className"), type: "string", default: "-" },
    { property: "children", description: t("props.scrollArea.children"), type: "React.ReactNode", default: "-" },
  ];
  const order = ["className","children"];
  const docs = <PropsDocsTable rows={rows} order={order} />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
