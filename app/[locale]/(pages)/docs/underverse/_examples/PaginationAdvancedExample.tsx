"use client";

import React from "react";
import { Pagination } from "@/components/ui/Pagination";
import CodeBlock from "../_components/CodeBlock";
import { useTranslations } from "next-intl";

export default function PaginationAdvancedExample() {
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);
  const totalItems = 237;
  const totalPages = Math.ceil(totalItems / size);
  const t = useTranslations('Pagination');

  return (
    <div className="space-y-3">
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
          showingResults: ({startItem, endItem, totalItems}) => t('showingResults', { startItem, endItem, totalItems }),
          pageNumber: (p) => t('pageNumber', { page: p })
        }}
      />
      <CodeBlock code={`<Pagination page={page} totalPages={pages} pageSize={size}
  pageSizeOptions={[10,20,50]} onPageSizeChange={setSize} showInfo totalItems={237} />`} />
    </div>
  );
}

