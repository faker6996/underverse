"use client";

import React from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CodeBlock from "../_components/CodeBlock";

export default function BreadcrumbExample() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Underverse", href: "/docs/underverse" },
    { label: "Components" },
  ];
  return (
    <div className="space-y-3">
      <Breadcrumb items={items} variant="pill" />
      <CodeBlock
        code={`import { Breadcrumb } from '@underverse-ui/underverse'\n\n<Breadcrumb items={[\n  { label: 'Home', href: '/' },\n  { label: 'Docs', href: '/docs' },\n  { label: 'Underverse', href: '/docs/underverse' },\n  { label: 'Components' },\n]} variant='pill'/>`}
      />
    </div>
  );
}

