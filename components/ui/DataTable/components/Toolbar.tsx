"use client";

import React from "react";
import Button from "@/components/ui/Button";
import DropdownMenu, { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { DataTableColumn, DataTableLabels } from "../types";

export function DataTableToolbar<T>({
  caption,
  toolbar,
  columns,
  visibleCols,
  setVisibleCols,
  enableDensityToggle,
  enableColumnVisibilityToggle,
  enableHeaderAlignToggle,
  density,
  setDensity,
  setHeaderAlign,
  labels,
  t,
}: {
  caption?: React.ReactNode;
  toolbar?: React.ReactNode;
  columns: DataTableColumn<T>[];
  visibleCols: string[];
  setVisibleCols: React.Dispatch<React.SetStateAction<string[]>>;
  enableDensityToggle: boolean;
  enableColumnVisibilityToggle: boolean;
  enableHeaderAlignToggle: boolean;
  density: "compact" | "normal" | "comfortable";
  setDensity: React.Dispatch<React.SetStateAction<"compact" | "normal" | "comfortable">>;
  setHeaderAlign: React.Dispatch<React.SetStateAction<"left" | "center" | "right">>;
  labels?: DataTableLabels;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-1">
      <div className="text-sm text-muted-foreground">{caption}</div>
      <div className="flex items-center gap-2">
        {enableDensityToggle && (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {labels?.density || t("density")}
              </Button>
            }
            items={[
              { label: (labels?.compact || t("compact")) as string, onClick: () => setDensity("compact") },
              { label: (labels?.normal || t("normal")) as string, onClick: () => setDensity("normal") },
              { label: (labels?.comfortable || t("comfortable")) as string, onClick: () => setDensity("comfortable") },
            ]}
          />
        )}

        {enableColumnVisibilityToggle && (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                {labels?.columns || t("columns")}
              </Button>
            }
          >
            {columns.map((c) => (
              <DropdownMenuItem
                key={c.key}
                onClick={() => {
                  setVisibleCols((prev) => (prev.includes(c.key) ? prev.filter((k) => k !== c.key) : [...prev, c.key]));
                }}
              >
                <input type="checkbox" className="mr-2 rounded-md border-border" readOnly checked={visibleCols.includes(c.key)} />
                <span className="truncate">{c.title as any}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        )}

        {enableHeaderAlignToggle && (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
                {labels?.headerAlign || t("headerAlign")}
              </Button>
            }
            items={[
              { label: (labels?.alignLeft || t("alignLeft")) as string, onClick: () => setHeaderAlign("left") },
              { label: (labels?.alignCenter || t("alignCenter")) as string, onClick: () => setHeaderAlign("center") },
              { label: (labels?.alignRight || t("alignRight")) as string, onClick: () => setHeaderAlign("right") },
            ]}
          />
        )}

        {toolbar}
      </div>
    </div>
  );
}

