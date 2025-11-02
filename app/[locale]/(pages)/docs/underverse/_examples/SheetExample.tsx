"use client";

import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SheetExample() {
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [open5, setOpen5] = React.useState(false);
  const [open6, setOpen6] = React.useState(false);
  const [open7, setOpen7] = React.useState(false);
  const [open8, setOpen8] = React.useState(false);

  const code =
    `import { Sheet, Button, Input } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `// Basic Sheet\n` +
    `const [open, setOpen] = useState(false)\n` +
    `<Button onClick={() => setOpen(true)}>Open Sheet</Button>\n` +
    `<Sheet open={open} onOpenChange={setOpen} title="Sheet Title" description="Sheet description">\n` +
    `  <div>Sheet content here</div>\n` +
    `</Sheet>\n\n` +
    `// Sides (Positions)\n` +
    `<Sheet open={open} onOpenChange={setOpen} side="right" title="Right Sheet">...</Sheet>\n` +
    `<Sheet open={open} onOpenChange={setOpen} side="left" title="Left Sheet">...</Sheet>\n` +
    `<Sheet open={open} onOpenChange={setOpen} side="top" title="Top Sheet">...</Sheet>\n` +
    `<Sheet open={open} onOpenChange={setOpen} side="bottom" title="Bottom Sheet">...</Sheet>\n\n` +
    `// Sizes\n` +
    `<Sheet open={open} onOpenChange={setOpen} size="sm" title="Small">...</Sheet>\n` +
    `<Sheet open={open} onOpenChange={setOpen} size="md" title="Medium">...</Sheet>\n` +
    `<Sheet open={open} onOpenChange={setOpen} size="lg" title="Large">...</Sheet>\n` +
    `<Sheet open={open} onOpenChange={setOpen} size="xl" title="Extra Large">...</Sheet>\n\n` +
    `// With Footer\n` +
    `<Sheet\n` +
    `  open={open}\n` +
    `  onOpenChange={setOpen}\n` +
    `  title="Sheet with Footer"\n` +
    `  footer={\n` +
    `    <div className="flex gap-2 justify-end">\n` +
    `      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>\n` +
    `      <Button onClick={() => setOpen(false)}>Save</Button>\n` +
    `    </div>\n` +
    `  }\n` +
    `>\n` +
    `  <div>Content with footer actions</div>\n` +
    `</Sheet>\n\n` +
    `// With Form Content\n` +
    `<Sheet open={open} onOpenChange={setOpen} title="Edit Profile">\n` +
    `  <div className="space-y-4">\n` +
    `    <Input label="Name" defaultValue="John Doe" />\n` +
    `    <Input label="Email" type="email" defaultValue="john@example.com" />\n` +
    `  </div>\n` +
    `</Sheet>\n\n` +
    `// Without Close Button\n` +
    `<Sheet open={open} onOpenChange={setOpen} title="No Close Button" showClose={false}>...</Sheet>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Sheet */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Sheet</p>
        <Button onClick={() => setOpen1(true)}>Open Sheet</Button>
        <Sheet open={open1} onOpenChange={setOpen1} title="Sheet Title" description="This is a sheet description">
          <div className="space-y-4">
            <p className="text-sm">This is the basic sheet content. It slides in from the right side by default.</p>
            <p className="text-sm text-muted-foreground">Click outside or press Escape to close.</p>
          </div>
        </Sheet>
      </div>

      {/* Sides (Positions) */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sides (Positions)</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen2(true)}>Right</Button>
          <Button variant="outline" size="sm" onClick={() => setOpen3(true)}>Left</Button>
          <Button variant="outline" size="sm" onClick={() => setOpen4(true)}>Top</Button>
          <Button variant="outline" size="sm" onClick={() => setOpen5(true)}>Bottom</Button>
        </div>
        <Sheet open={open2} onOpenChange={setOpen2} side="right" title="Right Sheet">
          <p className="text-sm">Slides in from the right side</p>
        </Sheet>
        <Sheet open={open3} onOpenChange={setOpen3} side="left" title="Left Sheet">
          <p className="text-sm">Slides in from the left side</p>
        </Sheet>
        <Sheet open={open4} onOpenChange={setOpen4} side="top" title="Top Sheet">
          <p className="text-sm">Slides down from the top</p>
        </Sheet>
        <Sheet open={open5} onOpenChange={setOpen5} side="bottom" title="Bottom Sheet">
          <p className="text-sm">Slides up from the bottom</p>
        </Sheet>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen6(true)}>Large (lg)</Button>
        </div>
        <Sheet open={open6} onOpenChange={setOpen6} size="lg" title="Large Sheet">
          <p className="text-sm">This is a large sheet (500px wide)</p>
        </Sheet>
      </div>

      {/* With Footer */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Footer</p>
        <Button variant="outline" onClick={() => setOpen7(true)}>Open Sheet with Footer</Button>
        <Sheet
          open={open7}
          onOpenChange={setOpen7}
          title="Sheet with Footer"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen7(false)}>Cancel</Button>
              <Button onClick={() => setOpen7(false)}>Save</Button>
            </div>
          }
        >
          <p className="text-sm">This sheet has footer actions at the bottom</p>
        </Sheet>
      </div>

      {/* With Form Content */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Form Content</p>
        <Button variant="outline" onClick={() => setOpen8(true)}>Edit Profile</Button>
        <Sheet open={open8} onOpenChange={setOpen8} title="Edit Profile">
          <div className="space-y-4">
            <Input label="Name" defaultValue="John Doe" />
            <Input label="Email" type="email" defaultValue="john@example.com" />
          </div>
        </Sheet>
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

