"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function CardExample() {
  const t = useTranslations("DocsUnderverse");
  const [clickCount, setClickCount] = React.useState(0);

  const code =
    `import { Card } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n\n` +
    `// Basic Card\n` +
    `<Card title="Card Title" description="Card description here">\n` +
    `  <p>Card content can be any React node.</p>\n` +
    `</Card>\n\n` +
    `// Card with Footer\n` +
    `<Card\n` +
    `  title="Card with Footer"\n` +
    `  description="This card has a footer section"\n` +
    `  footer={<Button size="sm">Action</Button>}\n` +
    `>\n` +
    `  <p>Main content here.</p>\n` +
    `</Card>\n\n` +
    `// Hoverable Card\n` +
    `<Card title="Hoverable" description="Hover to see effect" hoverable>\n` +
    `  <p>This card has hover animations.</p>\n` +
    `</Card>\n\n` +
    `// Clickable Card\n` +
    `const [count, setCount] = useState(0)\n` +
    `<Card\n` +
    `  title="Clickable Card"\n` +
    `  description="Click me!"\n` +
    `  clickable\n` +
    `  onClick={() => setCount(count + 1)}\n` +
    `>\n` +
    `  <p>Clicked {count} times</p>\n` +
    `</Card>\n\n` +
    `// Smart Padding Logic\n` +
    `// 1. Only Horizontal Padding (Vertical keeps default)\n` +
    `<Card title="Horizontal Only" contentClassName="px-8">\n` +
    `  <p>px-8 applied, default py kept</p>\n` +
    `</Card>\n\n` +
    `// 2. Only Vertical Padding (Horizontal keeps default)\n` +
    `<Card title="Vertical Only" contentClassName="py-12">\n` +
    `  <p>py-12 applied, default px kept</p>\n` +
    `</Card>\n\n` +
    `// 3. Full Custom (Overrides all)\n` +
    `<Card title="Full Custom" contentClassName="p-0">\n` +
    `  <img src="/cover.jpg" className="w-full" />\n` +
    `</Card>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Card</p>
        <Card title="Card Title" description="Card description here">
          <p className="text-sm">Card content can be any React node.</p>
        </Card>
      </div>

      {/* Card with Footer */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Card with Footer</p>
        <Card
          title="Card with Footer"
          description="This card has a footer section"
          footer={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Cancel
              </Button>
              <Button size="sm" variant="primary">
                Save
              </Button>
            </div>
          }
        >
          <p className="text-sm">Main content here with action buttons in footer.</p>
        </Card>
      </div>

      {/* Hoverable Card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Hoverable Card</p>
        <Card title="Hoverable" description="Hover to see effect" hoverable>
          <p className="text-sm">This card has hover animations - try hovering over it!</p>
        </Card>
      </div>

      {/* Clickable Card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Clickable Card</p>
        <Card title="Clickable Card" description="Click me!" clickable onClick={() => setClickCount(clickCount + 1)}>
          <p className="text-sm">
            Clicked <strong>{clickCount}</strong> times
          </p>
        </Card>
      </div>

      {/* Smart Padding */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Smart Padding</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Horizontal Only" contentClassName="px-8 border border-dashed">
            <p className="text-sm bg-accent/10">px-8 applied, default py kept</p>
          </Card>
          <Card title="Vertical Only" contentClassName="py-12 border border-dashed">
            <p className="text-sm bg-accent/10">py-12 applied, default px kept</p>
          </Card>
        </div>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Styling</p>
        <Card
          title="Custom Styles"
          description="With gradient background and centered content"
          className="bg-linear-to-br from-primary/10 to-transparent border-primary/20"
          contentClassName="text-center"
        >
          <p className="text-sm">Centered content with gradient background</p>
        </Card>
      </div>

      {/* Combined Features */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Combined Features</p>
        <Card
          title="Feature Complete"
          description="Hoverable, with footer and custom styling"
          hoverable
          footer={
            <Button size="sm" variant="gradient">
              Learn More
            </Button>
          }
          className="border-primary/30"
        >
          <p className="text-sm">This card combines multiple features: hoverable effect, footer section, and custom border color.</p>
        </Card>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "title", description: t("props.card.title"), type: "React.ReactNode", default: "—" },
    { property: "description", description: t("props.card.description"), type: "React.ReactNode", default: "—" },
    { property: "footer", description: t("props.card.footer"), type: "React.ReactNode", default: "—" },
    { property: "hoverable", description: t("props.card.hoverable"), type: "boolean", default: "false" },
    { property: "clickable", description: t("props.card.clickable"), type: "boolean", default: "false" },
    { property: "onClick", description: t("props.card.onClick"), type: "() => void", default: "—" },
    { property: "className", description: t("props.card.className"), type: "string", default: "—" },
    { property: "contentClassName", description: t("props.card.contentClassName"), type: "string", default: "—" },
  ];
  const order = ["title", "description", "footer", "hoverable", "clickable", "onClick", "className", "contentClassName"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Card.md" />;

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
