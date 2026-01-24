"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { ArrowRight, Download, Plus } from "lucide-react";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ButtonExample() {
  const t = useTranslations("DocsUnderverse");
  const [saving, setSaving] = React.useState(false);
  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
  };

  const code =
    `import { Button } from '@underverse-ui/underverse'\n` +
    `import { ArrowRight, Download, Plus } from 'lucide-react'\n\n` +
    `const [saving, setSaving] = useState(false)\n` +
    `const onSave = async () => {\n` +
    `  setSaving(true)\n` +
    `  await new Promise((r) => setTimeout(r, 900))\n` +
    `  setSaving(false)\n` +
    `}\n\n` +
    `// Variants\n` +
    `<Button>Default</Button>\n` +
    `<Button variant=\"primary\">Primary</Button>\n` +
    `<Button variant=\"secondary\">Secondary</Button>\n` +
    `<Button variant=\"success\">Success</Button>\n` +
    `<Button variant=\"warning\">Warning</Button>\n` +
    `<Button variant=\"danger\">Danger</Button>\n` +
    `<Button variant=\"info\">Info</Button>\n` +
    `<Button variant=\"outline\">Outline</Button>\n` +
    `<Button variant=\"ghost\">Ghost</Button>\n` +
    `<Button variant=\"link\">Link</Button>\n` +
    `<Button variant=\"gradient\">Gradient (variant)</Button>\n` +
    `<Button gradient>Gradient (prop)</Button>\n\n` +
    `// Sizes\n` +
    `<Button size=\"sm\">Small</Button>\n` +
    `<Button size=\"md\">Medium</Button>\n` +
    `<Button size=\"lg\">Large</Button>\n` +
    `<Button size=\"smx\">Smx</Button>\n` +
    `<Button size=\"icon\" variant=\"outline\" icon={Plus} aria-label=\"Add\" />\n\n` +
    `// Icons\n` +
    `<Button icon={Download}>Download</Button>\n` +
    `<Button iconRight={ArrowRight} variant=\"primary\">Tiếp tục</Button>\n` +
    `<Button icon={Plus} iconRight={ArrowRight} variant=\"secondary\">New</Button>\n\n` +
    `// Loading & Disabled\n` +
    `<Button loading loadingText=\"Đang xử lý...\">Loading</Button>\n` +
    `<Button disabled variant=\"outline\">Disabled</Button>\n` +
    `<Button loading preserveChildrenOnLoading variant=\"success\">Lưu</Button>\n` +
    `<Button onClick={onSave} loading={saving} variant=\"primary\">Lưu thay đổi</Button>\n\n` +
    `// Behavior\n` +
    `<Button preventDoubleClick onClick={handleClick}>Chống double-click</Button>\n` +
    `<Button fullWidth variant=\"outline\">Full width button</Button>`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="info">Info</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link" title="Link style">
            Link
          </Button>
          <Button variant="gradient">Gradient (variant)</Button>
          <Button gradient>Gradient (prop)</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="smx">Smx</Button>
          <Button size="icon" variant="outline" icon={Plus} aria-label="Add" />
        </div>
      </div>

      {/* Icons */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Icons</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={Download}>Download</Button>
          <Button iconRight={ArrowRight} variant="primary">
            Tiếp tục
          </Button>
          <Button icon={Plus} iconRight={ArrowRight} variant="secondary">
            New
          </Button>
        </div>
      </div>

      {/* Loading & disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Loading / Disabled</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading loadingText="Dang x? ly...">
            Loading
          </Button>
          <Button disabled variant="outline">
            Disabled
          </Button>
          <Button loading preserveChildrenOnLoading variant="success">
            Lưu
          </Button>
          <Button onClick={onSave} loading={saving} variant="primary">
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Behavior */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Behavior</p>
        <div className="flex flex-col gap-3">
          <Button preventDoubleClick onClick={() => console.log("clicked")}>
            Chống double-click
          </Button>
          <Button fullWidth variant="outline">
            Full width button
          </Button>
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "onClick", description: t("props.button.onClick"), type: "(event: React.MouseEvent<HTMLButtonElement>) => void", default: "—" },
    { property: "children", description: t("props.button.children"), type: "React.ReactNode", default: "—" },
    { property: "type", description: t("props.button.type"), type: '"button" | "submit" | "reset"', default: '"button"' },
    { property: "icon", description: t("props.button.icon"), type: "React.ComponentType<{ className?: string }>", default: "—" },
    { property: "iconRight", description: t("props.button.iconRight"), type: "React.ComponentType<{ className?: string }>", default: "—" },
    {
      property: "variant",
      description: t("props.button.variant"),
      type: '"default" | "outline" | "primary" | "secondary" | "success" | "danger" | "destructive" | "warning" | "info" | "ghost" | "link" | "gradient"',
      default: '"default"',
    },
    { property: "size", description: t("props.button.size"), type: '"sm" | "md" | "lg" | "smx" | "icon"', default: '"md"' },
    { property: "className", description: t("props.button.className"), type: "string", default: '""' },
    { property: "iConClassName", description: t("props.button.iConClassName"), type: "string", default: '""' },
    { property: "disabled", description: t("props.button.disabled"), type: "boolean", default: "false" },
    { property: "loading", description: t("props.button.loading"), type: "boolean", default: "false" },
    { property: "fullWidth", description: t("props.button.fullWidth"), type: "boolean", default: "false" },
    { property: "title", description: t("props.button.title"), type: "string", default: "—" },
    { property: "spinner", description: t("props.button.spinner"), type: "React.ComponentType<{ className?: string }>", default: "Activity" },
    { property: "loadingText", description: t("props.button.loadingText"), type: "React.ReactNode", default: "—" },
    { property: "preserveChildrenOnLoading", description: t("props.button.preserveChildrenOnLoading"), type: "boolean", default: "false" },
    { property: "preventDoubleClick", description: t("props.button.preventDoubleClick"), type: "boolean", default: "false" },
    { property: "lockMs", description: t("props.button.lockMs"), type: "number", default: "600" },
    { property: "asContainer", description: t("props.button.asContainer"), type: "boolean", default: "false" },
    { property: "noWrap", description: t("props.button.noWrap"), type: "boolean", default: "true" },
    { property: "noHoverOverlay", description: t("props.button.noHoverOverlay"), type: "boolean", default: "false" },
    { property: "gradient", description: t("props.button.gradient"), type: "boolean", default: "false" },
    { property: "aria-label", description: t("props.button.aria-label"), type: "string", default: "—" },
  ];

  const order = [
    "onClick",
    "children",
    "type",
    "icon",
    "iconRight",
    "variant",
    "size",
    "className",
    "iConClassName",
    "disabled",
    "loading",
    "fullWidth",
    "title",
    "spinner",
    "loadingText",
    "preserveChildrenOnLoading",
    "preventDoubleClick",
    "lockMs",
    "asContainer",
    "noWrap",
    "noHoverOverlay",
    "gradient",
    "aria-label",
  ];

  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Button.md" />;

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
