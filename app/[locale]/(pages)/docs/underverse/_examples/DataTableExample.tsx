"use client";

import React from "react";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

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
    { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "User", "Editor"] } },
    { key: "created_at", title: "Created", dataIndex: "created_at", filter: { type: "date" } },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, record: Row) => (
        <div className="flex gap-2">
          <Button size="xs" variant="outline">View</Button>
          <Button size="xs" variant="ghost">Edit</Button>
        </div>
      )
    },
  ];

  const t = useTranslations('Common');

  const [serverQuery, setServerQuery] = React.useState<any>(null);

  const code =
    `import DataTable from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n\n` +
    `type Row = { id: number; name: string; role: string; created_at: string }\n` +
    `const rows: Row[] = [/* ... */]\n` +
    `const columns = [\n` +
    `  { key: 'name', title: 'Name', dataIndex: 'name', sortable: true, filter: { type: 'text', placeholder: 'Search name' } },\n` +
    `  { key: 'role', title: 'Role', dataIndex: 'role', filter: { type: 'select', options: ['Admin','User','Editor'] } },\n` +
    `  { key: 'created_at', title: 'Created', dataIndex: 'created_at', filter: { type: 'date' } },\n` +
    `  { key: 'actions', title: 'Actions', render: (_,_row) => (<div>...</div>) }\n` +
    `]\n\n` +
    `const t = useTranslations('Common')\n\n` +
    `// 1) Basic with paging + density/columns toggles\n` +
    `<DataTable<Row> columns={columns as any} data={rows} page={1} pageSize={2} pageSizeOptions={[2,5,10]} labels={{ density: t('density'), columns: t('columns'), compact: t('compact'), normal: t('normal'), comfortable: t('comfortable') }} />\n\n` +
    `// 2) With caption + toolbar\n` +
    `<DataTable<Row> columns={columns as any} data={rows} caption={<span>Users</span>} toolbar={<button>Add</button>} />\n\n` +
    `// 3) Server-side (onQueryChange)\n` +
    `<DataTable<Row> columns={columns as any} data={rows} total={100} onQueryChange={(q)=>console.log(q)} />\n\n` +
    `// 4) Without stripes + hide toggles\n` +
    `<DataTable<Row> columns={columns as any} data={rows} striped={false} enableColumnVisibilityToggle={false} enableDensityToggle={false} />`;

  const demo = (
    <div className="space-y-8">
      {/* 1) Basic */}
      <DataTable<Row>
        columns={columns as any}
        data={rows}
        page={1}
        pageSize={2}
        pageSizeOptions={[2, 5, 10]}
        labels={{ density: t('density'), columns: t('columns'), compact: t('compact'), normal: t('normal'), comfortable: t('comfortable') }}
      />

      {/* 2) With caption + toolbar */}
      <DataTable<Row>
        columns={columns as any}
        data={rows}
        caption={<span className="text-sm text-muted-foreground">Users</span>}
        toolbar={<Button size="sm">Add</Button>}
      />

      {/* 3) Server-side: show query */}
      <div className="space-y-2">
        <DataTable<Row>
          columns={columns as any}
          data={rows}
          total={100}
          onQueryChange={(q) => setServerQuery(q)}
        />
        {serverQuery && (
          <pre className="text-xs bg-muted p-2 rounded border border-border overflow-auto">{JSON.stringify(serverQuery, null, 2)}</pre>
        )}
      </div>

      {/* 4) No stripes + no toggles */}
      <DataTable<Row>
        columns={columns as any}
        data={rows}
        striped={false}
        enableColumnVisibilityToggle={false}
        enableDensityToggle={false}
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
