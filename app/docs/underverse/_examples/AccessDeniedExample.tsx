"use client";

import React from "react";
import AccessDenied from "@/components/ui/AccessDenied";
import CodeBlock from "../_components/CodeBlock";

export default function AccessDeniedExample() {
  return (
    <div className="space-y-3">
      <AccessDenied className="max-w-xl" />
      <CodeBlock code={`import { AccessDenied } from '@underverse-ui/underverse'\n\n<AccessDenied />`} />
    </div>
  );
}

