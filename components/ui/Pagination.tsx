"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Combobox } from "./Combobox";
import { useTranslations } from "@/lib/i18n/translation-adapter";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  showInfo?: boolean;
  disabled?: boolean;
  // For page size selector
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  labels?: {
    navigationLabel?: string;
    firstPage?: string;
    previousPage?: string;
    nextPage?: string;
    lastPage?: string;
    pageNumber?: (page: number) => string;
  };
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
  className,
  size = "md",
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  showInfo = false,
  disabled = false,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalItems,
  labels,
}) => {
  const t = useTranslations("Pagination");

  // Keyboard navigation
  React.useEffect(() => {
    if (disabled) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") return; // Don't interfere with input fields

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        onChange(Math.min(totalPages, page + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        onChange(Math.max(1, page - 1));
      }
      if (e.key === "Home") {
        e.preventDefault();
        onChange(1);
      }
      if (e.key === "End") {
        e.preventDefault();
        onChange(totalPages);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page, totalPages, onChange, disabled]);

  // Calculate display info
  const startItem = totalItems ? (page - 1) * (pageSize || 10) + 1 : null;
  const endItem = totalItems ? Math.min(page * (pageSize || 10), totalItems) : null;

  // Convert pageSize options to string array for Combobox
  const pageSizeOptionsStrings = pageSizeOptions?.map((size) => size.toString()) || [];

  const handlePageSizeChange = (value: string) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(value));
    }
  };

  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const createCompactPageArray = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Size classes
  const sizeClasses = {
    sm: { btn: "h-7 w-7", text: "text-xs", page: "h-7 min-w-7 px-1.5" },
    md: { btn: "h-8 w-8", text: "text-sm", page: "h-8 min-w-8 px-2" },
    lg: { btn: "h-9 w-9", text: "text-base", page: "h-9 min-w-9 px-2.5" },
  };

  const sizeClass = sizeClasses[size];

  return (
    <nav
      className={cn("flex items-center justify-between gap-2", sizeClass.text, "text-muted-foreground", className)}
      aria-label={labels?.navigationLabel || t("navigationLabel")}
    >
      {/* Left: Info Display */}
      {showInfo && totalItems && startItem && endItem ? (
        <div className="tabular-nums shrink-0">
          {startItem}-{endItem}/{totalItems}
        </div>
      ) : (
        <div />
      )}

      {/* Center: Pagination controls */}
      <div className="flex items-center gap-0.5">
        {/* First Page */}
        {showFirstLast && (
          <button
            onClick={() => onChange(1)}
            disabled={disabled || page === 1}
            className={cn(
              sizeClass.btn,
              "p-0 rounded transition-colors hidden sm:flex items-center justify-center",
              disabled || page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
            )}
            title={labels?.firstPage || t("firstPage")}
            aria-label={labels?.firstPage || t("firstPage")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <button
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={disabled || page === 1}
            className={cn(
              sizeClass.btn,
              "p-0 rounded transition-colors flex items-center justify-center",
              disabled || page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
            )}
            title={labels?.previousPage || t("previousPage")}
            aria-label={labels?.previousPage || t("previousPage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Page Numbers */}
        {showPageNumbers &&
          createCompactPageArray().map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-1 text-muted-foreground/60">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                disabled={disabled}
                className={cn(
                  sizeClass.page,
                  "rounded font-medium transition-colors",
                  page === p ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
                aria-label={labels?.pageNumber ? labels.pageNumber(p) : t("pageNumber", { page: p })}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

        {/* Next Page */}
        {showPrevNext && (
          <button
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={disabled || page === totalPages}
            className={cn(
              sizeClass.btn,
              "p-0 rounded transition-colors flex items-center justify-center",
              disabled || page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
            )}
            title={labels?.nextPage || t("nextPage")}
            aria-label={labels?.nextPage || t("nextPage")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Last Page */}
        {showFirstLast && (
          <button
            onClick={() => onChange(totalPages)}
            disabled={disabled || page === totalPages}
            className={cn(
              sizeClass.btn,
              "p-0 rounded transition-colors hidden sm:flex items-center justify-center",
              disabled || page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
            )}
            title={labels?.lastPage || t("lastPage")}
            aria-label={labels?.lastPage || t("lastPage")}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Right: Page Size Selector */}
      {pageSizeOptions && onPageSizeChange ? (
        <Combobox
          options={pageSizeOptionsStrings}
          value={pageSize?.toString() || "10"}
          onChange={handlePageSizeChange}
          size="sm"
          className="w-14"
          disabled={disabled}
        />
      ) : (
        <div />
      )}
    </nav>
  );
};

// Simple Pagination - minimal version with just prev/next
export interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  pageSize?: number;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  page,
  totalPages,
  onChange,
  className,
  size = "md",
  disabled = false,
  showInfo = false,
  totalItems,
  pageSize = 10,
}) => {
  if (totalPages <= 1) return null;

  const sizeClasses = {
    sm: { btn: "h-7 w-7", text: "text-xs" },
    md: { btn: "h-8 w-8", text: "text-sm" },
    lg: { btn: "h-9 w-9", text: "text-base" },
  };

  const sizeClass = sizeClasses[size];
  const startItem = totalItems ? (page - 1) * pageSize + 1 : null;
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div className={cn("flex items-center justify-between gap-2", sizeClass.text, "text-muted-foreground", className)}>
      {/* Left: Info */}
      {showInfo && totalItems && startItem && endItem ? (
        <div className="tabular-nums">
          {startItem}-{endItem}/{totalItems}
        </div>
      ) : (
        <div />
      )}

      {/* Center: Page indicator with prev/next */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={disabled || page === 1}
          className={cn(
            sizeClass.btn,
            "p-0 rounded transition-colors flex items-center justify-center",
            disabled || page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="px-2 tabular-nums font-medium text-foreground">
          {page}/{totalPages}
        </span>

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={disabled || page === totalPages}
          className={cn(
            sizeClass.btn,
            "p-0 rounded transition-colors flex items-center justify-center",
            disabled || page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div />
    </div>
  );
};

// Compact Pagination - icon only version
export interface CompactPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  disabled?: boolean;
}

export const CompactPagination: React.FC<CompactPaginationProps> = ({ page, totalPages, onChange, className, disabled = false }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center gap-0.5 text-xs text-muted-foreground", className)} aria-label="Compact Pagination">
      <button
        onClick={() => onChange(1)}
        disabled={disabled || page === 1}
        className={cn(
          "h-6 w-6 p-0 rounded transition-colors flex items-center justify-center",
          disabled || page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
        )}
        title="First page"
        aria-label="First page"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={disabled || page === 1}
        className={cn(
          "h-6 w-6 p-0 rounded transition-colors flex items-center justify-center",
          disabled || page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
        )}
        title="Previous page"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <span className="px-1.5 tabular-nums">
        {page}/{totalPages}
      </span>

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={disabled || page === totalPages}
        className={cn(
          "h-6 w-6 p-0 rounded transition-colors flex items-center justify-center",
          disabled || page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
        )}
        title="Next page"
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onChange(totalPages)}
        disabled={disabled || page === totalPages}
        className={cn(
          "h-6 w-6 p-0 rounded transition-colors flex items-center justify-center",
          disabled || page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
        )}
        title="Last page"
        aria-label="Last page"
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
};
