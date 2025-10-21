"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from "lucide-react";
import Button from "./Button";
import { Combobox } from "./Combobox";
import { useTranslations } from "next-intl";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
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
    showingResults?: (ctx: { startItem: number; endItem: number; totalItems?: number }) => string;
    firstPage?: string;
    previousPage?: string;
    previous?: string;
    nextPage?: string;
    next?: string;
    lastPage?: string;
    itemsPerPage?: string;
    search?: string;
    noOptions?: string;
    pageNumber?: (page: number) => string;
  };
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
  className,
  size = "md",
  variant = "outline",
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

  const createPageArray = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push("...");

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  // Helper function to get button variant based on active state
  const getButtonVariant = (isActive: boolean) => {
    if (isActive) return "primary";
    return variant === "default" ? "default" : variant;
  };

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

  return (
    <nav className={cn("flex flex-col gap-4", className)} aria-label={labels?.navigationLabel || t("navigationLabel")}>
      {/* Info Display */}
      {showInfo && totalItems && (
        <div className="text-sm text-muted-foreground text-center">
          {labels?.showingResults
            ? labels.showingResults({ startItem: startItem || 0, endItem: endItem || 0, totalItems })
            : t("showingResults", { startItem: startItem || 0, endItem: endItem || 0, totalItems })}
        </div>
      )}

      {/* Main Pagination */}
      <div className="flex items-center justify-center gap-1">
        {/* First Page */}
        {showFirstLast && (
          <Button
            variant={getButtonVariant(false)}
            size={size}
            icon={ChevronsLeft}
            onClick={() => onChange(1)}
            disabled={disabled || page === 1}
            className="hidden sm:flex"
            title={labels?.firstPage || t("firstPage")}
            aria-label={labels?.firstPage || t("firstPage")}
            aria-disabled={disabled || page === 1}
          />
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <Button
            variant={getButtonVariant(false)}
            size={size}
            icon={ChevronLeft}
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={disabled || page === 1}
            title={labels?.previousPage || t("previousPage")}
            aria-label={labels?.previousPage || t("previousPage")}
            aria-disabled={disabled || page === 1}
          >
            <span className="hidden sm:inline">{labels?.previous || t("previous")}</span>
          </Button>
        )}

        {/* Page Numbers */}
        {showPageNumbers &&
          createPageArray().map((p, i) => {
            if (p === "...") {
              return <Button key={i} variant="ghost" size={size} disabled icon={MoreHorizontal} className="cursor-default" />;
            }

            const pageNumber = p as number;
            const isActive = page === pageNumber;

            return (
              <Button
                key={i}
                variant={getButtonVariant(isActive)}
                size={size}
                onClick={() => onChange(pageNumber)}
                disabled={disabled}
                className={cn("min-w-[2.5rem]", isActive && "font-semibold")}
                aria-label={labels?.pageNumber ? labels.pageNumber(pageNumber) : t("pageNumber", { page: pageNumber })}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}

        {/* Next Page */}
        {showPrevNext && (
          <Button
            variant={getButtonVariant(false)}
            size={size}
            iconRight={ChevronRight}
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={disabled || page === totalPages}
            title={labels?.nextPage || t("nextPage")}
            aria-label={labels?.nextPage || t("nextPage")}
            aria-disabled={disabled || page === totalPages}
          >
            <span className="hidden sm:inline">{labels?.next || t("next")}</span>
          </Button>
        )}

        {/* Last Page */}
        {showFirstLast && (
          <Button
            variant={getButtonVariant(false)}
            size={size}
            icon={ChevronsRight}
            onClick={() => onChange(totalPages)}
            disabled={disabled || page === totalPages}
            className="hidden sm:flex"
            title={labels?.lastPage || t("lastPage")}
            aria-label={labels?.lastPage || t("lastPage")}
            aria-disabled={disabled || page === totalPages}
          />
        )}
      </div>

      {/* Page Size Selector */}
      {pageSizeOptions && onPageSizeChange && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">{labels?.itemsPerPage || t("itemsPerPage")}:</span>
          <div className="w-20">
            <Combobox
              options={pageSizeOptionsStrings}
              value={pageSize?.toString() || "10"}
              onChange={handlePageSizeChange}
              placeholder="10"
              searchPlaceholder={labels?.search || t("search")}
              emptyText={labels?.noOptions || t("noOptions")}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

// Simple Pagination - minimal version with just prev/next
interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
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
  variant = "outline",
  disabled = false,
  showInfo = false,
  totalItems,
  pageSize = 10,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showInfo && totalItems && (
        <div className="text-sm text-muted-foreground text-center">
          Page {page} of {totalPages} ({totalItems} total items)
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant={variant} size={size} icon={ChevronLeft} onClick={() => onChange(Math.max(1, page - 1))} disabled={disabled || page === 1}>
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Page</span>
          <span className="font-medium text-foreground">{page}</span>
          <span>of</span>
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        <Button
          variant={variant}
          size={size}
          iconRight={ChevronRight}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={disabled || page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Compact Pagination - icon only version
interface CompactPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}

export const CompactPagination: React.FC<CompactPaginationProps> = ({
  page,
  totalPages,
  onChange,
  className,
  variant = "outline",
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Compact Pagination">
      <Button
        variant={variant}
        size="icon"
        icon={ChevronsLeft}
        onClick={() => onChange(1)}
        disabled={disabled || page === 1}
        title="First page"
        aria-label="First page"
      />
      <Button
        variant={variant}
        size="icon"
        icon={ChevronLeft}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={disabled || page === 1}
        title="Previous page"
      />

      <div className="px-2 py-1 text-sm text-muted-foreground min-w-[4rem] text-center">
        {page} / {totalPages}
      </div>

      <Button
        variant={variant}
        size="icon"
        icon={ChevronRight}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={disabled || page === totalPages}
        title="Next page"
      />
      <Button
        variant={variant}
        size="icon"
        icon={ChevronsRight}
        onClick={() => onChange(totalPages)}
        disabled={disabled || page === totalPages}
        title="Last page"
      />
    </nav>
  );
};
