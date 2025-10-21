"use client";

import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";

export default function SheetExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet open={open} onOpenChange={setOpen} side="right" title="Demo Sheet" description="Nội dung ví dụ">
        <div className="p-4">Hello from Sheet</div>
      </Sheet>
      <CodeBlock
        code={`import { Sheet, Button } from '@underverse-ui/underverse'\n\nconst [open, setOpen] = useState(false)\n<Button onClick={() => setOpen(true)}>Open Sheet</Button>\n<Sheet open={open} onOpenChange={setOpen} side='right' title='Demo Sheet'>...content...</Sheet>`}
      />
    </div>
  );
}

