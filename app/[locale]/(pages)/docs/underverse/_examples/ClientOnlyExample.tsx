"use client";

import React from "react";
import ClientOnly from "@/components/ui/ClientOnly";
import CodeBlock from "../_components/CodeBlock";

export default function ClientOnlyExample() {
  return (
    <div className="space-y-3">
      <ClientOnly fallback={<div className="text-sm text-muted-foreground">Loading on client...</div>}>
        <div className="text-sm">Rendered on client at: {new Date().toLocaleTimeString()}</div>
      </ClientOnly>
      <CodeBlock
        code={`import { ClientOnly } from '@underverse-ui/underverse'\n\n<ClientOnly fallback={<div>Loading...</div>}>Client content</ClientOnly>`}
      />
    </div>
  );
}

