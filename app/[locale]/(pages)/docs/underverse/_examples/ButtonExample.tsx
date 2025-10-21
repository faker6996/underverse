"use client";

import React from "react";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";

export default function ButtonExample() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button loading loadingText="Đang xử lý...">Loading</Button>
      </div>
      <CodeBlock
        code={`import { Button } from '@underverse-ui/underverse'\n\n<Button>Default</Button>\n<Button variant="primary">Primary</Button>\n<Button variant="success">Success</Button>\n<Button loading loadingText="Đang xử lý...">Loading</Button>`}
      />
    </div>
  );
}

