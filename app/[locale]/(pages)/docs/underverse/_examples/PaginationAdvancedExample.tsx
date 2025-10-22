"use client";

import React from "react";
import { Pagination } from "@/components/ui/Pagination";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";

export default function PaginationAdvancedExample() {
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);
  const totalItems = 237;
  const totalPages = Math.ceil(totalItems / size);
  const t = useTranslations('Pagination');

  const code =
    `import { Pagination } from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n\n` +
    `const [page, setPage] = useState(1)\n` +
    `const [size, setSize] = useState(10)\n` +
    `const totalItems = 237\n` +
    `const totalPages = Math.ceil(totalItems / size)\n` +
    `const t = useTranslations('Pagination')\n\n` +
    `<Pagination\n` +
    `  page={page}\n` +
    `  totalPages={totalPages}\n` +
    `  onChange={setPage}\n` +
    `  pageSize={size}\n` +
    `  pageSizeOptions={[10, 20, 50]}\n` +
    `  onPageSizeChange={(n) => { setSize(n); setPage(1); }}\n` +
    `  showInfo\n` +
    `  totalItems={totalItems}\n` +
    `  labels={{\n` +
    `    navigationLabel: t('navigationLabel'),\n` +
    `    showingResults: ({startItem, endItem, totalItems: ti}) =>\n` +
    `      t('showingResults', { startItem: startItem ?? 0, endItem: endItem ?? 0, totalItems: ti ?? 0 }),\n` +
    `    pageNumber: (p) => t('pageNumber', { page: p as number })\n` +
    `  }}\n` +
    `/>`;

  const demo = (
    <div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        pageSize={size}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={(n) => { setSize(n); setPage(1); }}
        showInfo
        totalItems={totalItems}
        labels={{
          navigationLabel: t('navigationLabel'),
          showingResults: ({startItem, endItem, totalItems: ti}) =>
            t('showingResults', { startItem: startItem ?? 0, endItem: endItem ?? 0, totalItems: ti ?? 0 }),
          pageNumber: (p) => t('pageNumber', { page: p as number })
        }}
      />
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
