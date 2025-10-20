"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import CodeBlock from "../_components/CodeBlock";

export default function ToastExample() {
  const { addToast } = useToast();
  return (
    <div className="space-y-3">
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
      <CodeBlock
        code={`import { Button, ToastProvider, useToast } from '@underverse-ui/underverse'\n\nfunction Demo(){\n  const { addToast } = useToast();\n  return <Button onClick={() => addToast({ type: 'success', message: 'OK' })}>Show</Button>\n}\n\nexport default function Page(){\n  return (\n    <ToastProvider>\n      <Demo />\n    </ToastProvider>\n  );\n}`}
      />
    </div>
  );
}

