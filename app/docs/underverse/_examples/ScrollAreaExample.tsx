"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import CodeBlock from "../_components/CodeBlock";

export default function ScrollAreaExample() {
  return (
    <div className="space-y-3">
      <ScrollArea className="h-32 w-full border border-border rounded-md">
        <div className="p-3 space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="text-sm">Dòng {i + 1}</div>
          ))}
        </div>
      </ScrollArea>
      <CodeBlock
        code={`import { ScrollArea } from '@underverse-ui/underverse'\n\n<ScrollArea className='h-32 w-full border rounded-md'>\n  ...content...\n</ScrollArea>`}
      />
    </div>
  );
}

