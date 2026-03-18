"use client";

import React from "react";
import { cn } from "../utils/cn";
import { useOverlayScrollbarTarget } from "./OverlayScrollbarProvider";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  disableContainer?: boolean;
  /** Enable OverlayScrollbars on table container. Default: false */
  useOverlayScrollbar?: boolean;
}

const TABLE_BASE_CLASS = "w-full caption-bottom text-sm";
const TABLE_CONTAINER_BASE_CLASS = [
  "relative w-full overflow-auto",
  "rounded-2xl md:rounded-3xl border border-border/50",
  "bg-card text-card-foreground shadow-sm",
  "backdrop-blur-sm transition-all duration-300",
].join(" ");

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

const TableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    useOverlayScrollbar?: boolean;
  }
>(({ className, useOverlayScrollbar = false, ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useOverlayScrollbarTarget(containerRef, { enabled: useOverlayScrollbar });

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        assignRef(ref, node);
      }}
      className={cn(TABLE_CONTAINER_BASE_CLASS, className)}
      {...props}
    />
  );
});
TableContainer.displayName = "TableContainer";

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, disableContainer = false, useOverlayScrollbar = false, ...props }, ref) => {
    if (disableContainer) {
      return <table ref={ref} className={cn(TABLE_BASE_CLASS, className)} {...props} />;
    }

    return (
      <TableContainer className={containerClassName} useOverlayScrollbar={useOverlayScrollbar}>
        <table ref={ref} className={cn(TABLE_BASE_CLASS, className)} {...props} />
      </TableContainer>
    );
  },
);
Table.displayName = "Table";

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  filterRow?: React.ReactNode;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, children, filterRow, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-border/50", "bg-muted", className)} {...props}>
    {children}
    {filterRow}
  </thead>
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border/50 transition-all duration-300",
      "hover:bg-muted/30 hover:shadow-sm",
      "data-[state=selected]:bg-muted/50",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
