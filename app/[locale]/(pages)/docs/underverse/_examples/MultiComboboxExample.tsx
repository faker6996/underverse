"use client";

import React from "react";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function MultiComboboxExample() {
  const [value, setValue] = React.useState<string[]>([]);
  const options = ["React", "Next.js", "Tailwind", "TypeScript", "Node.js"];

  const code =
    `import { MultiCombobox } from '@underverse-ui/underverse'\n\n` +
    `const [value, setValue] = useState<string[]>([])\n` +
    `const options = ["React", "Next.js", "Tailwind", "TypeScript", "Node.js"]\n\n` +
    `<MultiCombobox options={options} value={value} onChange={setValue} />\n` +
    `<div className="text-sm text-muted-foreground">Chọn: {value.join(", ") || "(none)"}</div>`;

  const demo = (
    <div className="space-y-3">
      <MultiCombobox options={options} value={value} onChange={setValue} />
      <div className="text-sm text-muted-foreground">Chọn: {value.join(", ") || "(none)"}</div>
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

