"use client";

import React from "react";
import AccessDenied from "@/components/ui/AccessDenied";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function AccessDeniedExample() {
  const demo = (
    <div className="p-1">
      <AccessDenied className="max-w-xl" />
    </div>
  );

  const code =
    `import { AccessDenied } from '@underverse-ui/underverse'\n\n` +
    `<AccessDenied className=\"max-w-xl\" />`;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: demo },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

