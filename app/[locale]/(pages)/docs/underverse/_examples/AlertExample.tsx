"use client";

import React from "react";
import Alert from "@/components/ui/Alert";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { Info } from "lucide-react";

export default function AlertExample() {
  const code =
    `import { Alert } from '@underverse-ui/underverse'\n` +
    `import { Info } from 'lucide-react'\n\n` +
    `<Alert title="Thông báo" description="Nội dung mô tả chi tiết." icon={<Info className="h-4 w-4" />} />\n` +
    `<Alert title="Thành công" description="Thao tác đã hoàn tất." variant="success" />\n` +
    `<Alert title="Cảnh báo" description="Vui lòng kiểm tra lại thông tin." variant="warning" />\n` +
    `<Alert title="Lỗi" description="Đã xảy ra lỗi không mong muốn." variant="error" dismissible />`;

  const demo = (
    <div className="space-y-3">
      <Alert title="Thông báo" description="Nội dung mô tả chi tiết." icon={<Info className="h-4 w-4" />} />
      <Alert title="Thành công" description="Thao tác đã hoàn tất." variant="success" />
      <Alert title="Cảnh báo" description="Vui lòng kiểm tra lại thông tin." variant="warning" />
      <Alert title="Lỗi" description="Đã xảy ra lỗi không mong muốn." variant="error" dismissible />
    </div>
  );

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
          { value: "code", label: "Code", content: <CodeBlock code={code} /> },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}

