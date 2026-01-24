"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Switch from "@/components/ui/Switch";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function SwitchExample() {
  const t = useTranslations("DocsUnderverse");
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(false);
  const [checked4, setChecked4] = React.useState(false);
  const [checked5, setChecked5] = React.useState(false);

  const code =
    `import { Switch } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `// Basic Switch\n` +
    `const [checked, setChecked] = useState(false)\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} />\n\n` +
    `// With Label\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} label="Enable notifications" />\n\n` +
    `// Sizes\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} size="sm" label="Small" />\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} size="md" label="Medium" />\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} size="lg" label="Large" />\n\n` +
    `// Variants\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} variant="default" label="Default" />\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} variant="success" label="Success" />\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} variant="warning" label="Warning" />\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} variant="danger" label="Danger" />\n\n` +
    `// Disabled\n` +
    `<Switch checked={checked} onCheckedChange={setChecked} disabled label="Disabled switch" />\n\n` +
    `// Without Label\n` +
    `<div className="flex items-center gap-3">\n` +
    `  <Switch checked={checked} onCheckedChange={setChecked} />\n` +
    `  <span className="text-sm">Status: {checked ? "On" : "Off"}</span>\n` +
    `</div>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Switch */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Switch</p>
        <Switch checked={checked1} onCheckedChange={setChecked1} />
      </div>

      {/* With Label */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Label</p>
        <Switch checked={checked2} onCheckedChange={setChecked2} label="Enable notifications" />
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-3">
          <Switch checked={checked3} onCheckedChange={setChecked3} size="sm" label="Small" />
          <Switch checked={checked3} onCheckedChange={setChecked3} size="md" label="Medium" />
          <Switch checked={checked3} onCheckedChange={setChecked3} size="lg" label="Large" />
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <Switch checked={checked4} onCheckedChange={setChecked4} variant="default" label="Default" />
          <Switch checked={true} onCheckedChange={() => {}} variant="success" label="Success" />
          <Switch checked={true} onCheckedChange={() => {}} variant="warning" label="Warning" />
          <Switch checked={true} onCheckedChange={() => {}} variant="danger" label="Danger" />
        </div>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <div className="space-y-3">
          <Switch checked={false} onCheckedChange={() => {}} disabled label="Disabled (Off)" />
          <Switch checked={true} onCheckedChange={() => {}} disabled label="Disabled (On)" />
        </div>
      </div>

      {/* Without Label */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Without Label (Custom Text)</p>
        <div className="flex items-center gap-3">
          <Switch checked={checked5} onCheckedChange={setChecked5} />
          <span className="text-sm">Status: {checked5 ? "On" : "Off"}</span>
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "checked", description: t("props.switch.checked"), type: "boolean", default: "-" },
    { property: "onCheckedChange", description: t("props.switch.onCheckedChange"), type: "(checked: boolean) => void", default: "-" },
    { property: "label", description: t("props.switch.label"), type: "string", default: "-" },
    { property: "size", description: t("props.switch.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "variant", description: t("props.switch.variant"), type: '"default" | "success" | "warning" | "danger"', default: '"default"' },
    { property: "disabled", description: t("props.switch.disabled"), type: "boolean", default: "false" },
    { property: "className", description: t("props.switch.className"), type: "string", default: "-" },
  ];
  const order = ["checked","onCheckedChange","label","size","variant","disabled","className"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Switch.md" />;

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

