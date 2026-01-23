"use client";

import React from "react";
import DataTable, { type DataTableColumn, type DataTableQuery } from "@/components/ui/DataTable";
import { Checkbox } from "@/components/ui/CheckBox";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

type Row = { id: number; name: string; email: string; role: string; department: string; amount: number; status: string; created_at: string };

const ALL: Row[] = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "User",
  department: ["Engineering", "Marketing", "Sales", "HR", "Finance"][i % 5],
  amount: Math.floor(Math.random() * 2000) + 500,
  status: i % 4 === 0 ? "Active" : i % 4 === 1 ? "Inactive" : i % 4 === 2 ? "Pending" : "Suspended",
  created_at: new Date(2024, i % 12, (i % 28) + 1).toISOString().slice(0, 10),
}));

export default function DataTableExample() {
  const t = useTranslations("Common");
  const td = useTranslations("DocsUnderverse");

  const [rows, setRows] = React.useState<Row[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState<DataTableQuery>({ filters: {}, page: 1, pageSize: 20 });
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const allPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const columns: DataTableColumn<Row>[] = [
    {
      key: "select",
      title: (
        <Checkbox
          checked={allPageSelected}
          onChange={(e) => {
            const next = new Set(selected);
            if (e.target.checked) rows.forEach((r) => next.add(r.id));
            else rows.forEach((r) => next.delete(r.id));
            setSelected(next);
          }}
          aria-label="Select all"
        />
      ),
      width: 48,
      fixed: "left",
      render: (_, record) => (
        <Checkbox
          checked={selected.has(record.id)}
          onChange={(e) => {
            const next = new Set(selected);
            if (e.target.checked) next.add(record.id);
            else next.delete(record.id);
            setSelected(next);
          }}
        />
      ),
    },
    { key: "name", title: "Name", dataIndex: "name", sortable: true, filter: { type: "text" }, width: 150 },
    { key: "email", title: "Email", dataIndex: "email", width: 200 },
    { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "Editor", "User"] }, width: 100 },
    {
      key: "department",
      title: "Department",
      dataIndex: "department",
      filter: { type: "select", options: ["Engineering", "Marketing", "Sales", "HR", "Finance"] },
      width: 130,
    },
    { key: "amount", title: "Amount", dataIndex: "amount", sortable: true, width: 100 },
    { key: "status", title: "Status", dataIndex: "status", width: 100 },
    { key: "created_at", title: "Created", dataIndex: "created_at", filter: { type: "date" }, width: 120 },
    {
      key: "actions",
      title: "Actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-1 justify-center">
          <Button size="smx" variant="outline" onClick={() => alert(`View ${record.name}`)}>
            View
          </Button>
          <Button size="smx" variant="ghost" onClick={() => alert(`Edit ${record.name}`)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = React.useCallback((q: DataTableQuery) => {
    setLoading(true);
    setQuery(q);
    setTimeout(() => {
      let data = [...ALL];
      if (q.filters?.name) data = data.filter((d) => d.name.toLowerCase().includes(String(q.filters.name).toLowerCase()));
      if (q.filters?.role) data = data.filter((d) => d.role === q.filters.role);
      if (q.sort) {
        const { key, order } = q.sort;
        data.sort((a: any, b: any) => {
          const va = a[key];
          const vb = b[key];
          return (va > vb ? 1 : va < vb ? -1 : 0) * (order === "asc" ? 1 : -1);
        });
      }
      const start = (q.page - 1) * q.pageSize;
      setRows(data.slice(start, start + q.pageSize));
      setTotal(data.length);
      setLoading(false);
    }, 300);
  }, []);

  React.useEffect(() => {
    fetchData(query);
  }, []);

  const toolbar = (
    <Button
      variant="destructive"
      size="sm"
      disabled={selected.size === 0}
      onClick={() => {
        alert(`Delete ${selected.size} items`);
        setSelected(new Set());
      }}
    >
      Delete ({selected.size})
    </Button>
  );

  const code = `const columns = [
  { key: 'select', title: <Checkbox />, render: (_, r) => <Checkbox /> },
  { key: 'name', title: 'Name', dataIndex: 'name', sortable: true, filter: { type: 'text' } },
  { key: 'role', title: 'Role', dataIndex: 'role', filter: { type: 'select', options: [...] } },
  { key: 'amount', title: 'Amount', dataIndex: 'amount', sortable: true },
  { key: 'created_at', title: 'Created', filter: { type: 'date' } },
  { key: 'actions', title: 'Actions', render: (_, r) => <Button>...</Button> },
];

<DataTable<Row>
  columns={columns}
  data={rows}
  loading={loading}
  total={total}
  page={page}
  pageSize={pageSize}
  pageSizeOptions={[5, 10, 20]}
  onQueryChange={fetchData}
  toolbar={toolbar}
  striped
  columnDividers
  enableHeaderAlignToggle  // New: toggle header alignment
  storageKey="example-table"  // Lưu pageSize vào localStorage
  labels={{ density: '...', columns: '...', headerAlign: '...' }}
/>`;

  const demo = (
    <DataTable<Row>
      columns={columns}
      data={rows}
      loading={loading}
      total={total}
      page={query.page}
      pageSize={query.pageSize}
      pageSizeOptions={[5, 10, 20, 50]}
      onQueryChange={fetchData}
      toolbar={toolbar}
      striped
      columnDividers
      enableHeaderAlignToggle
      storageKey="example-table"
      stickyHeader
      maxHeight={400}
      labels={{
        density: t("density"),
        columns: t("columns"),
        compact: t("compact"),
        normal: t("normal"),
        comfortable: t("comfortable"),
        headerAlign: t("headerAlign"),
        alignLeft: t("alignLeft"),
        alignCenter: t("alignCenter"),
        alignRight: t("alignRight"),
      }}
    />
  );

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
          {
            value: "docs",
            label: td("tabs.document"),
            content: (
              <div className="p-1">
                {(() => {
                  const propsRows: PropsRow[] = [
                    { property: "columns", description: td("props.dataTable.columns"), type: "DataTableColumn<T>[]", default: "[]" },
                    { property: "data", description: td("props.dataTable.data"), type: "T[]", default: "[]" },
                    { property: "rowKey", description: td("props.dataTable.rowKey"), type: "(row: T) => string | number", default: "-" },
                    { property: "loading", description: td("props.dataTable.loading"), type: "boolean", default: "false" },
                    { property: "page", description: td("props.dataTable.page"), type: "number", default: "1" },
                    { property: "pageSize", description: td("props.dataTable.pageSize"), type: "number", default: "10" },
                    { property: "pageSizeOptions", description: td("props.dataTable.pageSizeOptions"), type: "number[]", default: "-" },
                    { property: "total", description: td("props.dataTable.total"), type: "number", default: "0" },
                    {
                      property: "onQueryChange",
                      description: td("props.dataTable.onQueryChange"),
                      type: "(q: DataTableQuery) => void",
                      default: "-",
                    },
                    { property: "caption", description: td("props.dataTable.caption"), type: "React.ReactNode", default: "-" },
                    { property: "toolbar", description: td("props.dataTable.toolbar"), type: "React.ReactNode", default: "-" },
                    { property: "striped", description: td("props.dataTable.striped"), type: "boolean", default: "true" },
                    { property: "columnDividers", description: td("props.dataTable.columnDividers"), type: "boolean", default: "false" },
                    { property: "enableDensityToggle", description: td("props.dataTable.enableDensityToggle"), type: "boolean", default: "true" },
                    {
                      property: "enableColumnVisibilityToggle",
                      description: td("props.dataTable.enableColumnVisibilityToggle"),
                      type: "boolean",
                      default: "true",
                    },
                    { property: "enableHeaderAlignToggle", description: "Bật nút căn header", type: "boolean", default: "false" },
                    {
                      property: "storageKey",
                      description: "Key để lưu pageSize vào localStorage. Nếu không cung cấp, pageSize sẽ không được persist",
                      type: "string",
                      default: "-",
                    },
                    { property: "labels", description: td("props.dataTable.labels"), type: "{ density; columns; headerAlign; ... }", default: "-" },
                    { property: "className", description: td("props.dataTable.className"), type: "string", default: "-" },
                  ];
                  return <PropsDocsTable rows={propsRows} order={propsRows.map((r) => r.property)} />;
                })()}
              </div>
            ),
          },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}
