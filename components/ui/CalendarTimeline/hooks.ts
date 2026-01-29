import * as React from "react";
import { clamp } from "./layout";

export function useHorizontalScrollSync(args: {
  bodyRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { bodyRef, headerRef } = args;

  React.useEffect(() => {
    const body = bodyRef.current;
    const header = headerRef.current;
    if (!body || !header) return;

    let raf = 0;
    let syncing = false;
    const syncHeader = () => {
      if (syncing) return;
      syncing = true;
      header.scrollLeft = body.scrollLeft;
      syncing = false;
    };
    const syncBody = () => {
      if (syncing) return;
      syncing = true;
      body.scrollLeft = header.scrollLeft;
      syncing = false;
    };

    const onBodyScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncHeader);
    };
    const onHeaderScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncBody);
    };

    body.addEventListener("scroll", onBodyScroll, { passive: true });
    header.addEventListener("scroll", onHeaderScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      body.removeEventListener("scroll", onBodyScroll);
      header.removeEventListener("scroll", onHeaderScroll);
    };
  }, [bodyRef, headerRef]);
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

