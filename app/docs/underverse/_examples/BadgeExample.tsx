"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import CodeBlock from "../_components/CodeBlock";

export default function BadgeExample() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge>Default</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <CodeBlock
        code={`import { Badge } from '@underverse-ui/underverse'\n\n<Badge>Default</Badge>\n<Badge variant='primary'>Primary</Badge>\n<Badge variant='success'>Success</Badge>`}
      />
    </div>
  );
}

