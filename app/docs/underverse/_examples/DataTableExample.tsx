"use client";

import React from "react";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";

type Row = { id: number; name: string; role: string; created_at: string };

export default function DataTableExample() {
  const rows: Row[] = [
    { id: 1, name: "Alice", role: "Admin", created_at: "2024-10-01" },
    { id: 2, name: "Bob", role: "User", created_at: "2024-10-05" },
    { id: 3, name: "Charlie", role: "User", created_at: "2024-10-10" },
  ];
  const columns = [
    { key: "name", title: "Name", dataIndex: "name", sortable: true, filter: { type: "text", placeholder: "Search name" } },
    { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "User"] } },
    { key: "created_at", title: "Created", dataIndex: "created_at", filter: { type: "date" } },
  ];

  return (
    <IntlDemoProvider>
      <div className="space-y-3">
        <DataTable<Row> columns={columns as any} data={rows} total={rows.length} page={1} pageSize={10} />
        <CodeBlock code={`import { DataTable } from '@underverse-ui/underverse'`} />
      </div>
    </IntlDemoProvider>
  );
}

