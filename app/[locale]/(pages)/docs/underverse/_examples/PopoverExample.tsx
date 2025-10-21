"use client";

import React from "react";
import { Popover } from "@/components/ui/Popover";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";

export default function PopoverExample() {
  return (
    <div className="space-y-3">
      <Popover
        trigger={<Button variant="outline">Open Popover</Button>}
      >
        <div className="p-3 text-sm">Nội dung Popover</div>
      </Popover>
      <CodeBlock
        code={`import { Popover, Button } from '@underverse-ui/underverse'\n\n<Popover trigger={<Button variant='outline'>Open Popover</Button>}>\n  <div className='p-3 text-sm'>Nội dung Popover</div>\n</Popover>`}
      />
    </div>
  );
}

