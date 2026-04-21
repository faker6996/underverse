"use client";


import React from "react";
import { useTranslations } from "next-intl";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { Home, User, Settings } from "lucide-react";
import CodeBlock from "../_components/CodeBlock";

export default function TabsExample() {
  const t = useTranslations("DocsUnderverse");
  const basicTabs = [
    { value: "a", label: "Tab A", content: <div className="p-3">Content A</div> },
    { value: "b", label: "Tab B", content: <div className="p-3">Content B</div> },
    { value: "c", label: "Tab C", content: <div className="p-3">Content C</div> },
  ];

  const iconTabs = [
    { value: "home", label: "Home", icon: Home, content: <div className="p-3">Home content</div> },
    { value: "profile", label: "Profile", icon: User, content: <div className="p-3">Profile content</div> },
    { value: "settings", label: "Settings", icon: Settings, content: <div className="p-3">Settings content</div> },
  ];

  const nestedCardTabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-4 shadow-sm">
          Inner card content without double wrapper styles.
        </div>
      ),
    },
    {
      value: "activity",
      label: "Activity",
      content: (
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          Timeline or list content can keep its own spacing and border.
        </div>
      ),
    },
  ];

  const linkTabs = [
    {
      value: "overview",
      label: "Overview",
      content: <div className="p-3">Plain tabs now expose a real link target, so middle-click and open-in-new-tab work out of the box.</div>,
    },
    {
      value: "api",
      label: "API",
      content: <div className="p-3">Left click still switches content locally. The link is there mainly for middle-click and context menu open-in-new-tab.</div>,
    },
    {
      value: "docs",
      label: "Docs",
      href: "/docs/underverse#tabs",
      target: "_blank" as const,
      rel: "noreferrer",
      content: <div className="p-3">Pass `href` only when a tab should open a custom destination instead of the built-in same-page hash link.</div>,
    },
  ];

  const code =
    `import { Tabs } from '@underverse-ui/underverse'\n` +
    `import { Home, User, Settings } from 'lucide-react'\n\n` +
    `// Variants\n` +
    `<Tabs tabs={tabs} variant="default" />\n` +
    `<Tabs tabs={tabs} variant="pills" />\n` +
    `<Tabs tabs={tabs} variant="underline" />\n` +
    `<Tabs tabs={tabs} variant="card" />\n` +
    `<Tabs tabs={tabs} variant="underline-card" />\n\n` +
    `// Sizes\n` +
    `<Tabs tabs={tabs} size="sm" />\n` +
    `<Tabs tabs={tabs} size="md" />\n` +
    `<Tabs tabs={tabs} size="lg" />\n\n` +
    `// With Icons\n` +
    `const iconTabs = [\n` +
    `  { value: "home", label: "Home", icon: Home, content: <div>Home</div> },\n` +
    `  { value: "profile", label: "Profile", icon: User, content: <div>Profile</div> },\n` +
    `]\n` +
    `<Tabs tabs={iconTabs} variant="pills" />\n\n` +
    `// Vertical Orientation\n` +
    `<Tabs tabs={tabs} orientation="vertical" variant="card" />\n\n` +
    `// Stretch (evenly distribute)\n` +
    `<Tabs tabs={tabs} stretch />\n\n` +
    `// Bare content panel (avoid nested card)\n` +
    `<Tabs tabs={tabs} variant="underline" noContentCard noContentPadding contentClassName="mt-4" />\n\n` +
    `// Tabs expose a link target for middle-click / open in new tab by default\n` +
    `<Tabs tabs={tabs} />\n\n` +
    `// Optional custom destination\n` +
    `<Tabs tabs={[{ value: "docs", label: "Docs", href: "/docs/tabs", target: "_blank", rel: "noreferrer", content: <div /> }]} />\n\n` +
    `// Disabled Tab\n` +
    `const tabs = [\n` +
    `  { value: "a", label: "Active", content: <div>Active</div> },\n` +
    `  { value: "b", label: "Disabled", content: <div>Disabled</div>, disabled: true },\n` +
    `]`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-4">
          <div>
            <span className="text-xs text-muted-foreground">Default:</span>
            <Tabs tabs={basicTabs} variant="default" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Pills:</span>
            <Tabs tabs={basicTabs} variant="pills" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Underline:</span>
            <Tabs tabs={basicTabs} variant="underline" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Card:</span>
            <Tabs tabs={basicTabs} variant="card" />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-4">
          <div>
            <span className="text-xs text-muted-foreground">Small:</span>
            <Tabs tabs={basicTabs} size="sm" variant="pills" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Medium:</span>
            <Tabs tabs={basicTabs} size="md" variant="pills" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Large:</span>
            <Tabs tabs={basicTabs} size="lg" variant="pills" />
          </div>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Icons</p>
        <Tabs tabs={iconTabs} variant="pills" />
      </div>

      {/* Stretch */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Stretch (evenly distribute)</p>
        <Tabs tabs={basicTabs} stretch variant="default" />
      </div>

      {/* Nested card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Bare Content Panel</p>
        <Tabs tabs={nestedCardTabs} variant="underline" noContentCard noContentPadding contentClassName="mt-4" animateContent />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Open In New Tab</p>
        <p className="text-xs text-muted-foreground">Middle-click and context menu open-in-new-tab work even on normal tabs. `href` is only needed when you want a custom destination.</p>
        <Tabs tabs={linkTabs} variant="underline" />
      </div>

      {/* Disabled Tab */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled Tab</p>
        <Tabs
          tabs={[
            { value: "a", label: "Active", content: <div className="p-3">This tab is active</div> },
            { value: "b", label: "Disabled", content: <div className="p-3">This tab is disabled</div>, disabled: true },
            { value: "c", label: "Active 2", content: <div className="p-3">Another active tab</div> },
          ]}
          variant="pills"
        />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "id", description: "Stable namespace for generated tab and panel ids when multiple tab groups share the same values.", type: "string", default: "auto-generated" },
    { property: "tabs", description: t("props.tabs.tabs"), type: "Array<{ value: string; label: React.ReactNode; content: React.ReactNode; icon?: React.ComponentType; disabled?: boolean; href?: string; target?: string; rel?: string }>", default: "—" },
    { property: "variant", description: t("props.tabs.variant"), type: '"default" | "pills" | "underline" | "card" | "underline-card"', default: '"default"' },
    { property: "size", description: t("props.tabs.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "orientation", description: t("props.tabs.orientation"), type: '"horizontal" | "vertical"', default: '"horizontal"' },
    { property: "stretch", description: t("props.tabs.stretch"), type: "boolean", default: "false" },
    { property: "contentClassName", description: "Custom classes for the tab panel wrapper", type: "string", default: "—" },
    { property: "noContentCard", description: "Disable the default card-style content wrapper", type: "boolean", default: "false" },
    { property: "noContentPadding", description: "Disable the default content padding on the panel wrapper", type: "boolean", default: "false" },
    { property: "animateContent", description: "Add a small fade transition when switching tabs", type: "boolean", default: "true" },
  ];
  const order = ["id","tabs","variant","size","orientation","stretch","contentClassName","noContentCard","noContentPadding","animateContent"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Tabs.md" />;

  return (
    <Tabs id="tabs-docs"
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
