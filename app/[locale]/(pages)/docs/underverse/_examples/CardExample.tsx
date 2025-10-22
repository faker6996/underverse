"use client";

import React from "react";
import Card from "@/components/ui/Card";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CardExample() {
  const code =
    `import { Card } from '@underverse-ui/underverse'\n\n` +
    `<Card title="Card title" description="Mô tả ngắn về thẻ">\n` +
    `  <p>Nội dung của Card có thể là bất kỳ React node nào.</p>\n` +
    `</Card>`;

  const demo = (
    <div>
      <Card title="Card title" description="Mô tả ngắn về thẻ">
        <p>Nội dung của Card có thể là bất kỳ React node nào.</p>
      </Card>
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

