"use client";

import React from "react";
import { useTranslations } from "next-intl";
import AccessDenied from "@/components/ui/AccessDenied";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { Lock } from "lucide-react";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function AccessDeniedExample() {
  const t = useTranslations("DocsUnderverse");
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

  const rows: PropsRow[] = [
    { property: "title", description: t("props.accessDenied.title"), type: "string", default: '"Access Restricted"' },
    { property: "description", description: t("props.accessDenied.description"), type: "string", default: '"You do not have permission to access this area."' },
    { property: "variant", description: t("props.accessDenied.variant"), type: '"destructive" | "warning" | "info"', default: '"destructive"' },
    { property: "icon", description: t("props.accessDenied.icon"), type: "React.ComponentType<{ className?: string }>", default: "-" },
    { property: "className", description: t("props.accessDenied.className"), type: "string", default: "-" },
    { property: "children", description: t("props.accessDenied.children"), type: "React.ReactNode", default: "-" },
  ];
  const order = ["title","description","variant","icon","className","children"];
  const docs = <PropsDocsTable rows={rows} order={order} />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
