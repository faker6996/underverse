"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ScrollAreaExample() {
  const code =
    `import { ScrollArea } from '@underverse-ui/underverse'\n\n` +
    `<ScrollArea className="h-32 w-full border border-border rounded-md">\n` +
    `  <div className="p-3 space-y-2">\n` +
    `    {Array.from({ length: 20 }).map((_, i) => (\n` +
    `      <div key={i} className="text-sm">Dòng {i + 1}</div>\n` +
    `    ))}\n` +
    `  </div>\n` +
    `</ScrollArea>`;

  const demo = (
    <div>
      <ScrollArea className="h-32 w-full border border-border rounded-md">
        <div className="p-3 space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="text-sm">Dòng {i + 1}</div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

