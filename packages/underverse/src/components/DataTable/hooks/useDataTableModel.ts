"use client";

import React from "react";
import { getColumnWidth } from "../utils/columns";
import { buildHeaderRows, filterVisibleColumns, getLeafColumns, getLeafColumnsWithFixedInheritance } from "../utils/headers";
import type { DataTableColumn, Sorter } from "../types";

export function useDataTableModel<T extends Record<string, any>>({
  columns,
  data,
  visibleCols,
  filters,
  sort,
  curPage,
  curPageSize,
  isServerMode,
  total,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  visibleCols: string[];
  filters: Record<string, any>;
  sort: Sorter;
  curPage: number;
  curPageSize: number;
  isServerMode: boolean;
  total: number;
}) {
  const visibleColsSet = React.useMemo(() => new Set(visibleCols), [visibleCols]);

  const allLeafColumns = React.useMemo(() => getLeafColumns(columns), [columns]);

  const columnMap = React.useMemo(() => {
    return new Map(allLeafColumns.map((column) => [column.key, column]));
  }, [allLeafColumns]);

  const visibleColumns = React.useMemo(() => {
    return filterVisibleColumns(columns, visibleColsSet);
  }, [columns, visibleColsSet]);

  const leafColumns = React.useMemo(() => {
    return getLeafColumnsWithFixedInheritance(visibleColumns);
  }, [visibleColumns]);

  const headerRows = React.useMemo(() => buildHeaderRows(visibleColumns), [visibleColumns]);

  const totalColumnsWidth = React.useMemo(() => {
    return leafColumns.reduce((sum, column) => sum + getColumnWidth(column), 0);
  }, [leafColumns]);

  const processedData = React.useMemo(() => {
    if (isServerMode) return data;

    let result = [...data];

    if (Object.keys(filters).length > 0) {
      result = result.filter((row) =>
        Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === "") return true;

          const column = columnMap.get(key);
          const rowValue = column?.dataIndex ? row[column.dataIndex as keyof T] : row[key];

          if (column?.filter?.type === "date" && value instanceof Date) {
            return new Date(rowValue).toDateString() === value.toDateString();
          }

          return String(rowValue ?? "")
            .toLowerCase()
            .includes(String(value).toLowerCase());
        }),
      );
    }

    if (sort) {
      result.sort((a, b) => {
        const column = columnMap.get(sort.key);
        const aValue = column?.dataIndex ? a[column.dataIndex as keyof T] : a[sort.key];
        const bValue = column?.dataIndex ? b[column.dataIndex as keyof T] : b[sort.key];

        if (aValue === bValue) return 0;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.order === "asc" ? aValue - bValue : bValue - aValue;
        }

        const compare = String(aValue).localeCompare(String(bValue));
        return sort.order === "asc" ? compare : -compare;
      });
    }

    return result;
  }, [columnMap, data, filters, isServerMode, sort]);

  const totalItems = isServerMode ? total : processedData.length;

  const displayedData = React.useMemo(() => {
    if (isServerMode) return data;
    const start = (curPage - 1) * curPageSize;
    return processedData.slice(start, start + curPageSize);
  }, [curPage, curPageSize, data, isServerMode, processedData]);

  return {
    visibleColumns,
    leafColumns,
    headerRows,
    totalColumnsWidth,
    totalItems,
    displayedData,
  };
}
