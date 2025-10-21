"use client";

import React from "react";
import Card from "@/components/ui/Card";
import CodeBlock from "../_components/CodeBlock";

export default function CardExample() {
  return (
    <div className="space-y-3">
      <Card title="Card title" description="Mô tả ngắn về thẻ">
        <p>Nội dung của Card có thể là bất kỳ React node nào.</p>
      </Card>
      <CodeBlock
        code={`import { Card } from '@underverse-ui/underverse'\n\n<Card title='Card title' description='Mô tả ngắn'>\n  <p>Content...</p>\n</Card>`}
      />
    </div>
  );
}

