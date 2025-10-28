"use client";

import React from "react";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";

type Row = { id: number; name: string; role: string; created_at: string };

export default function DataTableExample() {
  const rows: Row[] = [
    { id: 1, name: "Alice", role: "Admin", created_at: "2024-10-01" },
    { id: 2, name: "Bob", role: "User", created_at: "2024-10-05" },
    { id: 3, name: "Charlie", role: "User", created_at: "2024-10-10" },
    { id: 4, name: "Daisy", role: "Editor", created_at: "2024-10-12" },
    { id: 5, name: "Evan", role: "User", created_at: "2024-10-15" },
  ];
  const columns = [
    { key: "name", title: "Name", dataIndex: "name", sortable: true, filter: { type: "text", placeholder: "Search name" } },
    { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "User"] } },
    { key: "created_at", title: "Created", dataIndex: "created_at", filter: { type: "date" } },
  ];

  const t = useTranslations('Common');

  const code =
    `import DataTable from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n\n` +
    `type Row = { id: number; name: string; role: string; created_at: string }\n\n` +
    `const rows: Row[] = [\n` +
    `  { id: 1, name: "Alice", role: "Admin", created_at: "2024-10-01" },\n` +
    `  { id: 2, name: "Bob", role: "User", created_at: "2024-10-05" },\n` +
    `  { id: 3, name: "Charlie", role: "User", created_at: "2024-10-10" },\n` +
    `]\n` +
    `const columns = [\n` +
    `  { key: "name", title: "Name", dataIndex: "name", sortable: true, filter: { type: "text", placeholder: "Search name" } },\n` +
    `  { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "User"] } },\n` +
    `  { key: "created_at", title: "Created", dataIndex: "created_at", filter: { type: "date" } },\n` +
    `]\n\n` +
    `const t = useTranslations('Common')\n\n` +
    `<DataTable<Row>\n` +
    `  columns={columns as any}\n` +
    `  data={rows}\n` +
    `  page={1}\n` +
    `  pageSize={2}\n` +
    `  pageSizeOptions={[2, 5, 10]}\n` +
    `  labels={{\n` +
    `    density: t('density'),\n` +
    `    columns: t('columns'),\n` +
    `    compact: t('compact'),\n` +
    `    normal: t('normal'),\n` +
    `    comfortable: t('comfortable')\n` +
    `  }}\n` +
    `/>`;

  const demo = (
    <div>
      <DataTable<Row>
        columns={columns as any}
        data={rows}
        page={1}
        pageSize={2}
        pageSizeOptions={[2, 5, 10]}
        labels={{
          density: t('density'),
          columns: t('columns'),
          compact: t('compact'),
          normal: t('normal'),
          comfortable: t('comfortable')
        }}
      />
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
