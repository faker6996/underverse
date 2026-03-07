"use client";

import React from "react";
import { usePageSizeStorage } from "./usePageSizeStorage";
import { getLeafColumns } from "../utils/headers";
import type { DataTableColumn, DataTableDensity, DataTableSize, Sorter } from "../types";

const SIZE_TO_DENSITY: Record<DataTableSize, DataTableDensity> = {
  sm: "compact",
  md: "normal",
  lg: "comfortable",
};

type HeaderAlign = "left" | "center" | "right";

export function useDataTableState<T>({
  columns,
  page,
  pageSize,
  size,
  storageKey,
}: {
  columns: DataTableColumn<T>[];
  page: number;
  pageSize: number;
  size: DataTableSize;
  storageKey?: string;
}) {
  const allLeafColumns = React.useMemo(() => getLeafColumns(columns), [columns]);
  const defaultVisibleLeafKeys = React.useMemo(() => allLeafColumns.filter((column) => column.visible !== false).map((column) => column.key), [allLeafColumns]);
  const knownLeafKeysRef = React.useRef(new Set(defaultVisibleLeafKeys));

  const [headerAlign, setHeaderAlign] = React.useState<HeaderAlign>("left");
  const [visibleCols, setVisibleCols] = React.useState<string[]>(defaultVisibleLeafKeys);
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [sort, setSort] = React.useState<Sorter>(null);
  const [density, setDensity] = React.useState<DataTableDensity>(() => SIZE_TO_DENSITY[size]);
  const [curPage, setCurPage] = React.useState(page);
  const { curPageSize, setCurPageSize } = usePageSizeStorage({ pageSize, storageKey });

  React.useEffect(() => {
    const knownLeafKeys = knownLeafKeysRef.current;
    setVisibleCols((prev) => {
      const prevSet = new Set(prev);
      return allLeafColumns
        .filter((column) => prevSet.has(column.key) || (!knownLeafKeys.has(column.key) && column.visible !== false))
        .map((column) => column.key);
    });
    knownLeafKeysRef.current = new Set(allLeafColumns.map((column) => column.key));
  }, [allLeafColumns]);

  React.useEffect(() => {
    setCurPage(page);
  }, [page]);

  React.useEffect(() => {
    setDensity(SIZE_TO_DENSITY[size]);
  }, [size]);

  return {
    headerAlign,
    setHeaderAlign,
    visibleCols,
    setVisibleCols,
    filters,
    setFilters,
    sort,
    setSort,
    density,
    setDensity,
    curPage,
    setCurPage,
    curPageSize,
    setCurPageSize,
  };
}
