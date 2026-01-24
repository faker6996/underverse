"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ToastExample() {
  const t = useTranslations("DocsUnderverse");
  const { addToast } = useToast();

  const code =
    `import { Button, ToastProvider, useToast } from '@underverse-ui/underverse'\n\n` +
    `function Demo() {\n` +
    `  const { addToast } = useToast()\n\n` +
    `  // Toast Types\n` +
    `  addToast({ type: 'success', message: 'Success!' })\n` +
    `  addToast({ type: 'error', message: 'Error occurred' })\n` +
    `  addToast({ type: 'warning', message: 'Warning!' })\n` +
    `  addToast({ type: 'info', message: 'Info message' })\n\n` +
    `  // With Title\n` +
    `  addToast({ type: 'success', title: 'Success', message: 'Operation completed' })\n\n` +
    `  // With Action\n` +
    `  addToast({\n` +
    `    type: 'info',\n` +
    `    message: 'New update available',\n` +
    `    action: { label: 'Update', onClick: () => console.log('Updating...') }\n` +
    `  })\n\n` +
    `  // Custom Duration\n` +
    `  addToast({ type: 'success', message: 'Short toast', duration: 2000 })\n` +
    `  addToast({ type: 'info', message: 'Persistent toast', duration: 0 }) // 0 = no auto-dismiss\n\n` +
    `  // Non-dismissible\n` +
    `  addToast({ type: 'warning', message: 'Cannot dismiss', dismissible: false })\n` +
    `}\n\n` +
    `// Wrap app with ToastProvider\n` +
    `<ToastProvider position="top-right" maxToasts={5}>\n` +
    `  <Demo />\n` +
    `</ToastProvider>`;

  const demo = (
    <div className="space-y-6">
      {/* Toast Types */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Toast Types</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => addToast({ type: "success", message: "Success!" })} variant="success" size="sm">
            Success
          </Button>
          <Button onClick={() => addToast({ type: "error", message: "Error occurred" })} variant="danger" size="sm">
            Error
          </Button>
          <Button onClick={() => addToast({ type: "warning", message: "Warning!" })} variant="warning" size="sm">
            Warning
          </Button>
          <Button onClick={() => addToast({ type: "info", message: "Info message" })} variant="primary" size="sm">
            Info
          </Button>
        </div>
      </div>

      {/* With Title */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Title</p>
        <Button
          onClick={() => addToast({ type: "success", title: "Success", message: "Operation completed successfully" })}
          variant="success"
          size="sm"
        >
          Show Toast with Title
        </Button>
      </div>

      {/* With Action */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Action</p>
        <Button
          onClick={() =>
            addToast({
              type: "info",
              message: "New update available",
              action: { label: "Update Now", onClick: () => alert("Updating...") },
            })
          }
          variant="primary"
          size="sm"
        >
          Toast with Action
        </Button>
      </div>

      {/* Custom Duration */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Duration</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => addToast({ type: "success", message: "Short toast (2s)", duration: 2000 })} variant="outline" size="sm">
            Short (2s)
          </Button>
          <Button onClick={() => addToast({ type: "info", message: "Default (5s)", duration: 5000 })} variant="outline" size="sm">
            Default (5s)
          </Button>
          <Button onClick={() => addToast({ type: "warning", message: "Long toast (10s)", duration: 10000 })} variant="outline" size="sm">
            Long (10s)
          </Button>
          <Button onClick={() => addToast({ type: "error", message: "Persistent (click to close)", duration: 0 })} variant="outline" size="sm">
            Persistent
          </Button>
        </div>
      </div>

      {/* Non-dismissible */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Non-dismissible</p>
        <Button
          onClick={() => addToast({ type: "warning", message: "Cannot manually dismiss this toast", dismissible: false, duration: 3000 })}
          variant="warning"
          size="sm"
        >
          Non-dismissible Toast
        </Button>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "ToastProvider", description: t("props.toast.ToastProvider"), type: "Component", default: "—" },
    { property: "useToast", description: t("props.toast.useToast"), type: "() => { addToast: (opts) => void }", default: "—" },
    { property: "position", description: t("props.toast.position"), type: '"top-left" | "top-right" | "bottom-left" | "bottom-right"', default: '"top-right"' },
    { property: "maxToasts", description: t("props.toast.maxToasts"), type: "number", default: "5" },
  ];
  const order = ["ToastProvider","useToast","position","maxToasts"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Toast.md" />;

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


