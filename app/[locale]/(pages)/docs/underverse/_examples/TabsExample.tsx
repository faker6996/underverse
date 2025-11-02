"use client";

import React from "react";
import { Tabs } from "@/components/ui/Tab";
import { Home, User, Settings } from "lucide-react";
import CodeBlock from "../_components/CodeBlock";

export default function TabsExample() {
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

  const code =
    `import { Tabs } from '@underverse-ui/underverse'\n` +
    `import { Home, User, Settings } from 'lucide-react'\n\n` +
    `// Basic Tabs\n` +
    `<Tabs\n` +
    `  tabs={[\n` +
    `    { value: "a", label: "Tab A", content: <div>Content A</div> },\n` +
    `    { value: "b", label: "Tab B", content: <div>Content B</div> },\n` +
    `  ]}\n` +
    `/>\n\n` +
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
    `// Disabled Tab\n` +
    `const tabs = [\n` +
    `  { value: "a", label: "Active", content: <div>Active</div> },\n` +
    `  { value: "b", label: "Disabled", content: <div>Disabled</div>, disabled: true },\n` +
    `]`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Tabs */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Tabs</p>
        <Tabs tabs={basicTabs} />
      </div>

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

