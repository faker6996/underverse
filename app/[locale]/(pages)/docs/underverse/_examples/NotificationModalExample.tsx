"use client";

import React from "react";
import { useTranslations } from "next-intl";
import NotificationModal from "@/components/ui/NotificationModal";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import Button from "@/components/ui/Button";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function NotificationModalExample() {
  const t = useTranslations("DocsUnderverse");
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);

  const notificationWithLink = {
    id: 1,
    title: "Cập nhật hệ thống",
    body: "Hệ thống sẽ bảo trì lúc 23:00 hôm nay.",
    type: "info",
    is_read: false,
    created_at: new Date().toISOString(),
    metadata: { link: "https://example.com" }
  };

  const notificationNoLink = {
    id: 2,
    title: "Lịch sử thanh toán",
    body: "Đơn hàng #1234 đã được xử lý thành công.",
    type: "success",
    is_read: true,
    created_at: new Date().toISOString(),
    metadata: {}
  };

  const code =
    `import NotificationModal from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n\n` +
    `const [open1, setOpen1] = useState(false)\n` +
    `const [open2, setOpen2] = useState(false)\n` +
    `const [open3, setOpen3] = useState(false)\n\n` +
    `const notificationWithLink = { id: 1, title: 'Cập nhật hệ thống', body: 'Hệ thống sẽ bảo trì lúc 23:00 hôm nay.', type: 'info', is_read: false, created_at: new Date().toISOString(), metadata: { link: 'https://example.com' } }\n` +
    `const notificationNoLink = { id: 2, title: 'Lịch sử thanh toán', body: 'Đơn hàng #1234 đã được xử lý thành công.', type: 'success', is_read: true, created_at: new Date().toISOString(), metadata: {} }\n\n` +
    `// 1) With link + unread\n` +
    `<Button onClick={() => setOpen1(true)}>Mở modal (có link)</Button>\n` +
    `<NotificationModal isOpen={open1} onClose={() => setOpen1(false)} notification={notificationWithLink as any} />\n\n` +
    `// 2) No link + read\n` +
    `<Button onClick={() => setOpen2(true)}>Mở modal (không link)</Button>\n` +
    `<NotificationModal isOpen={open2} onClose={() => setOpen2(false)} notification={notificationNoLink as any} />\n\n` +
    `// 3) Custom texts\n` +
    `<Button onClick={() => setOpen3(true)}>Mở modal (custom texts)</Button>\n` +
    `<NotificationModal isOpen={open3} onClose={() => setOpen3(false)} notification={notificationWithLink as any} titleText='Thông báo' openLinkText='Mở liên kết' closeText='Đóng' />`;

  const demo = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen1(true)}>Mở modal (có link)</Button>
        <Button onClick={() => setOpen2(true)} variant="outline">Mở modal (không link)</Button>
        <Button onClick={() => setOpen3(true)} variant="primary">Mở modal (custom texts)</Button>
      </div>
      <NotificationModal isOpen={open1} onClose={() => setOpen1(false)} notification={notificationWithLink as any} />
      <NotificationModal isOpen={open2} onClose={() => setOpen2(false)} notification={notificationNoLink as any} />
      <NotificationModal isOpen={open3} onClose={() => setOpen3(false)} notification={notificationWithLink as any} titleText="Thông báo" openLinkText="Mở liên kết" closeText="Đóng" />
    </div>
  );

  const rows: PropsRow[] = [
    { property: "isOpen", description: t("props.notificationModal.isOpen"), type: "boolean", default: "false" },
    { property: "onClose", description: t("props.notificationModal.onClose"), type: "() => void", default: "-" },
    { property: "notification", description: t("props.notificationModal.notification"), type: "{ id:number; title?:string; body?:string; type?:string; is_read:boolean; created_at:string; metadata?:any }", default: "-" },
    { property: "titleText", description: t("props.notificationModal.titleText"), type: "string", default: '"t(\'Common.notifications\')"' },
    { property: "openLinkText", description: t("props.notificationModal.openLinkText"), type: "string", default: '"t(\'Common.openLink\')"' },
    { property: "closeText", description: t("props.notificationModal.closeText"), type: "string", default: '"t(\'Common.close\')"' },
  ];
  const order = rows.map(r => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="NotificationModal.md" />;

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
