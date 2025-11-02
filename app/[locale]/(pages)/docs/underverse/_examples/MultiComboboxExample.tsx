"use client";

import React from "react";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function MultiComboboxExample() {
  const [value, setValue] = React.useState<string[]>([]);
  const [valueSm, setValueSm] = React.useState<string[]>([]);
  const [valueLg, setValueLg] = React.useState<string[]>([]);
  const [valueLimited, setValueLimited] = React.useState<string[]>([]);
  const [valueNoTags, setValueNoTags] = React.useState<string[]>(["React", "TypeScript"]);
  const [valueDisabled, setValueDisabled] = React.useState<string[]>(["React"]);

  const options = ["React", "Next.js", "Tailwind", "TypeScript", "Node.js"];
  const disabledOptions = ["Next.js"];

  const code =
    `import { MultiCombobox } from '@underverse-ui/underverse'\n\n` +
    `const options = ["React", "Next.js", "Tailwind", "TypeScript", "Node.js"]\n` +
    `const disabledOptions = ["Next.js"]\n\n` +
    `// 1) Basic with label, showTags, showClear\n` +
    `<MultiCombobox options={options} value={value} onChange={setValue} label=\"Technologies\" showTags showClear />\n\n` +
    `// 2) Sizes\n` +
    `<MultiCombobox options={options} value={valueSm} onChange={setValueSm} size=\"sm\" label=\"Small\" />\n` +
    `<MultiCombobox options={options} value={value} onChange={setValue} size=\"md\" label=\"Medium\" />\n` +
    `<MultiCombobox options={options} value={valueLg} onChange={setValueLg} size=\"lg\" label=\"Large\" />\n\n` +
    `// 3) Max selected\n` +
    `<MultiCombobox options={options} value={valueLimited} onChange={setValueLimited} maxSelected={2} label=\"Max 2 items\" />\n\n` +
    `// 4) Disabled options\n` +
    `<MultiCombobox options={options} value={valueDisabled} onChange={setValueDisabled} disabledOptions={disabledOptions} label=\"Disabled option\" />\n\n` +
    `// 5) Hide tags and clear\n` +
    `<MultiCombobox options={options} value={valueNoTags} onChange={setValueNoTags} showTags={false} showClear={false} label=\"No tags\" />`;

  const demo = (
    <div className="space-y-8">
      {/* 1) Basic */}
      <MultiCombobox options={options} value={value} onChange={setValue} label="Technologies" showTags showClear />
      <div className="text-sm text-muted-foreground">Chọn: {value.join(", ") || "(none)"}</div>

      {/* 2) Sizes */}
      <div className="flex flex-wrap gap-3">
        <MultiCombobox options={options} value={valueSm} onChange={setValueSm} size="sm" label="Small" />
        <MultiCombobox options={options} value={value} onChange={setValue} size="md" label="Medium" />
        <MultiCombobox options={options} value={valueLg} onChange={setValueLg} size="lg" label="Large" />
      </div>

      {/* 3) Max selected */}
      <MultiCombobox options={options} value={valueLimited} onChange={setValueLimited} maxSelected={2} label="Max 2 items" />

      {/* 4) Disabled options */}
      <MultiCombobox options={options} value={valueDisabled} onChange={setValueDisabled} disabledOptions={disabledOptions} label="Disabled option" />

      {/* 5) Hide tags and clear */}
      <MultiCombobox options={options} value={valueNoTags} onChange={setValueNoTags} showTags={false} showClear={false} label="No tags" />
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

