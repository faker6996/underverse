"use client";

import React from "react";
import AccessDenied from "@/components/ui/AccessDenied";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { Lock } from "lucide-react";

export default function AccessDeniedExample() {
  const code =
    `import { AccessDenied, Button } from '@underverse-ui/underverse'\n` +
    `import { Lock } from 'lucide-react'\n\n` +
    `// Variants\n` +
    `<AccessDenied variant="destructive" />\n` +
    `<AccessDenied variant="warning" />\n` +
    `<AccessDenied variant="info" />\n\n` +
    `// Custom Title and Description\n` +
    `<AccessDenied\n` +
    `  title="Permission Required"\n` +
    `  description="You need administrator privileges to access this resource"\n` +
    `/>\n\n` +
    `// Custom Icon\n` +
    `<AccessDenied\n` +
    `  variant="warning"\n` +
    `  icon={Lock}\n` +
    `  title="Locked Content"\n` +
    `  description="This content is currently locked"\n` +
    `/>\n\n` +
    `// With Actions\n` +
    `<AccessDenied\n` +
    `  title="Authentication Required"\n` +
    `  description="Please sign in to continue"\n` +
    `  variant="info"\n` +
    `>\n` +
    `  <div className="flex gap-2">\n` +
    `    <Button variant="outline">Go Back</Button>\n` +
    `    <Button variant="primary">Sign In</Button>\n` +
    `  </div>\n` +
    `</AccessDenied>\n\n` +
    `// Minimal\n` +
    `<AccessDenied />`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <AccessDenied variant="destructive" className="max-w-xl" />
          <AccessDenied variant="warning" className="max-w-xl" />
          <AccessDenied variant="info" className="max-w-xl" />
        </div>
      </div>

      {/* Custom Title and Description */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Title and Description</p>
        <AccessDenied
          title="Permission Required"
          description="You need administrator privileges to access this resource"
          className="max-w-xl"
        />
      </div>

      {/* Custom Icon */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Icon</p>
        <AccessDenied
          variant="warning"
          icon={Lock}
          title="Locked Content"
          description="This content is currently locked"
          className="max-w-xl"
        />
      </div>

      {/* With Actions */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Actions</p>
        <AccessDenied
          title="Authentication Required"
          description="Please sign in to continue"
          variant="info"
          className="max-w-xl"
        >
          <div className="flex gap-2">
            <Button variant="outline">Go Back</Button>
            <Button variant="primary">Sign In</Button>
          </div>
        </AccessDenied>
      </div>

      {/* Minimal */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Minimal (Default)</p>
        <AccessDenied className="max-w-xl" />
      </div>
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

