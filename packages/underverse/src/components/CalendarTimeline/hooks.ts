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
    let pendingSource: "body" | "header" | "left" | null = null;

    const flush = () => {
      raf = 0;
      const source = pendingSource;
      pendingSource = null;
      if (!source) return;

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
    };

    const scheduleSync = (source: "body" | "header" | "left") => {
      pendingSource = source;
      if (raf) return;
      raf = requestAnimationFrame(flush);
    };

    const onBodyScroll = () => scheduleSync("body");
    const onHeaderScroll = () => scheduleSync("header");
    const onLeftScroll = () => scheduleSync("left");

    scheduleSync("body");
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
    if (!enabled) {
      setViewportHeight(0);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, scrollRef]);

  React.useEffect(() => {
    if (!enabled) {
      setScrollTop(0);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let nextTop = el.scrollTop;
    const commit = () => {
      raf = 0;
      setScrollTop(nextTop);
    };
    const onScroll = () => {
      nextTop = el.scrollTop;
      if (raf) return;
      raf = requestAnimationFrame(commit);
    };
    setScrollTop(nextTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [enabled, scrollRef]);

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
    if (!enabled) {
      setViewportHeight(0);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, scrollRef]);

  React.useEffect(() => {
    if (!enabled) {
      setScrollTop(0);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let nextTop = el.scrollTop;
    const commit = () => {
      raf = 0;
      setScrollTop(nextTop);
    };
    const onScroll = () => {
      nextTop = el.scrollTop;
      if (raf) return;
      raf = requestAnimationFrame(commit);
    };
    setScrollTop(nextTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [enabled, scrollRef]);

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

export function useClientWidth<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}
