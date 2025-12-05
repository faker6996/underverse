"use client";

import React from "react";
import DataTable, { type DataTableColumn, type DataTableQuery } from "@/components/ui/DataTable";
import { Checkbox } from "@/components/ui/CheckBox";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";

type Row = { id: number; name: string; role: string; created_at: string };

const ALL: Row[] = Array.from({ length: 45 }).map((_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  role: i % 2 === 0 ? "Admin" : "User",
  created_at: new Date(2024, i % 12, (i % 28) + 1).toISOString().slice(0, 10),
}));

export default function DataTableSelectionExample() {
  const td = useTranslations("DocsUnderverse");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState<DataTableQuery>({ filters: {}, page: 1, pageSize: 10 });
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const visibleIds = React.useMemo(() => new Set(rows.map((r) => r.id)), [rows]);
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
          aria-label="Select all on page"
        />
      ),
      width: 48,
      render: (_, record) => (
        <Checkbox
          checked={selected.has(record.id)}
          onChange={(e) => {
            const next = new Set(selected);
            if (e.target.checked) next.add(record.id);
            else next.delete(record.id);
            setSelected(next);
          }}
          aria-label={`Select ${record.name}`}
        />
      ),
    },
    { key: "name", title: "Name", dataIndex: "name", sortable: true, filter: { type: "text" } },
    { key: "role", title: "Role", dataIndex: "role", filter: { type: "select", options: ["Admin", "User"] } },
    { key: "created_at", title: "Created", dataIndex: "created_at", sortable: true, align: "right" },
  ];

  const fetch = React.useCallback((query: DataTableQuery) => {
    setLoading(true);
    setQ(query);
    setTimeout(() => {
      let data = [...ALL];
      if (query.filters?.name) data = data.filter((d) => d.name.toLowerCase().includes(String(query.filters.name).toLowerCase()));
      if (query.filters?.role) data = data.filter((d) => d.role === query.filters.role);
      if (query.sort) {
        const { key, order } = query.sort;
        data.sort((a: any, b: any) => {
          const va = a[key];
          const vb = b[key];
          return (va > vb ? 1 : va < vb ? -1 : 0) * (order === "asc" ? 1 : -1);
        });
      }
      const start = (query.page - 1) * query.pageSize;
      setRows(data.slice(start, start + query.pageSize));
      setTotal(data.length);
      setLoading(false);
    }, 250);
  }, []);

  React.useEffect(() => {
    fetch(q);
  }, []);

  const clearUnseenSelections = () => {
    const allowed = new Set(ALL.map((r) => r.id));
    const next = new Set<number>();
    selected.forEach((id) => {
      if (allowed.has(id)) next.add(id);
    });
    setSelected(next);
  };

  const toolbar = (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        disabled={selected.size === 0}
        onClick={() => {
          alert(`Delete ${selected.size} items: [${Array.from(selected).join(", ")}]`);
          setSelected(new Set());
          clearUnseenSelections();
          fetch({ ...q });
        }}
      >
        Delete selected ({selected.size})
      </Button>
    </div>
  );

  const code = `// Add a checkbox column for selection and manage state in parent
const columns = [
  { key: 'select', title: <Checkbox .../>, render: (_,r)=>(<Checkbox .../> ) },
  { key: 'name', title: 'Name', sortable: true, filter: { type: 'text' } },
  ...
];

<DataTable
  columns={columns}
  data={rows}
  total={total}
  page={page}
  pageSize={pageSize}
  loading={loading}
  onQueryChange={fetch}
  toolbar={toolbar}
/>`;

  const demo = (
    <DataTable<Row>
      columns={columns}
      data={rows}
      total={total}
      page={q.page}
      pageSize={q.pageSize}
      loading={loading}
      onQueryChange={fetch}
      toolbar={toolbar}
      enableColumnVisibilityToggle
      enableDensityToggle
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
