"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { cn } from "@/lib/utils/cn";

export function DataTablePagination({
  totalItems,
  curPage,
  curPageSize,
  setCurPage,
  pageSizeOptions,
  setCurPageSize,
}: {
  totalItems: number;
  curPage: number;
  curPageSize: number;
  setCurPage: React.Dispatch<React.SetStateAction<number>>;
  pageSizeOptions?: number[];
  setCurPageSize: React.Dispatch<React.SetStateAction<number>>;
}) {
  const totalPages = Math.ceil(totalItems / curPageSize);
  if (!(totalItems > 0 && totalPages > 1)) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-1 pt-3 text-xs text-muted-foreground">
      <div className="tabular-nums">
        {(curPage - 1) * curPageSize + 1}-{Math.min(curPage * curPageSize, totalItems)}/{totalItems}
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full"
          onClick={() => setCurPage(Math.max(1, curPage - 1))}
          disabled={curPage === 1}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        {(() => {
          const pages: (number | "...")[] = [];

          if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            if (curPage > 3) pages.push("...");

            const start = Math.max(2, curPage - 1);
            const end = Math.min(totalPages - 1, curPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (curPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
          }

          return pages.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-1 text-muted-foreground/60">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurPage(p)}
                className={cn(
                  "h-7 min-w-7 px-2 rounded-full text-xs font-medium transition-colors",
                  curPage === p ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {p}
              </button>
            ),
          );
        })()}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full"
          onClick={() => setCurPage(Math.min(totalPages, curPage + 1))}
          disabled={curPage === totalPages}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {pageSizeOptions && (
        <Combobox
          options={pageSizeOptions.map(String)}
          value={String(curPageSize)}
          onChange={(v) => {
            setCurPage(1);
            setCurPageSize(Number(v));
          }}
          size="sm"
          className="w-20"
        />
      )}
    </div>
  );
}

