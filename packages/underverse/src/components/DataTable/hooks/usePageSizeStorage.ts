"use client";

import React from "react";

function readStoredPageSize(storageKey?: string) {
  if (typeof window === "undefined" || !storageKey) return null;

  try {
    const saved = localStorage.getItem(`datatable_${storageKey}_pageSize`);
    if (!saved) return null;

    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  } catch {
    // localStorage không khả dụng
    return null;
  }
}

export function usePageSizeStorage({ pageSize, storageKey }: { pageSize: number; storageKey?: string }) {
  const storedPageSize = React.useMemo(() => readStoredPageSize(storageKey), [storageKey]);
  const [overrideState, setOverrideState] = React.useState<{ storageKey?: string; pageSize: number | null }>({
    storageKey,
    pageSize: null,
  });

  const overridePageSize = overrideState.storageKey === storageKey ? overrideState.pageSize : null;
  const persistedPageSize = storageKey ? overridePageSize ?? storedPageSize : null;
  const loadedFromStorage = persistedPageSize != null;
  const curPageSize = storageKey ? persistedPageSize ?? pageSize : overridePageSize ?? pageSize;

  const setCurPageSize = React.useCallback(
    (nextPageSize: React.SetStateAction<number>) => {
      const baseValue = storageKey ? persistedPageSize ?? pageSize : overridePageSize ?? pageSize;
      const resolved = typeof nextPageSize === "function" ? (nextPageSize as (value: number) => number)(baseValue) : nextPageSize;

      setOverrideState({ storageKey, pageSize: resolved });

      if (!storageKey || typeof window === "undefined") return;

      try {
        localStorage.setItem(`datatable_${storageKey}_pageSize`, String(resolved));
      } catch {
        // localStorage không khả dụng
      }
    },
    [overridePageSize, pageSize, persistedPageSize, storageKey],
  );

  return { curPageSize, setCurPageSize, loadedFromStorage };
}
