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
    `import { Button, Card } from '@underverse-ui/underverse'\n\n` +
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
    `// Header / Footer layout hooks\n` +
    `<Card\n` +
    `  title="Project Status"\n` +
    `  description="Updated 5 minutes ago"\n` +
    `  headerClassName="flex-row items-center gap-3"\n` +
    `  footer={<><span className="text-sm text-muted-foreground">Synced</span><Button size="sm">Open</Button></>}\n` +
    `  footerClassName="justify-between"\n` +
    `>\n` +
    `  <p>Use headerClassName and footerClassName for layout tweaks.</p>\n` +
    `</Card>\n\n` +
    `// Content padding\n` +
    `<Card title="Horizontal Only" contentClassName="px-8">\n` +
    `  <p>Horizontal padding is custom, default vertical padding is kept.</p>\n` +
    `</Card>\n\n` +
    `<Card title="Vertical Only" contentClassName="py-12">\n` +
    `  <p>Vertical padding is custom, default horizontal padding is kept.</p>\n` +
    `</Card>\n\n` +
    `<Card title="Media Card" noPadding>\n` +
    `  <img src="/cover.jpg" className="aspect-[16/9] w-full object-cover" alt="" />\n` +
    `</Card>`;

  const demo = (
    <div className="divide-y divide-border/50 md:divide-y-0 md:space-y-6">
      {/* Basic Card */}
      <div className="space-y-2 py-4 md:py-0">
        <p className="text-sm font-medium">Basic Card</p>
        <Card title="Card Title" description="Card description here">
          <p className="text-sm">Card content can be any React node.</p>
        </Card>
      </div>

      {/* Card with Footer */}
      <div className="space-y-2 py-4 md:py-0">
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
      <div className="space-y-2 py-4 md:py-0">
        <p className="text-sm font-medium">Hoverable Card</p>
        <Card title="Hoverable" description="Hover to see effect" hoverable>
          <p className="text-sm">This card has hover animations - try hovering over it!</p>
        </Card>
      </div>

      {/* Clickable Card */}
      <div className="space-y-2 py-4 md:py-0">
        <p className="text-sm font-medium">Clickable Card</p>
        <Card title="Clickable Card" description="Click me!" clickable onClick={() => setClickCount(clickCount + 1)}>
          <p className="text-sm">
            Clicked <strong>{clickCount}</strong> times
          </p>
        </Card>
      </div>

      {/* Smart Padding */}
      <div className="space-y-2 py-4 md:py-0">
        <p className="text-sm font-medium">Smart Padding</p>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          <Card title="Horizontal Only" contentClassName="px-8 border border-dashed">
            <p className="text-sm bg-accent/10">px-8 applied, default py kept</p>
          </Card>
          <Card title="Vertical Only" contentClassName="py-12 border border-dashed">
            <p className="text-sm bg-accent/10">py-12 applied, default px kept</p>
          </Card>
        </div>
      </div>

      <div className="space-y-2 py-4 md:py-0">
        <p className="text-sm font-medium">Header / Footer Layout</p>
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Project Status
            </div>
          }
          description="Updated 5 minutes ago"
          headerClassName="flex-row items-center gap-3"
          footer={
            <>
              <span className="text-sm text-muted-foreground">Synced</span>
              <Button size="sm">Open</Button>
            </>
          }
          footerClassName="justify-between"
        >
          <p className="text-sm">Use headerClassName and footerClassName when you only need layout tweaks.</p>
        </Card>
      </div>

      <div className="space-y-2 py-4 md:py-0">
        <p className="text-sm font-medium">No Padding / Media</p>
        <Card
          title="Media Card"
          description="Use noPadding when the content already owns its own spacing."
          noPadding
          innerClassName="overflow-hidden"
        >
          <div className="aspect-[16/9] w-full bg-linear-to-br from-primary/15 via-primary/5 to-transparent" />
        </Card>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2 py-4 md:py-0">
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
      <div className="space-y-2 py-4 md:py-0">
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
    { property: "headerClassName", description: "Custom class for the header wrapper.", type: "string", default: "—" },
    { property: "footerClassName", description: "Custom class for the footer wrapper.", type: "string", default: "—" },
    { property: "hoverable", description: t("props.card.hoverable"), type: "boolean", default: "false" },
    { property: "clickable", description: t("props.card.clickable"), type: "boolean", default: "false" },
    { property: "onClick", description: t("props.card.onClick"), type: "() => void", default: "—" },
    { property: "className", description: t("props.card.className"), type: "string", default: "—" },
    { property: "contentClassName", description: t("props.card.contentClassName"), type: "string", default: "—" },
    { property: "innerClassName", description: "Custom class for the rounded inner wrapper.", type: "string", default: "—" },
    { property: "noPadding", description: "Removes default content padding.", type: "boolean", default: "false" },
  ];
  const order = [
    "title",
    "description",
    "footer",
    "headerClassName",
    "footerClassName",
    "hoverable",
    "clickable",
    "onClick",
    "className",
    "contentClassName",
    "innerClassName",
    "noPadding",
  ];
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
