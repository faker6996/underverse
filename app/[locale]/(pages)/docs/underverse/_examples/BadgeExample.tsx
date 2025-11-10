"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function BadgeExample() {
  const t = useTranslations("DocsUnderverse");
  const code =
    `import { Badge } from '@underverse-ui/underverse'\n\n` +
    `<Badge>Default</Badge>\n` +
    `<Badge variant="primary">Primary</Badge>\n` +
    `<Badge variant="secondary">Secondary</Badge>\n` +
    `<Badge variant="success">Success</Badge>\n` +
    `<Badge variant="warning">Warning</Badge>\n` +
    `<Badge variant="danger">Danger</Badge>\n` +
    `<Badge variant="destructive">Destructive</Badge>\n` +
    `<Badge variant="info">Info</Badge>\n` +
    `<Badge variant="outline">Outline</Badge>\n` +
    `<Badge variant="ghost">Ghost</Badge>\n` +
    `<Badge variant="transparent">Transparent</Badge>\n` +
    `<Badge variant="gradient">Gradient</Badge>`;

  const demo = (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="transparent">Transparent</Badge>
      <Badge variant="gradient">Gradient</Badge>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "children", description: t("props.badge.children"), type: "React.ReactNode", default: "—" },
    { property: "variant", description: t("props.badge.variant"), type: '"default" | "primary" | "secondary" | "success" | "warning" | "danger" | "destructive" | "info" | "outline" | "ghost" | "transparent" | "gradient"', default: '"default"' },
    { property: "size", description: t("props.badge.size"), type: '"xs" | "sm" | "md" | "lg" | "xl"', default: '"md"' },
    { property: "className", description: t("props.badge.className"), type: "string", default: "—" },
    { property: "dot", description: t("props.badge.dot"), type: "boolean", default: "false" },
    { property: "count", description: t("props.badge.count"), type: "number", default: "—" },
    { property: "maxCount", description: t("props.badge.maxCount"), type: "number", default: "99" },
    { property: "showZero", description: t("props.badge.showZero"), type: "boolean", default: "false" },
    { property: "pulse", description: t("props.badge.pulse"), type: "boolean", default: "false" },
    { property: "removable", description: t("props.badge.removable"), type: "boolean", default: "false" },
    { property: "onRemove", description: t("props.badge.onRemove"), type: "() => void", default: "—" },
    { property: "icon", description: t("props.badge.icon"), type: "React.ComponentType<{ className?: string }>", default: "—" },
    { property: "clickable", description: t("props.badge.clickable"), type: "boolean", default: "false" },
    { property: "onClick", description: t("props.badge.onClick"), type: "() => void", default: "—" },
  ];
  const order = [
    "children","variant","size","className","dot","count","maxCount","showZero","pulse","removable","onRemove","icon","clickable","onClick"
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

