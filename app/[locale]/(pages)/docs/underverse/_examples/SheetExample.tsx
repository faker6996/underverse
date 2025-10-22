"use client";

import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SheetExample() {
  const [open, setOpen] = React.useState(false);

  const demo = (
    <>
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet open={open} onOpenChange={setOpen} side="right" title="Demo Sheet" description="N?i dung v� d?">
        <div className="p-4">Hello from Sheet</div>
      </Sheet>
    </>
  );

  const code =
    `import { Sheet, Button } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `const [open, setOpen] = useState(false)\n` +
    `<Button onClick={() => setOpen(true)}>Open Sheet</Button>\n` +
    `<Sheet open={open} onOpenChange={setOpen} side='right' title='Demo Sheet' description='N?i dung v� d?'>\n` +
    `  <div className='p-4'>Hello from Sheet</div>\n` +
    `</Sheet>`;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1 space-y-3">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

