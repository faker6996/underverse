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

export type PropsRow = {
  property: string;
  description: string;
  type: string;
  default: string;
  /** Optional category (Appearance | Behavior | Accessibility | etc.) */
  category?: string;
};

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
  className,
  markdownFile,
}: {
  rows: PropsRow[];
  order?: string[];
  className?: string;
  markdownFile?: string;
}) {
  const t = useTranslations("DocsUnderverse");
  const data = sortByOrder(rows, order);

  const handleDownload = () => {
    if (!markdownFile) return;
    // Trigger download via API
    window.open(`/api/docs/download?file=${markdownFile}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {markdownFile && (
        <div className="flex justify-start md:justify-end">
          <Button variant="outline" size="sm" onClick={handleDownload} icon={Download} className="gap-2">
            {t("docs.downloadDocs")}
          </Button>
        </div>
      )}
      <div className="divide-y divide-border/50 rounded-none border-y border-border/50 md:hidden">
        {data.map((row) => (
          <div key={row.property} className="space-y-2 px-0 py-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{row.property}</div>
              {row.category && <div className="mt-1 text-xs text-muted-foreground">{row.category}</div>}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{row.description}</p>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
              <div>
                <span className="font-medium text-foreground/80">{t("propsTable.type")}:</span> {row.type}
              </div>
              <div>
                <span className="font-medium text-foreground/80">{t("propsTable.default")}:</span> {row.default}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`hidden overflow-x-auto rounded-xl border border-border/70 md:block ${className ?? ""}`}>
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-muted/45 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="w-32 border-b border-border/70 px-4 py-3 font-semibold">
                {t("propsTable.property")}
              </th>
              <th scope="col" className="border-b border-border/70 px-4 py-3 font-semibold">
                {t("propsTable.description")}
              </th>
              <th scope="col" className="w-52 border-b border-border/70 px-4 py-3 font-semibold">
                {t("propsTable.type")}
              </th>
              <th scope="col" className="w-28 border-b border-border/70 px-4 py-3 font-semibold">
                {t("propsTable.default")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.property} className="align-top transition-colors [&>*]:border-b [&>*]:border-border/55 last:[&>*]:border-b-0 hover:bg-muted/20">
                <th scope="row" className="px-4 py-3.5 font-mono text-[13px] font-semibold text-primary">
                  {row.property}
                  {row.category ? (
                    <span className="mt-1.5 block font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {row.category}
                    </span>
                  ) : null}
                </th>
                <td className="px-4 py-3.5 leading-6 text-muted-foreground">
                  {row.description}
                </td>
                <td className="px-4 py-3.5">
                  <code className="whitespace-pre-wrap break-all rounded bg-muted/55 px-1.5 py-1 font-mono text-[12px] leading-5 text-foreground">
                    {row.type}
                  </code>
                </td>
                <td className="px-4 py-3.5">
                  <code className="whitespace-pre-wrap break-words font-mono text-[12px] leading-5 text-foreground">
                    {row.default}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
