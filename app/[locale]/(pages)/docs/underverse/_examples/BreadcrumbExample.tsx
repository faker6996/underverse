"use client";

import React from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function BreadcrumbExample() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Underverse", href: "/docs/underverse" },
    { label: "Components" },
  ];
  const demo = (
    <div className="space-y-3">
      <Breadcrumb items={items} variant="pill" />
    </div>
  );

  const code =
    `import { Breadcrumb } from '@underverse-ui/underverse'\n\n` +
    `<Breadcrumb items={[\n` +
    `  { label: 'Home', href: '/' },\n` +
    `  { label: 'Docs', href: '/docs' },\n` +
    `  { label: 'Underverse', href: '/docs/underverse' },\n` +
    `  { label: 'Components' },\n` +
    `]} variant=\"pill\" />`;

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
