"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { Info, Rocket } from "lucide-react";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function AlertExample() {
  const t = useTranslations("DocsUnderverse");
  const code =
    `import { Alert } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { Info, Rocket } from 'lucide-react'\n\n` +
    `// Variants\n` +
    `<Alert title="Default" description="Default alert message" />\n` +
    `<Alert title="Info" description="Information message" variant="info" />\n` +
    `<Alert title="Success" description="Operation completed" variant="success" />\n` +
    `<Alert title="Warning" description="Please check again" variant="warning" />\n` +
    `<Alert title="Error" description="An error occurred" variant="error" />\n\n` +
    `// Dismissible\n` +
    `<Alert title="Dismissible" description="Click X to close" variant="info" dismissible />\n\n` +
    `// Custom Icon\n` +
    `<Alert\n` +
    `  title="Custom Icon"\n` +
    `  description="Using custom icon"\n` +
    `  icon={<Rocket className="h-4 w-4" />}\n` +
    `/>\n\n` +
    `// With Actions\n` +
    `<Alert\n` +
    `  title="New Update"\n` +
    `  description="Version 2.0 is available"\n` +
    `  variant="info"\n` +
    `  actions={\n` +
    `    <div className="flex gap-2">\n` +
    `      <Button size="sm" variant="outline">Later</Button>\n` +
    `      <Button size="sm">Update Now</Button>\n` +
    `    </div>\n` +
    `  }\n` +
    `/>\n\n` +
    `// Without Title\n` +
    `<Alert description="Alert without title" variant="warning" />`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <Alert title="Default" description="Default alert message" />
          <Alert title="Info" description="Information message" variant="info" />
          <Alert title="Success" description="Operation completed successfully" variant="success" />
          <Alert title="Warning" description="Please check your information again" variant="warning" />
          <Alert title="Error" description="An unexpected error occurred" variant="error" />
        </div>
      </div>

      {/* Dismissible */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Dismissible</p>
        <Alert title="Dismissible Alert" description="Click the X button to close this alert" variant="info" dismissible />
      </div>

      {/* Custom Icon */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Icon</p>
        <Alert title="Custom Icon" description="This alert uses a custom Rocket icon" icon={<Rocket className="h-4 w-4 text-primary" />} />
      </div>

      {/* With Actions */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Actions</p>
        <Alert
          title="New Update Available"
          description="Version 2.0 is now available with new features and improvements"
          variant="info"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Later
              </Button>
              <Button size="sm">Update Now</Button>
            </div>
          }
        />
      </div>

      {/* Without Title */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Without Title</p>
        <Alert description="This is an alert without a title" variant="warning" />
      </div>

      {/* Rich Description */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Rich Description (ReactNode)</p>
        <Alert
          title="Rich Content"
          description={
            <div>
              <p>You can use any React component in description:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Lists</li>
                <li>Links</li>
                <li>Custom components</li>
              </ul>
            </div>
          }
          variant="success"
        />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "title", description: t("props.alert.title"), type: "string", default: "-" },
    { property: "description", description: t("props.alert.description"), type: "string | React.ReactNode", default: "-" },
    { property: "variant", description: t("props.alert.variant"), type: '"default" | "info" | "success" | "warning" | "error"', default: '"default"' },
    { property: "className", description: t("props.alert.className"), type: "string", default: "-" },
    { property: "icon", description: t("props.alert.icon"), type: "React.ReactNode", default: "-" },
    { property: "dismissible", description: t("props.alert.dismissible"), type: "boolean", default: "false" },
    { property: "onClose", description: t("props.alert.onClose"), type: "() => void", default: "-" },
    { property: "actions", description: t("props.alert.actions"), type: "React.ReactNode", default: "-" },
    { property: "closeAriaLabel", description: t("props.alert.closeAriaLabel"), type: "string", default: "t('Common.closeAlert')" },
  ];
  const order = [
    "title","description","variant","className","icon","dismissible","onClose","actions","closeAriaLabel"
  ];
  const docs = <PropsDocsTable rows={rows} order={order} />;

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
          { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}

