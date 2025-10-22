"use client";

import React from "react";
import { Progress } from "@/components/ui/Progress";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ProgressExample() {
  const [v, setV] = React.useState(40);

  const demo = (
    <div className="space-y-3">
      <Progress value={v} showValue label="Tiến độ" />
      <div className="flex gap-2">
        <button className="text-sm px-2 py-1 border rounded" onClick={() => setV((x) => Math.max(0, x - 10))}>-10</button>
        <button className="text-sm px-2 py-1 border rounded" onClick={() => setV((x) => Math.min(100, x + 10))}>+10</button>
      </div>
    </div>
  );

  const code =
    `import { Progress } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `const [v, setV] = useState(40)\n` +
    `<div className=\"space-y-3\">\n` +
    `  <Progress value={v} showValue label='Tiến độ' />\n` +
    `  <div className=\"flex gap-2\">\n` +
    `    <button className=\"text-sm px-2 py-1 border rounded\" onClick={() => setV((x) => Math.max(0, x - 10))}>-10</button>\n` +
    `    <button className=\"text-sm px-2 py-1 border rounded\" onClick={() => setV((x) => Math.min(100, x + 10))}>+10</button>\n` +
    `  </div>\n` +
    `</div>`;

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

