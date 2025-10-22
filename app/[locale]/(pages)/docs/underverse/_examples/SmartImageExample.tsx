"use client";

import React from "react";
import SmartImage from "@/components/ui/SmartImage";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SmartImageExample() {
  const demo = (
    <div className="w-64 h-40 relative border rounded-md overflow-hidden">
      <SmartImage src="https://picsum.photos/seed/uv123/300/200" alt="Demo" fill className="object-cover" />
    </div>
  );

  const code =
    `import { SmartImage } from '@underverse-ui/underverse'\n\n` +
    `<div className='w-64 h-40 relative border rounded-md overflow-hidden'>\n` +
    `  <SmartImage src='https://picsum.photos/seed/uv123/300/200' alt='Demo' fill className='object-cover'/>\n` +
    `</div>`;

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

