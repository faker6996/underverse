"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function MultiComboboxExample() {
  const t = useTranslations("DocsUnderverse");
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

  const rows: PropsRow[] = [
    { property: "id", description: t("props.multiCombobox.id"), type: "string", default: "-" },
    { property: "options", description: t("props.multiCombobox.options"), type: "Array<string | { value: string; label: string }>", default: "-" },
    { property: "value", description: t("props.multiCombobox.value"), type: "string[]", default: "[]" },
    { property: "onChange", description: t("props.multiCombobox.onChange"), type: "(value: string[]) => void", default: "-" },
    { property: "placeholder", description: t("props.multiCombobox.placeholder"), type: "string", default: '"Search..."' },
    { property: "maxSelected", description: t("props.multiCombobox.maxSelected"), type: "number", default: "-" },
    { property: "disabledOptions", description: t("props.multiCombobox.disabledOptions"), type: "string[]", default: "[]" },
    { property: "showTags", description: t("props.multiCombobox.showTags"), type: "boolean", default: "true" },
    { property: "showClear", description: t("props.multiCombobox.showClear"), type: "boolean", default: "true" },
    { property: "className", description: t("props.multiCombobox.className"), type: "string", default: "-" },
    { property: "disabled", description: t("props.multiCombobox.disabled"), type: "boolean", default: "false" },
    { property: "size", description: t("props.multiCombobox.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "label", description: t("props.multiCombobox.label"), type: "string", default: "-" },
    { property: "title", description: t("props.multiCombobox.title"), type: "string", default: "-" },
    { property: "required", description: t("props.multiCombobox.required"), type: "boolean", default: "false" },
    { property: "displayFormat", description: t("props.multiCombobox.displayFormat"), type: "(option: { value: string; label: string }) => string", default: "(o) => o.label" },
  ];
  const order = rows.map(r => r.property);
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
