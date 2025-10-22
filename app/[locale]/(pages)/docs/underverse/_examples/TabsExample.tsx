"use client";

import React from "react";
import { Tabs } from "@/components/ui/Tab";
import CodeBlock from "../_components/CodeBlock";

export default function TabsExample() {
  const code =
    `import { Tabs } from '@underverse-ui/underverse'\n\n` +
    `<Tabs\n` +
    `  tabs={[\n` +
    `    { value: "a", label: "Tab A", content: <div className="p-3">Nội dung A</div> },\n` +
    `    { value: "b", label: "Tab B", content: <div className="p-3">Nội dung B</div> },\n` +
    `  ]}\n` +
    `/>`;

  const demo = (
    <div>
      <Tabs
        tabs={[
          { value: "a", label: "Tab A", content: <div className="p-3">Nội dung A</div> },
          { value: "b", label: "Tab B", content: <div className="p-3">Nội dung B</div> },
        ]}
      />
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

