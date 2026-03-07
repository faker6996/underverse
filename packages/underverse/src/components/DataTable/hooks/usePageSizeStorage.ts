"use client";

import React from "react";

export function usePageSizeStorage({ pageSize, storageKey }: { pageSize: number; storageKey?: string }) {
  const loadedFromStorage = React.useRef(false);
  const [curPageSize, setCurPageSize] = React.useState(() => {
    if (typeof window === "undefined" || !storageKey) return pageSize;
    try {
      const saved = localStorage.getItem(`datatable_${storageKey}_pageSize`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          loadedFromStorage.current = true;
          return parsed;
        }
      }
    } catch {
      // localStorage không khả dụng
    }
    return pageSize;
  });

  const hasMounted = React.useRef(false);
  React.useEffect(() => {
    hasMounted.current = true;
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    if (!hasMounted.current) return;
    try {
      localStorage.setItem(`datatable_${storageKey}_pageSize`, String(curPageSize));
    } catch {
      // localStorage không khả dụng
    }
  }, [curPageSize, storageKey]);

  React.useEffect(() => {
    if (storageKey && loadedFromStorage.current) return;
    setCurPageSize(pageSize);
  }, [pageSize, storageKey]);

  return { curPageSize, setCurPageSize, loadedFromStorage };
}

