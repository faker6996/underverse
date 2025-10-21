"use client";

import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";

export default function TooltipExample() {
  return (
    <div className="space-y-3">
      <Tooltip content="Tooltip mặc định">
        <Button variant="outline">Hover me</Button>
      </Tooltip>
      <CodeBlock
        code={`import { Tooltip, Button } from '@underverse-ui/underverse'\n\n<Tooltip content='Tooltip mặc định'>\n  <Button variant='outline'>Hover me</Button>\n</Tooltip>`}
      />
    </div>
  );
}

