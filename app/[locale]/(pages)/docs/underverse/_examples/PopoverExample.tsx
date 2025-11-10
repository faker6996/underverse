"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Popover } from "@/components/ui/Popover";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import Input from "@/components/ui/Input";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function PopoverExample() {
  const t = useTranslations("DocsUnderverse");
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  const code =
    `import { Popover, Button, Input } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `// Basic Popover\n` +
    `<Popover trigger={<Button variant="outline">Open Popover</Button>}>\n` +
    `  <div className="text-sm">Popover content</div>\n` +
    `</Popover>\n\n` +
    `// Placements\n` +
    `<Popover trigger={<Button>Top</Button>} placement="top">\n` +
    `  <div>Top content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Top Start</Button>} placement="top-start">\n` +
    `  <div>Top start content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Top End</Button>} placement="top-end">\n` +
    `  <div>Top end content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Bottom</Button>} placement="bottom">\n` +
    `  <div>Bottom content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Bottom Start</Button>} placement="bottom-start">\n` +
    `  <div>Bottom start content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Bottom End</Button>} placement="bottom-end">\n` +
    `  <div>Bottom end content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Left</Button>} placement="left">\n` +
    `  <div>Left content</div>\n` +
    `</Popover>\n` +
    `<Popover trigger={<Button>Right</Button>} placement="right">\n` +
    `  <div>Right content</div>\n` +
    `</Popover>\n\n` +
    `// Controlled Popover\n` +
    `const [open, setOpen] = useState(false)\n` +
    `<Popover\n` +
    `  trigger={<Button>Controlled</Button>}\n` +
    `  open={open}\n` +
    `  onOpenChange={setOpen}\n` +
    `>\n` +
    `  <div className="space-y-2">\n` +
    `    <p>Controlled popover</p>\n` +
    `    <Button onClick={() => setOpen(false)}>Close</Button>\n` +
    `  </div>\n` +
    `</Popover>\n\n` +
    `// Match Trigger Width\n` +
    `<Popover\n` +
    `  trigger={<Button>Match Width</Button>}\n` +
    `  matchTriggerWidth\n` +
    `>\n` +
    `  <div>Width matches trigger</div>\n` +
    `</Popover>\n\n` +
    `// Custom Width\n` +
    `<Popover\n` +
    `  trigger={<Button>Custom Width</Button>}\n` +
    `  contentWidth={400}\n` +
    `>\n` +
    `  <div>Fixed width 400px</div>\n` +
    `</Popover>\n\n` +
    `// Rich Content\n` +
    `<Popover trigger={<Button>User Profile</Button>}>\n` +
    `  <div className="space-y-3 w-64">\n` +
    `    <div>\n` +
    `      <h4 className="font-semibold">User Settings</h4>\n` +
    `      <p className="text-sm text-muted-foreground">Manage your account</p>\n` +
    `    </div>\n` +
    `    <Input label="Username" defaultValue="john_doe" />\n` +
    `    <div className="flex gap-2">\n` +
    `      <Button size="sm" variant="outline">Cancel</Button>\n` +
    `      <Button size="sm">Save</Button>\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</Popover>\n\n` +
    `// Disabled\n` +
    `<Popover trigger={<Button>Disabled</Button>} disabled>\n` +
    `  <div>Won't open</div>\n` +
    `</Popover>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Popover */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Popover</p>
        <Popover trigger={<Button variant="outline">Open Popover</Button>}>
          <div className="text-sm">This is the popover content. Click outside to close.</div>
        </Popover>
      </div>

      {/* Placements */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Placements</p>
        <div className="flex flex-wrap gap-2">
          <Popover trigger={<Button variant="outline" size="sm">Top</Button>} placement="top">
            <div className="text-sm">Top placement</div>
          </Popover>
          <Popover trigger={<Button variant="outline" size="sm">Top Start</Button>} placement="top-start">
            <div className="text-sm">Top start placement</div>
          </Popover>
          <Popover trigger={<Button variant="outline" size="sm">Top End</Button>} placement="top-end">
            <div className="text-sm">Top end placement</div>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover trigger={<Button variant="outline" size="sm">Bottom</Button>} placement="bottom">
            <div className="text-sm">Bottom placement</div>
          </Popover>
          <Popover trigger={<Button variant="outline" size="sm">Bottom Start</Button>} placement="bottom-start">
            <div className="text-sm">Bottom start placement</div>
          </Popover>
          <Popover trigger={<Button variant="outline" size="sm">Bottom End</Button>} placement="bottom-end">
            <div className="text-sm">Bottom end placement</div>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover trigger={<Button variant="outline" size="sm">Left</Button>} placement="left">
            <div className="text-sm">Left placement</div>
          </Popover>
          <Popover trigger={<Button variant="outline" size="sm">Right</Button>} placement="right">
            <div className="text-sm">Right placement</div>
          </Popover>
        </div>
      </div>

      {/* Controlled Popover */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Controlled Popover</p>
        <Popover
          trigger={<Button variant="outline">Controlled Popover</Button>}
          open={open1}
          onOpenChange={setOpen1}
        >
          <div className="space-y-2">
            <p className="text-sm">This is a controlled popover</p>
            <Button size="sm" onClick={() => setOpen1(false)}>Close</Button>
          </div>
        </Popover>
      </div>

      {/* Match Trigger Width */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Match Trigger Width</p>
        <Popover
          trigger={<Button variant="outline" className="w-64">Wide Button Trigger</Button>}
          matchTriggerWidth
        >
          <div className="text-sm">This popover matches the trigger width</div>
        </Popover>
      </div>

      {/* Custom Width */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Width</p>
        <Popover
          trigger={<Button variant="outline">Custom Width (400px)</Button>}
          contentWidth={400}
        >
          <div className="text-sm">This popover has a fixed width of 400px, regardless of trigger size.</div>
        </Popover>
      </div>

      {/* Rich Content */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Rich Content</p>
        <Popover trigger={<Button variant="outline">User Profile</Button>}>
          <div className="space-y-3 w-64">
            <div>
              <h4 className="font-semibold">User Settings</h4>
              <p className="text-sm text-muted-foreground">Manage your account</p>
            </div>
            <Input label="Username" defaultValue="john_doe" />
            <Input label="Email" type="email" defaultValue="john@example.com" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Cancel</Button>
              <Button size="sm">Save</Button>
            </div>
          </div>
        </Popover>
      </div>

      {/* Interactive Close */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Interactive Close Button</p>
        <Popover
          trigger={<Button variant="outline">Open Menu</Button>}
          open={open2}
          onOpenChange={setOpen2}
        >
          <div className="space-y-2 min-w-48">
            <p className="text-sm font-semibold">Menu Options</p>
            <div className="space-y-1">
              <button className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded">Profile</button>
              <button className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded">Settings</button>
              <button className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded">Logout</button>
            </div>
            <Button size="sm" variant="outline" onClick={() => setOpen2(false)} className="w-full">Close Menu</Button>
          </div>
        </Popover>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled Popover</p>
        <Popover trigger={<Button variant="outline">Disabled Popover</Button>} disabled>
          <div className="text-sm">This won't show</div>
        </Popover>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "trigger", description: t("props.popover.trigger"), type: "React.ReactElement", default: "-" },
    { property: "children", description: t("props.popover.children"), type: "React.ReactNode", default: "-" },
    { property: "className", description: t("props.popover.className"), type: "string", default: "-" },
    { property: "contentClassName", description: t("props.popover.contentClassName"), type: "string", default: "-" },
    { property: "placement", description: t("props.popover.placement"), type: '"top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end"', default: '"bottom"' },
    { property: "modal", description: t("props.popover.modal"), type: "boolean", default: "false" },
    { property: "disabled", description: t("props.popover.disabled"), type: "boolean", default: "false" },
    { property: "open", description: t("props.popover.open"), type: "boolean", default: "-" },
    { property: "onOpenChange", description: t("props.popover.onOpenChange"), type: "(open: boolean) => void", default: "-" },
    { property: "matchTriggerWidth", description: t("props.popover.matchTriggerWidth"), type: "boolean", default: "false" },
    { property: "contentWidth", description: t("props.popover.contentWidth"), type: "number", default: "-" },
  ];
  const order = [
    "trigger","children","className","contentClassName","placement","modal","disabled","open","onOpenChange","matchTriggerWidth","contentWidth"
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

