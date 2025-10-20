"use client";

import React from "react";
import { Pagination } from "@/components/ui/Pagination";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import Button from "@/components/ui/Button";

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

  return (
    <IntlDemoProvider>
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

        <CodeBlock code={`<Pagination size='${'${size}'}' variant='${'${variant}'}' showFirstLast={${'${firstLast}'}} showPrevNext={${'${prevNext}'}} showPageNumbers={${'${pageNumbers}'}} />`} />
      </div>
    </IntlDemoProvider>
  );
}
