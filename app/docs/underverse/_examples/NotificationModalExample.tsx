"use client";

import React from "react";
import NotificationModal from "@/components/ui/NotificationModal";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import Button from "@/components/ui/Button";

export default function NotificationModalExample() {
  const [open, setOpen] = React.useState(false);
  const notification = {
    id: 1,
    title: "Cập nhật hệ thống",
    body: "Hệ thống sẽ bảo trì lúc 23:00 hôm nay.",
    type: "info",
    is_read: false,
    created_at: new Date().toISOString(),
    metadata: { link: "https://example.com" }
  };
  return (
    <IntlDemoProvider>
      <div className="space-y-3">
        <Button onClick={() => setOpen(true)}>Xem thông báo</Button>
        <NotificationModal isOpen={open} onClose={() => setOpen(false)} notification={notification as any} />
        <CodeBlock code={`import { NotificationModal } from '@underverse-ui/underverse'`} />
      </div>
    </IntlDemoProvider>
  );
}

