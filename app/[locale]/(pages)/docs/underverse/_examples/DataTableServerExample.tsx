"use client";

import React from "react";
import DataTable, { type DataTableColumn, type DataTableQuery } from "@/components/ui/DataTable";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";

type User = { id: number; name: string; role: string; created_at: string };

const ALL: User[] = Array.from({ length: 137 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "User",
  created_at: new Date(2024, i % 12, (i % 28) + 1).toISOString().slice(0, 10),
}));

export default function DataTableServerExample() {
  const td = useTranslations("DocsUnderverse");
  const [rows, setRows] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState<DataTableQuery>({ filters: {}, page: 1, pageSize: 10 });

  const columns: DataTableColumn<User>[] = [
    { key: "name", title: "Name", dataIndex: "name", sortable: true, filter: { type: "text", placeholder: "Search name" } },
    { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "Editor", "User"] } },
    { key: "created_at", title: "Created", dataIndex: "created_at", filter: { type: "date" }, align: "right" },
    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <button className="text-primary hover:underline" onClick={() => alert(`Edit ${record.name}`)}>
          Edit
        </button>
      ),
      align: "right",
      width: 120,
    },
  ];

  const fetchServer = React.useCallback((q: DataTableQuery) => {
    setLoading(true);
    setLastQuery(q);
    // simulate network
    setTimeout(() => {
      let data = [...ALL];
      if (q.filters?.name) data = data.filter((d) => d.name.toLowerCase().includes(String(q.filters.name).toLowerCase()));
      if (q.filters?.role) data = data.filter((d) => d.role === q.filters.role);
      if (q.filters?.created_at instanceof Date) {
        const iso = (q.filters.created_at as Date).toISOString().slice(0, 10);
        data = data.filter((d) => d.created_at === iso);
      }
      if (q.sort) {
        const { key, order } = q.sort;
        data.sort((a: any, b: any) => {
          const va = a[key];
          const vb = b[key];
          return (va > vb ? 1 : va < vb ? -1 : 0) * (order === "asc" ? 1 : -1);
        });
      }
      const start = (q.page - 1) * q.pageSize;
      const pageData = data.slice(start, start + q.pageSize);
      setRows(pageData);
      setTotal(data.length);
      setLoading(false);
    }, 450);
  }, []);

  React.useEffect(() => {
    fetchServer(lastQuery);
  }, []);

  const code = `// Server-side mode: onQueryChange handles fetch
<DataTable
  columns={columns}
  data={rows}
  loading={loading}
  total={total}
  page={page}
  pageSize={pageSize}
  pageSizeOptions={[10, 20, 50, 100]}
  onQueryChange={fetchServer}
  storageKey="server-example"  // Lưu pageSize vào localStorage
/>`;

  const demo = (
    <DataTable<User>
      columns={columns}
      data={rows}
      loading={loading}
      total={total}
      page={lastQuery.page}
      pageSize={lastQuery.pageSize}
      onQueryChange={fetchServer}
      pageSizeOptions={[10, 20, 50, 100]}
      storageKey="server-example"
      striped
    />
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
