"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { Sparkles, Zap, Globe, Palette, Code, Database, Server, Layout, Shield, Settings } from "lucide-react";

export default function MultiComboboxExample() {
  const t = useTranslations("DocsUnderverse");
  const [value, setValue] = React.useState<string[]>([]);
  const [valueSm, setValueSm] = React.useState<string[]>([]);
  const [valueLg, setValueLg] = React.useState<string[]>([]);
  const [valueLimited, setValueLimited] = React.useState<string[]>([]);
  const [valueNoTags, setValueNoTags] = React.useState<string[]>(["React", "TypeScript"]);
  const [valueDisabled, setValueDisabled] = React.useState<string[]>(["React"]);
  const [valueAdvanced, setValueAdvanced] = React.useState<string[]>(["react"]);
  const [valueWithIcons, setValueWithIcons] = React.useState<string[]>([]);
  const [valueGrouped, setValueGrouped] = React.useState<string[]>([]);
  const [valueError, setValueError] = React.useState<string[]>([]);
  const [valueVariant, setValueVariant] = React.useState<string[]>([]);
  const [valueLongNames, setValueLongNames] = React.useState<string[]>(["user1", "user2", "user3", "user4", "user5"]);

  const options = ["React", "Next.js", "Tailwind", "TypeScript", "Node.js"];
  const disabledOptions = ["Next.js"];

  // Options with icons and descriptions
  const optionsWithIcons = [
    { value: "react", label: "React", icon: <Sparkles className="w-4 h-4" />, description: "UI Library" },
    { value: "next", label: "Next.js", icon: <Zap className="w-4 h-4" />, description: "React Framework" },
    { value: "tailwind", label: "Tailwind CSS", icon: <Palette className="w-4 h-4" />, description: "CSS Framework" },
    { value: "typescript", label: "TypeScript", icon: <Code className="w-4 h-4" />, description: "Type Safety" },
    { value: "node", label: "Node.js", icon: <Server className="w-4 h-4" />, description: "Runtime", disabled: true },
  ];

  // Grouped options
  const groupedOptions = [
    { value: "react", label: "React", icon: <Sparkles className="w-4 h-4" />, group: "Frontend" },
    { value: "vue", label: "Vue.js", icon: <Zap className="w-4 h-4" />, group: "Frontend" },
    { value: "angular", label: "Angular", icon: <Layout className="w-4 h-4" />, group: "Frontend" },
    { value: "node", label: "Node.js", icon: <Server className="w-4 h-4" />, group: "Backend" },
    { value: "python", label: "Python", icon: <Code className="w-4 h-4" />, group: "Backend" },
    { value: "go", label: "Go", icon: <Zap className="w-4 h-4" />, group: "Backend" },
    { value: "postgres", label: "PostgreSQL", icon: <Database className="w-4 h-4" />, group: "Database" },
    { value: "mongodb", label: "MongoDB", icon: <Database className="w-4 h-4" />, group: "Database" },
    { value: "redis", label: "Redis", icon: <Zap className="w-4 h-4" />, group: "Database" },
  ];

  // Options with long labels (Vietnamese names) to test overflow
  const longNameOptions = [
    { value: "user1", label: "Bùi Mạnh Đạt" },
    { value: "user2", label: "Bùi Thị Thu Thảo" },
    { value: "user3", label: "Nguyễn Văn An" },
    { value: "user4", label: "Trần Thị Bích Ngọc" },
    { value: "user5", label: "Lê Hoàng Phương Anh" },
    { value: "user6", label: "Phạm Minh Quân" },
    { value: "user7", label: "Đặng Thị Hồng Nhung" },
  ];

  // Advanced options using objects (>10 items) to demonstrate displayFormat + search
  const advancedOptions = [
    { value: "react", label: "React", icon: <Sparkles className="w-4 h-4" /> },
    { value: "next", label: "Next.js", icon: <Zap className="w-4 h-4" /> },
    { value: "ts", label: "TypeScript", icon: <Code className="w-4 h-4" /> },
    { value: "node", label: "Node", icon: <Server className="w-4 h-4" /> },
    { value: "graphql", label: "GraphQL", icon: <Globe className="w-4 h-4" /> },
    { value: "tailwind", label: "Tailwind", icon: <Palette className="w-4 h-4" /> },
    { value: "vite", label: "Vite", icon: <Zap className="w-4 h-4" /> },
    { value: "webpack", label: "Webpack" },
    { value: "esbuild", label: "esbuild" },
    { value: "rollup", label: "Rollup" },
    { value: "vitest", label: "Vitest" },
    { value: "jest", label: "Jest" },
  ];

  const code =
    `import { MultiCombobox } from '@underverse-ui/underverse'\n` +
    `import { Sparkles, Zap, Palette, Code, Server, Database } from 'lucide-react'\n\n` +
    `// Basic options\n` +
    `const options = ["React", "Next.js", "Tailwind", "TypeScript"]\n\n` +
    `// Options with icons and descriptions\n` +
    `const optionsWithIcons = [\n` +
    `  { value: 'react', label: 'React', icon: <Sparkles />, description: 'UI Library' },\n` +
    `  { value: 'next', label: 'Next.js', icon: <Zap />, description: 'React Framework' },\n` +
    `  { value: 'node', label: 'Node.js', icon: <Server />, disabled: true },\n` +
    `]\n\n` +
    `// Grouped options\n` +
    `const groupedOptions = [\n` +
    `  { value: 'react', label: 'React', group: 'Frontend' },\n` +
    `  { value: 'node', label: 'Node.js', group: 'Backend' },\n` +
    `  { value: 'postgres', label: 'PostgreSQL', group: 'Database' },\n` +
    `]\n\n` +
    `// 1) Basic with label\n` +
    `<MultiCombobox options={options} value={value} onChange={setValue} label="Technologies" />\n\n` +
    `// 2) With icons and descriptions\n` +
    `<MultiCombobox options={optionsWithIcons} value={value} onChange={setValue} showSelectedIcons />\n\n` +
    `// 3) Grouped options\n` +
    `<MultiCombobox options={groupedOptions} groupBy={(opt) => opt.group || ''} label="Tech Stack" />\n\n` +
    `// 4) With error and helper text\n` +
    `<MultiCombobox options={options} error={!value.length ? 'Required' : undefined} helperText="Select at least one" />\n\n` +
    `// 5) Variants\n` +
    `<MultiCombobox options={options} variant="default" />\n` +
    `<MultiCombobox options={options} variant="outline" />\n` +
    `<MultiCombobox options={options} variant="ghost" />\n`;

  const demo = (
    <div className="space-y-8">
      {/* Section 1: Basic */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
          Basic Usage
        </h4>
        <MultiCombobox
          options={options}
          value={value}
          onChange={setValue}
          label="Technologies"
          showTags
          showClear
          placeholder="Select technologies"
        />
        <div className="text-xs text-muted-foreground">
          Selected: <code className="px-1.5 py-0.5 rounded bg-muted">{value.join(", ") || "none"}</code>
        </div>
      </div>

      {/* Section 2: With Icons & Descriptions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
          Icons & Descriptions
        </h4>
        <MultiCombobox
          options={optionsWithIcons}
          value={valueWithIcons}
          onChange={setValueWithIcons}
          label="Select Framework"
          showSelectedIcons
          placeholder="Choose with icons"
          helperText="Options can have icons, descriptions, and be disabled"
        />
      </div>

      {/* Section 3: Grouped Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
          Grouped Options
        </h4>
        <MultiCombobox
          options={groupedOptions}
          value={valueGrouped}
          onChange={setValueGrouped}
          groupBy={(opt) => (opt as (typeof groupedOptions)[0]).group || ""}
          label="Tech Stack"
          showSelectedIcons
          placeholder="Select from groups"
          maxHeight={300}
        />
      </div>

      {/* Section 4: Error State */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs">4</span>
          Error State
        </h4>
        <MultiCombobox
          options={options}
          value={valueError}
          onChange={setValueError}
          label="Required Selection"
          required
          error={valueError.length === 0 ? "Please select at least one option" : undefined}
          helperText="This field is required"
          placeholder="Select to clear error"
        />
      </div>

      {/* Section 5: Sizes */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">5</span>
          Sizes
        </h4>
        <div className="flex flex-wrap items-end gap-3">
          <MultiCombobox options={options} value={valueSm} onChange={setValueSm} size="sm" placeholder="Small" />
          <MultiCombobox options={options} value={value} onChange={setValue} size="md" placeholder="Medium" />
          <MultiCombobox options={options} value={valueLg} onChange={setValueLg} size="lg" placeholder="Large" />
        </div>
      </div>

      {/* Section 6: Variants */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">6</span>
          Variants
        </h4>
        <div className="flex flex-wrap items-end gap-3">
          <MultiCombobox options={options} value={value} onChange={setValue} variant="default" placeholder="Default" />
          <MultiCombobox options={options} value={valueVariant} onChange={setValueVariant} variant="outline" placeholder="Outline" />
          <MultiCombobox options={options} value={valueVariant} onChange={setValueVariant} variant="ghost" placeholder="Ghost" />
        </div>
      </div>

      {/* Section 7: Max Selected & Tags */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">7</span>
          Max Selected & Tags Limit
        </h4>
        <MultiCombobox
          options={options}
          value={valueLimited}
          onChange={setValueLimited}
          maxSelected={3}
          maxTagsVisible={2}
          label="Max 3 items, show 2 tags"
          helperText="Remaining tags are collapsed"
        />
      </div>

      {/* Section 8: Long Names Overflow Test */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs">8</span>
          Long Names (Overflow Test)
        </h4>
        <MultiCombobox
          options={longNameOptions}
          value={valueLongNames}
          onChange={setValueLongNames}
          maxTagsVisible={2}
          label="Add Users"
          placeholder="Select users"
          helperText="Test with long Vietnamese names and maxTagsVisible=2"
        />
      </div>

      {/* Section 9: Advanced */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-linear-to-r from-primary to-secondary text-white flex items-center justify-center text-xs">9</span>
          Advanced (Many Options + Search)
        </h4>
        <MultiCombobox
          options={advancedOptions}
          value={valueAdvanced}
          onChange={setValueAdvanced}
          maxSelected={5}
          disabledOptions={["node"]}
          showClear
          showTags
          showSelectedIcons
          title="Tech Stack"
          label="Select technologies"
          searchPlaceholder="Type to search..."
          placeholder="Search and select"
          displayFormat={(opt) => `${opt.label}`}
          useOverlayScrollbar
          helperText="Supports keyboard navigation and search"
        />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "id", description: t("props.multiCombobox.id"), type: "string", default: "-" },
    {
      property: "options",
      description: "Array of options with optional icon, description, disabled, group",
      type: "Array<MultiComboboxOption>",
      default: "-",
    },
    { property: "value", description: t("props.multiCombobox.value"), type: "string[]", default: "[]" },
    { property: "onChange", description: t("props.multiCombobox.onChange"), type: "(value: string[]) => void", default: "-" },
    { property: "placeholder", description: t("props.multiCombobox.placeholder"), type: "string", default: '"Select..."' },
    { property: "searchPlaceholder", description: "Placeholder for search input", type: "string", default: '"Search..."' },
    { property: "maxSelected", description: t("props.multiCombobox.maxSelected"), type: "number", default: "-" },
    { property: "disabledOptions", description: t("props.multiCombobox.disabledOptions"), type: "string[]", default: "[]" },
    { property: "showTags", description: t("props.multiCombobox.showTags"), type: "boolean", default: "true" },
    { property: "showClear", description: t("props.multiCombobox.showClear"), type: "boolean", default: "true" },
    { property: "className", description: t("props.multiCombobox.className"), type: "string", default: "-" },
    { property: "disabled", description: t("props.multiCombobox.disabled"), type: "boolean", default: "false" },
    { property: "size", description: t("props.multiCombobox.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "variant", description: "Visual style variant", type: '"default" | "outline" | "ghost"', default: '"default"' },
    { property: "label", description: t("props.multiCombobox.label"), type: "string", default: "-" },
    { property: "title", description: t("props.multiCombobox.title"), type: "string", default: "-" },
    { property: "required", description: t("props.multiCombobox.required"), type: "boolean", default: "false" },
    { property: "displayFormat", description: t("props.multiCombobox.displayFormat"), type: "(option) => string", default: "(o) => o.label" },
    { property: "showSelectedIcons", description: "Show icons in selected tags", type: "boolean", default: "true" },
    { property: "maxHeight", description: "Maximum height of dropdown", type: "number", default: "280" },
    { property: "groupBy", description: "Function to get group name", type: "(option) => string", default: "-" },
    { property: "renderOption", description: "Custom render for options", type: "(option, isSelected) => ReactNode", default: "-" },
    { property: "renderTag", description: "Custom render for tags", type: "(option, onRemove) => ReactNode", default: "-" },
    { property: "useOverlayScrollbar", description: "Enable OverlayScrollbars for dropdown options list", type: "boolean", default: "false" },
    { property: "error", description: "Error message to display", type: "string", default: "-" },
    { property: "helperText", description: "Helper text below component", type: "string", default: "-" },
    { property: "maxTagsVisible", description: "Max number of visible tags", type: "number", default: "3" },
  ];
  const order = rows.map((r) => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="MultiCombobox.md" />;

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
