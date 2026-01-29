import * as React from "react";
import { clamp } from "./layout";

export function useHorizontalScrollSync(args: {
  bodyRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
  leftRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const { bodyRef, headerRef, leftRef } = args;

  React.useEffect(() => {
    const body = bodyRef.current;
    const header = headerRef.current;
    const left = leftRef?.current ?? null;
    if (!body || !header) return;

    let raf = 0;
    let syncing = false;

    const syncFrom = (source: "body" | "header" | "left") => {
      if (syncing) return;
      syncing = true;

      if (source === "header") {
        const x = header.scrollLeft;
        if (body.scrollLeft !== x) body.scrollLeft = x;
      } else if (source === "left" && left) {
        const y = left.scrollTop;
        if (body.scrollTop !== y) body.scrollTop = y;
      } else {
        const x = body.scrollLeft;
        const y = body.scrollTop;
        if (header.scrollLeft !== x) header.scrollLeft = x;
        if (left && left.scrollTop !== y) left.scrollTop = y;
      }

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const onBodyScroll = () => syncFrom("body");
    const onHeaderScroll = () => syncFrom("header");
    const onLeftScroll = () => syncFrom("left");

    syncFrom("body");
    body.addEventListener("scroll", onBodyScroll, { passive: true });
    header.addEventListener("scroll", onHeaderScroll, { passive: true });
    left?.addEventListener("scroll", onLeftScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      body.removeEventListener("scroll", onBodyScroll);
      header.removeEventListener("scroll", onHeaderScroll);
      left?.removeEventListener("scroll", onLeftScroll);
    };
  }, [bodyRef, headerRef, leftRef]);
}

export function useVirtualRows(args: {
  enabled?: boolean;
  overscan: number;
  rowHeight: number;
  itemCount: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { enabled, overscan, rowHeight, itemCount, scrollRef } = args;
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return React.useMemo(() => {
    if (!enabled) {
      return { startIndex: 0, endIndex: itemCount, topSpacer: 0, bottomSpacer: 0 };
    }

    const startIndex = clamp(Math.floor(scrollTop / rowHeight) - overscan, 0, itemCount);
    const endIndex = clamp(Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan, 0, itemCount);
    const topSpacer = startIndex * rowHeight;
    const bottomSpacer = (itemCount - endIndex) * rowHeight;
    return { startIndex, endIndex, topSpacer, bottomSpacer };
  }, [enabled, itemCount, overscan, rowHeight, scrollTop, viewportHeight]);
}

function lowerBound(arr: number[], target: number) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid]! < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function useVirtualVariableRows(args: {
  enabled?: boolean;
  overscan: number;
  rowHeights: number[]; // length = itemCount
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { enabled, overscan, rowHeights, scrollRef } = args;
  const itemCount = rowHeights.length;
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const prefix = React.useMemo(() => {
    const out = new Array(itemCount + 1);
    out[0] = 0;
    for (let i = 0; i < itemCount; i++) {
      out[i + 1] = out[i]! + (rowHeights[i] ?? 0);
    }
    return out;
  }, [itemCount, rowHeights]);

  return React.useMemo(() => {
    if (!enabled) {
      return { startIndex: 0, endIndex: itemCount, topSpacer: 0, bottomSpacer: 0, totalHeight: prefix[itemCount] ?? 0 };
    }

    const total = prefix[itemCount] ?? 0;
    const startPos = Math.max(0, Math.min(scrollTop, total));
    const endPos = Math.max(0, Math.min(scrollTop + viewportHeight, total));

    let startIndex = Math.max(0, lowerBound(prefix, startPos) - 1);
    let endIndex = Math.min(itemCount, lowerBound(prefix, endPos) + overscan);
    startIndex = clamp(startIndex - overscan, 0, itemCount);

    const topSpacer = prefix[startIndex] ?? 0;
    const bottomSpacer = total - (prefix[endIndex] ?? total);
    return { startIndex, endIndex, topSpacer, bottomSpacer, totalHeight: total };
  }, [enabled, itemCount, overscan, prefix, scrollTop, viewportHeight]);
}
