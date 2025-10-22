"use client";

import React from "react";
import { Pagination } from "@/components/ui/Pagination";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function PaginationExample() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(95);
  const [size, setSize] = React.useState<"sm" | "md" | "lg">("md");
  const [variant, setVariant] = React.useState<"default" | "outline" | "ghost">("outline");
  const [firstLast, setFirstLast] = React.useState(true);
  const [prevNext, setPrevNext] = React.useState(true);
  const [pageNumbers, setPageNumbers] = React.useState(true);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const t = useTranslations("Pagination");

  const code =
    `import { Pagination } from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n\n` +
    `const [page, setPage] = useState(1)\n` +
    `const [pageSize, setPageSize] = useState(10)\n` +
    `const [totalItems, setTotalItems] = useState(95)\n` +
    `const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))\n` +
    `const t = useTranslations("Pagination")\n\n` +
    `<Pagination\n` +
    `  page={page}\n` +
    `  totalPages={totalPages}\n` +
    `  onChange={setPage}\n` +
    `  pageSize={pageSize}\n` +
    `  onPageSizeChange={setPageSize}\n` +
    `  pageSizeOptions={[5, 10, 20, 50]}\n` +
    `  totalItems={totalItems}\n` +
    `  size="md"\n` +
    `  variant="outline"\n` +
    `  showFirstLast={true}\n` +
    `  showPrevNext={true}\n` +
    `  showPageNumbers={true}\n` +
    `  showInfo\n` +
    `  labels={{...}}\n` +
    `/>`;

  const demo = (
    <div className="space-y-4">
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        totalItems={totalItems}
        size={size}
        variant={variant}
        showFirstLast={firstLast}
        showPrevNext={prevNext}
        showPageNumbers={pageNumbers}
        showInfo
        labels={{
          navigationLabel: t('navigationLabel'),
          showingResults: ({startItem,endItem,totalItems}) => t('showingResults', {startItem: startItem ?? 0, endItem: endItem ?? 0, totalItems: totalItems ?? 0}),
          firstPage: t('firstPage'),
          previousPage: t('previousPage'),
          previous: t('previous'),
          nextPage: t('nextPage'),
          next: t('next'),
          lastPage: t('lastPage'),
          itemsPerPage: t('itemsPerPage'),
          search: t('search'),
          noOptions: t('noOptions'),
          pageNumber: (p) => t('pageNumber', {page: p})
        }}
      />

      <div className="flex flex-wrap gap-2 items-center text-sm">
        <span className="text-muted-foreground mr-2">Size:</span>
        {(["sm","md","lg"] as const).map(s => (
          <Button key={s} size="sm" variant={size===s?"primary":"outline"} onClick={()=>setSize(s)}>{s}</Button>
        ))}
        <span className="text-muted-foreground mx-2">Variant:</span>
        {(["default","outline","ghost"] as const).map(v => (
          <Button key={v} size="sm" variant={variant===v?"primary":"outline"} onClick={()=>setVariant(v)}>{v}</Button>
        ))}
        <Button size="sm" variant={firstLast?"primary":"outline"} onClick={()=>setFirstLast(v=>!v)}>First/Last</Button>
        <Button size="sm" variant={prevNext?"primary":"outline"} onClick={()=>setPrevNext(v=>!v)}>Prev/Next</Button>
        <Button size="sm" variant={pageNumbers?"primary":"outline"} onClick={()=>setPageNumbers(v=>!v)}>Numbers</Button>
        <Button size="sm" variant="outline" onClick={()=>setTotalItems(n=>n+10)}>+10 items</Button>
        <Button size="sm" variant="outline" onClick={()=>setTotalItems(n=>Math.max(0,n-10))}>-10 items</Button>
      </div>
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
