"use client";

import React from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Home, FileText, Folder } from "lucide-react";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function BreadcrumbExample() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Underverse", href: "/docs/underverse" },
    { label: "Components" },
  ];

  const itemsWithIcons = [
    { label: "Home", href: "/", icon: Home },
    { label: "Docs", href: "/docs", icon: Folder },
    { label: "Components", icon: FileText },
  ];

  const longItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Computers", href: "/products/electronics/computers" },
    { label: "Laptops", href: "/products/electronics/computers/laptops" },
    { label: "Gaming", href: "/products/electronics/computers/laptops/gaming" },
    { label: "MacBook Pro" },
  ];

  const code =
    `import { Breadcrumb } from '@underverse-ui/underverse'\n` +
    `import { Home, FileText, Folder } from 'lucide-react'\n\n` +
    `// Variants\n` +
    `<Breadcrumb items={items} variant="default" />\n` +
    `<Breadcrumb items={items} variant="slash" />\n` +
    `<Breadcrumb items={items} variant="arrow" />\n` +
    `<Breadcrumb items={items} variant="pill" />\n\n` +
    `// Sizes\n` +
    `<Breadcrumb items={items} size="sm" />\n` +
    `<Breadcrumb items={items} size="md" />\n` +
    `<Breadcrumb items={items} size="lg" />\n\n` +
    `// With Icons\n` +
    `const itemsWithIcons = [\n` +
    `  { label: "Home", href: "/", icon: Home },\n` +
    `  { label: "Docs", href: "/docs", icon: Folder },\n` +
    `  { label: "Components", icon: FileText },\n` +
    `]\n` +
    `<Breadcrumb items={itemsWithIcons} variant="pill" />\n\n` +
    `// With Home Icon\n` +
    `<Breadcrumb items={items} showHome homeHref="/" />\n\n` +
    `// Collapsible (long paths)\n` +
    `<Breadcrumb items={longItems} maxItems={4} collapsible />\n\n` +
    `// Custom Separator\n` +
    `<Breadcrumb items={items} separator="›" />`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Default:</span>
            <Breadcrumb items={items} variant="default" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Slash:</span>
            <Breadcrumb items={items} variant="slash" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Arrow:</span>
            <Breadcrumb items={items} variant="arrow" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Pill:</span>
            <Breadcrumb items={items} variant="pill" />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Small:</span>
            <Breadcrumb items={items} size="sm" variant="pill" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Medium:</span>
            <Breadcrumb items={items} size="md" variant="pill" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Large:</span>
            <Breadcrumb items={items} size="lg" variant="pill" />
          </div>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Icons</p>
        <Breadcrumb items={itemsWithIcons} variant="pill" />
      </div>

      {/* With Home Icon */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Home Icon</p>
        <Breadcrumb items={items.slice(1)} showHome homeHref="/" variant="default" />
      </div>

      {/* Collapsible */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Collapsible (long paths)</p>
        <Breadcrumb items={longItems} maxItems={4} collapsible variant="pill" />
        <span className="text-xs text-muted-foreground">← Click "..." to expand</span>
      </div>

      {/* Custom Separator */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Separator</p>
        <Breadcrumb items={items} separator="›" />
      </div>
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
