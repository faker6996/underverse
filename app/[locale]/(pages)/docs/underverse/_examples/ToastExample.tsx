"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ToastExample() {
  const { addToast } = useToast();

  const demo = (
    <div className="flex gap-2">
      <Button onClick={() => addToast({ type: "success", message: "Thành công!" })} variant="success">
        Show success
      </Button>
      <Button onClick={() => addToast({ type: "error", message: "Có lỗi xảy ra" })} variant="danger">
        Show error
      </Button>
      <Button onClick={() => addToast({ type: "info", message: "Thông tin" })} variant="info">
        Show info
      </Button>
    </div>
  );

  const code =
    `import { Button, ToastProvider, useToast } from '@underverse-ui/underverse'\n\n` +
    `function Demo(){\n` +
    `  const { addToast } = useToast();\n` +
    `  return (\n` +
    `    <div className=\"flex gap-2\">\n` +
    `      <Button onClick={() => addToast({ type: 'success', message: 'Thành công!' })} variant=\"success\">Show success</Button>\n` +
    `      <Button onClick={() => addToast({ type: 'error', message: 'Có lỗi xảy ra' })} variant=\"danger\">Show error</Button>\n` +
    `      <Button onClick={() => addToast({ type: 'info', message: 'Thông tin' })} variant=\"info\">Show info</Button>\n` +
    `    </div>\n` +
    `  );\n` +
    `}\n\n` +
    `export default function Page(){\n` +
    `  return (\n` +
    `    <ToastProvider>\n` +
    `      <Demo />\n` +
    `    </ToastProvider>\n` +
    `  );\n` +
    `}`;

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

