"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { cn } from "@/lib/utils/cn";
import type { DataTableSize } from "../types";

export function DataTablePagination({
  totalItems,
  curPage,
  curPageSize,
  setCurPage,
  pageSizeOptions,
  setCurPageSize,
  size,
}: {
  totalItems: number;
  curPage: number;
  curPageSize: number;
  setCurPage: React.Dispatch<React.SetStateAction<number>>;
  pageSizeOptions?: number[];
  setCurPageSize: React.Dispatch<React.SetStateAction<number>>;
  size: DataTableSize;
}) {
  const totalPages = Math.ceil(totalItems / curPageSize);
  if (!(totalItems > 0 && totalPages > 1)) return null;

  const controlButtonSize = size === "lg" ? "md" : "sm";
  const navBtnClass = size === "sm" ? "h-6 w-6 p-0 rounded-full" : size === "lg" ? "h-8 w-8 p-0 rounded-full" : "h-7 w-7 p-0 rounded-full";
  const navIconClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const pageBtnClass =
    size === "sm" ? "h-6 min-w-6 px-1.5 rounded-full text-[11px] font-medium transition-colors" : size === "lg"
      ? "h-8 min-w-8 px-2.5 rounded-full text-sm font-medium transition-colors"
      : "h-7 min-w-7 px-2 rounded-full text-xs font-medium transition-colors";
  const containerTextClass = size === "sm" ? "text-[11px]" : size === "lg" ? "text-sm" : "text-xs";
  const pageSizeClass = size === "sm" ? "w-16" : size === "lg" ? "w-24" : "w-20";

  return (
    <div className={cn("flex items-center justify-between gap-2 px-1 pt-3 text-muted-foreground", containerTextClass)}>
      <div className="tabular-nums">
        {(curPage - 1) * curPageSize + 1}-{Math.min(curPage * curPageSize, totalItems)}/{totalItems}
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size={controlButtonSize}
          className={navBtnClass}
          onClick={() => setCurPage(Math.max(1, curPage - 1))}
          disabled={curPage === 1}
        >
          <svg className={navIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  pageBtnClass,
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
          size={controlButtonSize}
          className={navBtnClass}
          onClick={() => setCurPage(Math.min(totalPages, curPage + 1))}
          disabled={curPage === totalPages}
        >
          <svg className={navIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          size={size}
          className={pageSizeClass}
        />
      )}
    </div>
  );
}
