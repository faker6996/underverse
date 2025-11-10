"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/CheckBox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function CheckboxExample() {
  const t = useTranslations("DocsUnderverse");
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(false);

  const code =
    `import { Checkbox } from '@underverse-ui/underverse'\n\n` +
    `// Controlled Checkbox\n` +
    `const [checked, setChecked] = useState(false)\n` +
    `<Checkbox label="Đồng ý điều khoản" checked={checked} onChange={(e) => setChecked(e.target.checked)} />\n\n` +
    `// Uncontrolled Checkbox (with defaultChecked)\n` +
    `<Checkbox label="Remember me" defaultChecked />\n` +
    `<Checkbox label="Subscribe to newsletter" defaultChecked={false} />\n\n` +
    `// Checkbox without Label\n` +
    `<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />\n\n` +
    `// Disabled Checkbox\n` +
    `<Checkbox label="Disabled (unchecked)" disabled />\n` +
    `<Checkbox label="Disabled (checked)" checked disabled />\n\n` +
    `// Custom Styling\n` +
    `<Checkbox\n` +
    `  label="Custom styled"\n` +
    `  checked={checked}\n` +
    `  onChange={(e) => setChecked(e.target.checked)}\n` +
    `  containerClassName="p-2 rounded bg-accent/10"\n` +
    `  labelClassName="font-semibold text-primary"\n` +
    `/>`;

  const demo = (
    <div className="space-y-6">
      {/* Controlled Checkbox */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Controlled Checkbox</p>
        <div className="space-y-2">
          <Checkbox label="Đồng ý điều khoản" checked={checked1} onChange={(e) => setChecked1(e.target.checked)} />
          <p className="text-xs text-muted-foreground">Status: {checked1 ? "Checked" : "Unchecked"}</p>
        </div>
      </div>

      {/* Uncontrolled Checkbox */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Uncontrolled Checkbox (with defaultChecked)</p>
        <div className="space-y-2">
          <Checkbox label="Remember me" defaultChecked />
          <Checkbox label="Subscribe to newsletter" defaultChecked={false} />
        </div>
      </div>

      {/* Checkbox without Label */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Checkbox without Label</p>
        <Checkbox checked={checked2} onChange={(e) => setChecked2(e.target.checked)} />
      </div>

      {/* Disabled Checkbox */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled Checkbox</p>
        <div className="space-y-2">
          <Checkbox label="Disabled (unchecked)" disabled />
          <Checkbox label="Disabled (checked)" checked disabled />
        </div>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Styling</p>
        <Checkbox
          label="Custom styled"
          checked={checked3}
          onChange={(e) => setChecked3(e.target.checked)}
          containerClassName="p-2 rounded bg-accent/10 hover:bg-accent/20"
          labelClassName="font-semibold text-primary"
        />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "className", description: t("props.checkbox.className"), type: "string", default: "-" },
    { property: "label", description: t("props.checkbox.label"), type: "React.ReactNode", default: "-" },
    { property: "labelClassName", description: t("props.checkbox.labelClassName"), type: "string", default: "-" },
    { property: "containerClassName", description: t("props.checkbox.containerClassName"), type: "string", default: "-" },
    { property: "checked", description: t("props.checkbox.checked"), type: "boolean", default: "-" },
    { property: "defaultChecked", description: t("props.checkbox.defaultChecked"), type: "boolean", default: "false" },
    { property: "onChange", description: t("props.checkbox.onChange"), type: "(e: React.ChangeEvent<HTMLInputElement>) => void", default: "-" },
    { property: "disabled", description: t("props.checkbox.disabled"), type: "boolean", default: "false" },
    { property: "name", description: t("props.checkbox.name"), type: "string", default: "-" },
    { property: "value", description: t("props.checkbox.value"), type: "string", default: "-" },
    { property: "id", description: t("props.checkbox.id"), type: "string", default: "-" },
  ];
  const order = [
    "className",
    "label",
    "labelClassName",
    "containerClassName",
    "checked",
    "defaultChecked",
    "onChange",
    "disabled",
    "name",
    "value",
    "id",
  ];
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

