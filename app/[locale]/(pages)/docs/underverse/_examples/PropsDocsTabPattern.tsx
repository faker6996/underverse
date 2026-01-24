"use client";

/**
 * PropsDocsTabPattern
 * Reusable pattern to add a “Document” tab for examples that lists component props
 * using the project DataTable. Shows all rows on one page (no pagination) and
 * keeps the order matched to the component's props destructuring.
 *
 * How to use
 * 1) In your Example component, import { PropsDocsTable, type PropsRow } from this file.
 * 2) Build a `rows: PropsRow[]` array from your component's Props interface.
 * 3) Define `order: string[]` that mirrors the destructuring order in your component.
 * 4) Render: <PropsDocsTable rows={rows} order={order} /> inside your Tabs content
 *    e.g., { value: "docs", label: "Document", content: <div className="p-1"><PropsDocsTable rows={rows} order={order} /></div> }
 */

import React from "react";
import { useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";

export type PropsRow = {
  property: string;
  description: string;
  type: string;
  default: string;
  /** Optional category (Appearance | Behavior | Accessibility | etc.) */
  category?: string;
};

const baseColumns: DataTableColumn<PropsRow>[] = [
  { key: "property", title: "Property", dataIndex: "property", width: 160 },
  { key: "description", title: "Description", dataIndex: "description" },
  { key: "type", title: "Type", dataIndex: "type", width: 260 },
  { key: "default", title: "Default", dataIndex: "default", width: 140 },
];

function sortByOrder(rows: PropsRow[], order?: string[]) {
  if (!order || order.length === 0) return rows;
  const index = new Map(order.map((k, i) => [k, i] as const));
  return [...rows].sort((a, b) => (index.get(a.property) ?? 999) - (index.get(b.property) ?? 999));
}

import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

// ... (existing PropsRow type definition)

export function PropsDocsTable({
  rows,
  order,
  columns = baseColumns,
  className,
  markdownFile,
}: {
  rows: PropsRow[];
  order?: string[];
  columns?: DataTableColumn<PropsRow>[];
  className?: string;
  markdownFile?: string;
}) {
  const t = useTranslations("DocsUnderverse");
  const data = sortByOrder(rows, order);
  const localizedColumns: DataTableColumn<PropsRow>[] =
    columns === baseColumns || !columns
      ? [
          { key: "property", title: t("propsTable.property"), dataIndex: "property", width: 160 },
          { key: "description", title: t("propsTable.description"), dataIndex: "description" },
          { key: "type", title: t("propsTable.type"), dataIndex: "type", width: 260 },
          { key: "default", title: t("propsTable.default"), dataIndex: "default", width: 140 },
        ]
      : columns;

  const handleDownload = () => {
    if (!markdownFile) return;
    // Trigger download via API
    window.open(`/api/docs/download?file=${markdownFile}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {markdownFile && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleDownload} icon={Download} className="gap-2">
            Download Docs
          </Button>
        </div>
      )}
      <DataTable<PropsRow>
        columns={localizedColumns}
        data={data}
        rowKey={(r) => r.property}
        striped
        enableDensityToggle={false}
        enableColumnVisibilityToggle={false}
        // server-mode trick to disable built-in pagination UI
        onQueryChange={() => {}}
        total={0}
        page={1}
        pageSize={data.length}
        className={className ?? "text-sm"}
      />
    </div>
  );
}

/**
 * Example usage
 *
 * import { PropsDocsTable, type PropsRow } from "./_patterns/PropsDocsTabPattern";
 *
 * const rows: PropsRow[] = [
 *   { property: "onClick", description: "Click handler", type: "(e) => void", default: "—" },
 *   { property: "variant", description: "Visual style variant", type: "'default' | 'primary' | ...", default: "'default'" },
 *   // ...more rows
 * ];
 *
 * const order = ["onClick", "children", "variant", "size"]; // mirror destructuring
 *
 * const docs = <PropsDocsTable rows={rows} order={order} />;
 */
