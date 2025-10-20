"use client";

import React from "react";
import Alert from "@/components/ui/Alert";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Info } from "lucide-react";

export default function AlertExample() {
  return (
    <IntlDemoProvider>
      <div className="space-y-3">
        <Alert title="Thông báo" description="Nội dung mô tả chi tiết." icon={<Info className="h-4 w-4" />} />
        <Alert title="Thành công" description="Thao tác đã hoàn tất." variant="success" />
        <Alert title="Cảnh báo" description="Vui lòng kiểm tra lại thông tin." variant="warning" />
        <Alert title="Lỗi" description="Đã xảy ra lỗi không mong muốn." variant="error" dismissible />
        <CodeBlock
          code={`import { Alert } from '@underverse-ui/underverse'\n\n<Alert title='Thông báo' description='Chi tiết...' />\n<Alert title='Thành công' variant='success' />\n<Alert title='Cảnh báo' variant='warning' />\n<Alert title='Lỗi' variant='error' dismissible />`}
        />
      </div>
    </IntlDemoProvider>
  );
}

