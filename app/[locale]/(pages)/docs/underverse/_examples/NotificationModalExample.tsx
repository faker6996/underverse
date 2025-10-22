"use client";

import React from "react";
import NotificationModal from "@/components/ui/NotificationModal";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
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

  const code =
    `import NotificationModal from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n\n` +
    `const [open, setOpen] = useState(false)\n` +
    `const notification = {\n` +
    `  id: 1,\n` +
    `  title: "Cập nhật hệ thống",\n` +
    `  body: "Hệ thống sẽ bảo trì lúc 23:00 hôm nay.",\n` +
    `  type: "info",\n` +
    `  is_read: false,\n` +
    `  created_at: new Date().toISOString(),\n` +
    `  metadata: { link: "https://example.com" }\n` +
    `}\n\n` +
    `<Button onClick={() => setOpen(true)}>Xem thông báo</Button>\n` +
    `<NotificationModal isOpen={open} onClose={() => setOpen(false)} notification={notification as any} />`;

  const demo = (
    <div>
      <Button onClick={() => setOpen(true)}>Xem thông báo</Button>
      <NotificationModal isOpen={open} onClose={() => setOpen(false)} notification={notification as any} />
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

