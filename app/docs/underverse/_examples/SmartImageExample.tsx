"use client";

import React from "react";
import SmartImage from "@/components/ui/SmartImage";
import CodeBlock from "../_components/CodeBlock";

export default function SmartImageExample() {
  return (
    <div className="space-y-3">
      <div className="w-64 h-40 relative border rounded-md overflow-hidden">
        <SmartImage src="https://picsum.photos/seed/uv123/300/200" alt="Demo" fill className="object-cover" />
      </div>
      <CodeBlock
        code={`import { SmartImage } from '@underverse-ui/underverse'\n\n<div className='w-64 h-40 relative'>\n  <SmartImage src='https://picsum.photos/seed/uv/300/200' alt='Demo' fill className='object-cover'/>\n</div>`}
      />
    </div>
  );
}

