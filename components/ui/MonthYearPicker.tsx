"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Popover } from "./Popover";
import { Calendar, X, Check, ChevronDown } from "lucide-react";

type MonthYearPickerVariant = "default" | "compact" | "inline";
type PickerSize = "sm" | "md" | "lg";

export interface MonthYearPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  /** Current value as Date or {month, year} */
  value?: Date | { month: number; year: number };
  /** Default value */
  defaultValue?: Date | { month: number; year: number };
  /** Change handler */
  onChange?: (value: { month: number; year: number; date: Date } | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: PickerSize;
  /** Label text */
  label?: string;
  /** Required field */
  required?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Visual variant */
  variant?: MonthYearPickerVariant;
  /** Match dropdown width to trigger */
  matchTriggerWidth?: boolean;
  /** Custom month names */
  monthNames?: string[];
  /** Custom short month names for display */
  shortMonthNames?: string[];
  /** Minimum year in range */
  minYear?: number;
  /** Maximum year in range */
  maxYear?: number;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Show validation error */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Helper text */
  helperText?: string;
  /** Enable smooth animations */
  animate?: boolean;
  /** Callback when popover opens */
  onOpen?: () => void;
  /** Callback when popover closes */
  onClose?: () => void;
  /** Show "This Month" button */
  showThisMonth?: boolean;
  /** Column labels */
  columnLabels?: { month?: string; year?: string };
}

const DEFAULT_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEFAULT_SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WHEEL_ITEM_HEIGHT = {
  sm: 30,
  md: 34,
  lg: 40,
} as const;

const WHEEL_VISIBLE_ITEMS = 5;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

type WheelColumnKind = "month" | "year";

function WheelColumn({
  labelText,
  column,
  items,
  labels,
  valueIndex,
  onSelect,
  scrollRef,
  itemHeight,
  size,
  animate,
  focused,
  setFocusedColumn,
  onKeyDown,
  loop = false,
}: {
  labelText: string;
  column: WheelColumnKind;
  items: number[];
  labels?: string[];
  valueIndex: number;
  onSelect: (value: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  itemHeight: number;
  size: PickerSize;
  animate: boolean;
  focused: boolean;
  setFocusedColumn: (col: WheelColumnKind) => void;
  onKeyDown: (e: React.KeyboardEvent, column: WheelColumnKind) => void;
  loop?: boolean;
}) {
  const height = itemHeight * WHEEL_VISIBLE_ITEMS;
  const paddingY = (height - itemHeight) / 2;
  const rafRef = React.useRef(0);
  const lastVirtualIndexRef = React.useRef<number | null>(null);
  const wheelDeltaRef = React.useRef(0);
  const scrollEndTimeoutRef = React.useRef<number | null>(null);
  const suppressScrollSelectUntilRef = React.useRef(0);
  const suppressItemClickUntilRef = React.useRef(0);
  const dragRef = React.useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
    moved: boolean;
  } | null>(null);
  const draggingRef = React.useRef(false);
  const inertialRef = React.useRef(false);
  const inertiaRafRef = React.useRef<number | null>(null);
  const inertiaVelocityRef = React.useRef(0);
  const inertiaLastTimeRef = React.useRef(0);
  const moveSamplesRef = React.useRef<Array<{ t: number; top: number }>>([]);

  const ui = React.useMemo(() => {
    if (size === "sm") {
      return {
        columnWidth: column === "month" ? "min-w-24 max-w-32" : "min-w-16 max-w-20",
        label: "text-[9px] mb-2",
        selectedText: "text-base",
        unselectedText: "text-sm",
        fadeHeight: "h-10",
      };
    }
    if (size === "lg") {
      return {
        columnWidth: column === "month" ? "min-w-32 max-w-40" : "min-w-20 max-w-24",
        label: "text-[11px] mb-3",
        selectedText: "text-xl",
        unselectedText: "text-lg",
        fadeHeight: "h-14",
      };
    }
    return {
      columnWidth: column === "month" ? "min-w-28 max-w-36" : "min-w-18 max-w-22",
      label: "text-[10px] mb-3",
      selectedText: "text-lg",
      unselectedText: "text-base",
      fadeHeight: "h-12",
    };
  }, [size, column]);

  const baseOffset = React.useMemo(() => (loop ? items.length : 0), [items.length, loop]);
  const extendedItems = React.useMemo(() => (loop ? [...items, ...items, ...items] : items), [items, loop]);

  const getNearestVirtualIndex = React.useCallback(
    (realIndex: number, fromVirtual: number) => {
      const len = items.length;
      if (len <= 0) return 0;
      if (!loop) return clamp(realIndex, 0, Math.max(0, len - 1));
      const candidates = [realIndex, realIndex + len, realIndex + 2 * len];
      let best = candidates[0]!;
      let bestDist = Math.abs(best - fromVirtual);
      for (const c of candidates) {
        const dist = Math.abs(c - fromVirtual);
        if (dist < bestDist) {
          best = c;
          bestDist = dist;
        }
      }
      return best;
    },
    [items.length, loop],
  );

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxVirtual = Math.max(0, extendedItems.length - 1);
    const currentVirtual = clamp(Math.round(el.scrollTop / itemHeight), 0, maxVirtual);
    const desiredVirtual =
      loop && lastVirtualIndexRef.current == null ? baseOffset + valueIndex : loop ? getNearestVirtualIndex(valueIndex, currentVirtual) : valueIndex;
    const nextTop = desiredVirtual * itemHeight;
    const delta = Math.abs(el.scrollTop - nextTop);
    if (delta > 1) {
      if (animate && delta <= itemHeight * 1.5) {
        el.scrollTo({ top: nextTop, behavior: "smooth" });
      } else {
        el.scrollTop = nextTop;
      }
    }
    lastVirtualIndexRef.current = desiredVirtual;
    return () => {
      if (scrollEndTimeoutRef.current != null) {
        window.clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = null;
      }
      if (inertiaRafRef.current != null) {
        cancelAnimationFrame(inertiaRafRef.current);
        inertiaRafRef.current = null;
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, baseOffset, extendedItems.length, getNearestVirtualIndex, itemHeight, loop, scrollRef, valueIndex]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const lastWheelSignRef = { current: 0 };
    const lastStepAtRef = { current: 0 };
    const lastStepSignRef = { current: 0 };

    const onWheel = (event: WheelEvent) => {
      if (!el.contains(event.target as Node)) return;
      if (event.ctrlKey) return;
      event.preventDefault();
      event.stopPropagation();
      setFocusedColumn(column);
      if (document.activeElement !== el) el.focus({ preventScroll: true });

      const sign = Math.sign(event.deltaY);
      if (sign === 0) return;
      if (lastWheelSignRef.current !== 0 && sign !== lastWheelSignRef.current) {
        if (Date.now() - lastStepAtRef.current < 180 && lastStepSignRef.current !== 0) return;
        wheelDeltaRef.current = 0;
      }
      lastWheelSignRef.current = sign;

      let step = 0;
      if (event.deltaMode !== 0 || Math.abs(event.deltaY) >= 40) {
        step = sign;
        wheelDeltaRef.current = 0;
      } else {
        wheelDeltaRef.current += event.deltaY;
        const threshold = Math.min(12, Math.max(4, Math.round(itemHeight * 0.12)));
        if (Math.abs(wheelDeltaRef.current) < threshold) return;
        step = Math.sign(wheelDeltaRef.current);
        wheelDeltaRef.current = 0;
      }

      if (items.length <= 0) return;
      const fromVirtual = lastVirtualIndexRef.current ?? (loop ? baseOffset + valueIndex : valueIndex);
      let nextVirtual = fromVirtual + step;
      if (!loop) {
        nextVirtual = clamp(nextVirtual, 0, Math.max(0, items.length - 1));
      } else {
        const len = items.length;
        const maxVirtual = Math.max(0, len * 3 - 1);
        if (nextVirtual < 0) nextVirtual += len;
        if (nextVirtual > maxVirtual) nextVirtual -= len;
      }
      if (nextVirtual === fromVirtual) return;

      lastStepAtRef.current = Date.now();
      lastStepSignRef.current = step;
      lastVirtualIndexRef.current = nextVirtual;
      suppressScrollSelectUntilRef.current = Date.now() + 350;
      el.scrollTo({ top: nextVirtual * itemHeight, behavior: animate ? "smooth" : "auto" });
      const realIndex = ((nextVirtual % items.length) + items.length) % items.length;
      onSelect(items[realIndex]!);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [animate, baseOffset, column, itemHeight, items, loop, onSelect, scrollRef, setFocusedColumn, valueIndex]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (Date.now() < suppressScrollSelectUntilRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      if (scrollEndTimeoutRef.current != null) {
        window.clearTimeout(scrollEndTimeoutRef.current);
      }
      scrollEndTimeoutRef.current = window.setTimeout(() => {
        if (items.length <= 0) return;
        const len = items.length;
        const maxVirtual = Math.max(0, extendedItems.length - 1);
        const idxVirtual = clamp(Math.round(el.scrollTop / itemHeight), 0, maxVirtual);
        const realIndex = ((idxVirtual % len) + len) % len;
        const snappedVirtual = loop ? getNearestVirtualIndex(realIndex, idxVirtual) : realIndex;
        if (lastVirtualIndexRef.current !== snappedVirtual) lastVirtualIndexRef.current = snappedVirtual;
        suppressScrollSelectUntilRef.current = Date.now() + 350;
        el.scrollTo({ top: snappedVirtual * itemHeight, behavior: animate ? "smooth" : "auto" });
        onSelect(items[realIndex]!);

        if (loop) {
          const min = len;
          const max = len * 2 - 1;
          let centered = snappedVirtual;
          if (centered < min) centered += len;
          if (centered > max) centered -= len;
          if (centered !== snappedVirtual) {
            lastVirtualIndexRef.current = centered;
            el.scrollTop = centered * itemHeight;
          }
        }
      }, 120);
    });
  };

  const currentVirtual = React.useMemo(() => {
    if (!loop || items.length <= 0) return valueIndex;
    const fallback = baseOffset + valueIndex;
    const from = lastVirtualIndexRef.current ?? fallback;
    return getNearestVirtualIndex(valueIndex, from);
  }, [baseOffset, getNearestVirtualIndex, items.length, loop, valueIndex]);

  const commitFromScrollTop = React.useCallback(
    (behavior: ScrollBehavior) => {
      const el = scrollRef.current;
      if (!el) return;
      if (items.length <= 0) return;
      const len = items.length;
      const maxVirtual = Math.max(0, extendedItems.length - 1);
      const idxVirtual = clamp(Math.round(el.scrollTop / itemHeight), 0, maxVirtual);
      const realIndex = ((idxVirtual % len) + len) % len;
      const snappedVirtual = loop ? getNearestVirtualIndex(realIndex, idxVirtual) : realIndex;
      lastVirtualIndexRef.current = snappedVirtual;
      suppressScrollSelectUntilRef.current = Date.now() + 350;
      if (behavior === "auto") el.scrollTop = snappedVirtual * itemHeight;
      else el.scrollTo({ top: snappedVirtual * itemHeight, behavior });
      onSelect(items[realIndex]!);

      if (loop) {
        const min = len;
        const max = len * 2 - 1;
        let centered = snappedVirtual;
        if (centered < min) centered += len;
        if (centered > max) centered -= len;
        if (centered !== snappedVirtual) {
          lastVirtualIndexRef.current = centered;
          el.scrollTop = centered * itemHeight;
        }
      }
    },
    [extendedItems.length, getNearestVirtualIndex, itemHeight, items, loop, onSelect, scrollRef],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    setFocusedColumn(column);
    draggingRef.current = true;
    inertialRef.current = false;
    if (inertiaRafRef.current != null) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    if (scrollEndTimeoutRef.current != null) {
      window.clearTimeout(scrollEndTimeoutRef.current);
      scrollEndTimeoutRef.current = null;
    }
    dragRef.current = { pointerId: e.pointerId, startY: e.clientY, startScrollTop: el.scrollTop, moved: false };
    moveSamplesRef.current = [{ t: performance.now(), top: el.scrollTop }];
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!el || !drag) return;
    if (e.pointerId !== drag.pointerId) return;
    e.preventDefault();
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.abs(dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      suppressItemClickUntilRef.current = Date.now() + 400;
    }
    suppressScrollSelectUntilRef.current = Date.now() + 500;
    el.scrollTop = drag.startScrollTop - dy;

    const now = performance.now();
    const samples = moveSamplesRef.current;
    samples.push({ t: now, top: el.scrollTop });
    while (samples.length > 6 && samples[0] && now - samples[0].t > 120) samples.shift();
    while (samples.length > 8) samples.shift();
    if (samples.length >= 2) {
      const oldest = samples[0]!;
      const dt = now - oldest.t;
      if (dt > 0) inertiaVelocityRef.current = (el.scrollTop - oldest.top) / dt;
    }
  };

  const startInertia = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (items.length <= 0) return;

    inertialRef.current = true;
    suppressItemClickUntilRef.current = Date.now() + 600;
    inertiaLastTimeRef.current = performance.now();

    const len = items.length;
    const cycle = len * itemHeight;
    const frictionPerFrame = 0.92;

    const tick = () => {
      const now = performance.now();
      const last = inertiaLastTimeRef.current || now;
      const dt = Math.min(48, Math.max(0, now - last));
      inertiaLastTimeRef.current = now;

      let v = inertiaVelocityRef.current;
      el.scrollTop += v * dt;

      if (loop && cycle > 0) {
        if (el.scrollTop < cycle * 0.5) el.scrollTop += cycle;
        else if (el.scrollTop > cycle * 2.5) el.scrollTop -= cycle;
      }

      const decay = Math.pow(frictionPerFrame, dt / 16);
      v *= decay;
      inertiaVelocityRef.current = v;

      if (Math.abs(v) < 0.03) {
        inertialRef.current = false;
        inertiaRafRef.current = null;
        commitFromScrollTop("smooth");
        return;
      }

      inertiaRafRef.current = requestAnimationFrame(tick);
    };

    inertiaRafRef.current = requestAnimationFrame(tick);
  }, [commitFromScrollTop, itemHeight, items.length, loop, scrollRef]);

  const endDrag = (pointerId: number) => {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!el || !drag) return;
    if (pointerId !== drag.pointerId) return;
    dragRef.current = null;
    draggingRef.current = false;
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      // ignore
    }
    const v = inertiaVelocityRef.current;
    const shouldFlick = drag.moved && Math.abs(v) >= 0.35;
    if (shouldFlick) {
      startInertia();
    } else {
      inertialRef.current = false;
      commitFromScrollTop("smooth");
    }
  };

  const getLabel = (value: number, index: number) => {
    if (labels) {
      const labelIndex = column === "month" ? value : items.indexOf(value);
      return labels[labelIndex] ?? String(value);
    }
    return String(value);
  };

  return (
    <div className={cn("flex-1", ui.columnWidth)}>
      <div className={cn(ui.label, "font-bold uppercase tracking-wider text-muted-foreground/70 text-center")}>{labelText}</div>
      <div className="relative rounded-xl bg-muted/30 overflow-hidden" style={{ height }}>
        <div
          className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-linear-to-r from-primary/20 via-primary/15 to-primary/20 border border-primary/30 shadow-sm shadow-primary/10"
          style={{ height: itemHeight }}
        />
        <div
          className={cn("pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-muted/20 via-muted/5 to-transparent z-10", ui.fadeHeight)}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-muted/20 via-muted/5 to-transparent z-10",
            ui.fadeHeight,
          )}
        />

        <div
          ref={scrollRef as React.RefObject<HTMLDivElement>}
          className={cn(
            "h-full overflow-y-auto overscroll-contain snap-y snap-mandatory",
            "scrollbar-none",
            "select-none cursor-grab active:cursor-grabbing",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl",
          )}
          style={{ paddingTop: paddingY, paddingBottom: paddingY }}
          role="listbox"
          aria-label={`Select ${labelText.toLowerCase()}`}
          tabIndex={focused ? 0 : -1}
          onKeyDown={(e) => onKeyDown(e, column)}
          onFocus={() => setFocusedColumn(column)}
          onScroll={() => {
            if (draggingRef.current) return;
            if (inertialRef.current) return;
            handleScroll();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e.pointerId)}
          onPointerCancel={(e) => endDrag(e.pointerId)}
        >
          <div>
            {extendedItems.map((n, index) => {
              const dist = Math.abs(index - currentVirtual);
              const distForVisual = Math.min(dist, 2);
              const t = distForVisual / 2;
              const ease = t * t;
              const scale = 1 - ease * 0.18;
              const opacity = 1 - ease * 0.55;
              const isSelected = index === currentVirtual;

              return (
                <button
                  key={`${column}_${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "w-full snap-center flex items-center justify-center rounded-lg transition-all duration-200 font-bold tabular-nums",
                    isSelected ? cn("text-primary", ui.selectedText) : cn("text-muted-foreground hover:text-foreground/70", ui.unselectedText),
                  )}
                  style={{
                    height: itemHeight,
                    transform: `scale(${scale})`,
                    opacity,
                  }}
                  onClick={() => {
                    if (Date.now() < suppressItemClickUntilRef.current) return;
                    const el = scrollRef.current;
                    if (!el) return;
                    suppressScrollSelectUntilRef.current = Date.now() + 350;
                    lastVirtualIndexRef.current = index;
                    el.scrollTo({ top: index * itemHeight, behavior: animate ? "smooth" : "auto" });
                    const realIndex = ((index % items.length) + items.length) % items.length;
                    onSelect(items[realIndex]!);
                  }}
                >
                  {getLabel(n, index)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonthYearPicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Select month/year",
  disabled = false,
  size = "md",
  label,
  required,
  clearable = true,
  variant = "default",
  matchTriggerWidth = false,
  monthNames = DEFAULT_MONTH_NAMES,
  shortMonthNames = DEFAULT_SHORT_MONTH_NAMES,
  minYear,
  maxYear,
  minDate,
  maxDate,
  error,
  success,
  helperText,
  animate = true,
  onOpen,
  onClose,
  showThisMonth = true,
  columnLabels = { month: "Month", year: "Year" },
  className,
  ...rest
}: MonthYearPickerProps) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const resolvedMinYear = minYear ?? minDate?.getFullYear() ?? currentYear - 50;
  const resolvedMaxYear = maxYear ?? maxDate?.getFullYear() ?? currentYear + 10;

  const parseValue = (v: Date | { month: number; year: number } | undefined): { month: number; year: number } | null => {
    if (!v) return null;
    if (v instanceof Date) {
      return { month: v.getMonth(), year: v.getFullYear() };
    }
    return v;
  };

  const isControlled = value !== undefined;
  const initial = parseValue(isControlled ? value : defaultValue) ?? { month: now.getMonth(), year: currentYear };

  const [open, setOpen] = React.useState(false);
  const [parts, setParts] = React.useState(initial);
  const [focusedColumn, setFocusedColumn] = React.useState<WheelColumnKind | null>(null);

  const monthScrollRef = React.useRef<HTMLDivElement>(null);
  const yearScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isControlled) {
      const parsed = parseValue(value);
      if (parsed) setParts(parsed);
    }
  }, [value, isControlled]);

  const years = React.useMemo(() => {
    return Array.from({ length: resolvedMaxYear - resolvedMinYear + 1 }, (_, i) => resolvedMinYear + i);
  }, [resolvedMinYear, resolvedMaxYear]);

  const months = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const isDateInRange = React.useCallback(
    (month: number, year: number): boolean => {
      if (minDate) {
        const minMonth = minDate.getMonth();
        const minYear = minDate.getFullYear();
        if (year < minYear || (year === minYear && month < minMonth)) return false;
      }
      if (maxDate) {
        const maxMonth = maxDate.getMonth();
        const maxYear = maxDate.getFullYear();
        if (year > maxYear || (year === maxYear && month > maxMonth)) return false;
      }
      return true;
    },
    [minDate, maxDate],
  );

  const emit = React.useCallback(
    (next: { month: number; year: number } | undefined) => {
      if (!next) {
        onChange?.(undefined);
        return;
      }
      if (!isDateInRange(next.month, next.year)) return;
      const date = new Date(next.year, next.month, 1);
      onChange?.({ ...next, date });
    },
    [isDateInRange, onChange],
  );

  const tryUpdate = React.useCallback(
    (next: { month: number; year: number }) => {
      if (!isDateInRange(next.month, next.year)) return false;
      setParts(next);
      emit(next);
      return true;
    },
    [emit, isDateInRange],
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      onOpen?.();
    } else {
      onClose?.();
      setFocusedColumn(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, column: WheelColumnKind) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(e.key)) return;
    e.preventDefault();

    let newParts = { ...parts };

    switch (column) {
      case "month":
        if (e.key === "ArrowUp") newParts.month = (parts.month - 1 + 12) % 12;
        if (e.key === "ArrowDown") newParts.month = (parts.month + 1) % 12;
        if (e.key === "Home") newParts.month = 0;
        if (e.key === "End") newParts.month = 11;
        if (e.key === "PageUp") newParts.month = (parts.month - 3 + 12) % 12;
        if (e.key === "PageDown") newParts.month = (parts.month + 3) % 12;
        if (e.key === "ArrowRight") setFocusedColumn("year");
        break;
      case "year":
        if (e.key === "ArrowUp") newParts.year = Math.max(resolvedMinYear, parts.year - 1);
        if (e.key === "ArrowDown") newParts.year = Math.min(resolvedMaxYear, parts.year + 1);
        if (e.key === "Home") newParts.year = resolvedMinYear;
        if (e.key === "End") newParts.year = resolvedMaxYear;
        if (e.key === "PageUp") newParts.year = Math.max(resolvedMinYear, parts.year - 5);
        if (e.key === "PageDown") newParts.year = Math.min(resolvedMaxYear, parts.year + 5);
        if (e.key === "ArrowLeft") setFocusedColumn("month");
        break;
    }

    tryUpdate(newParts);
  };

  const setThisMonth = () => {
    const now = new Date();
    tryUpdate({ month: now.getMonth(), year: now.getFullYear() });
  };

  const handleClear = () => {
    emit(undefined);
    setOpen(false);
  };

  const sizeClasses = {
    sm: { label: "text-xs", height: "h-8", padding: "px-2.5 py-1.5", text: "text-xs", icon: "w-3.5 h-3.5" },
    md: { label: "text-sm", height: "h-10", padding: "px-3 py-2", text: "text-sm", icon: "w-4 h-4" },
    lg: { label: "text-base", height: "h-12", padding: "px-4 py-3", text: "text-base", icon: "w-5 h-5" },
  };

  const panelSizeClasses = {
    sm: { contentPadding: "p-4", stackGap: "space-y-3", displayText: "text-lg", actionText: "text-[11px]", actionPadding: "px-3 py-2" },
    md: { contentPadding: "p-5", stackGap: "space-y-4", displayText: "text-xl", actionText: "text-xs", actionPadding: "px-4 py-2.5" },
    lg: { contentPadding: "p-6", stackGap: "space-y-5", displayText: "text-2xl", actionText: "text-sm", actionPadding: "px-5 py-3" },
  };

  const sz = sizeClasses[size];
  const panelSz = panelSizeClasses[size];
  const itemHeight = WHEEL_ITEM_HEIGHT[size];

  const monthIndex = parts.month;
  const yearIndex = years.indexOf(parts.year);

  const display = `${shortMonthNames[parts.month]} ${parts.year}`;
  const hasValue = isControlled ? !!value : !!defaultValue || parts !== initial;

  const trigger =
    variant === "inline" ? null : (
      <button
        type="button"
        disabled={disabled}
        aria-label="Select month and year"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "group flex w-full items-center justify-between rounded-full border bg-background/80 backdrop-blur-sm",
          sz.height,
          sz.padding,
          sz.text,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-300 ease-out",
          error && "border-destructive/60 focus-visible:ring-destructive/50 bg-destructive/5",
          success && "border-success/60 focus-visible:ring-success/50 bg-success/5",
          !error && !success && "border-border/60 hover:border-primary/40 hover:bg-accent/10",
          animate && !disabled && "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
          open && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex items-center justify-center transition-colors duration-300",
              error ? "text-destructive" : success ? "text-success" : open ? "text-primary" : "text-muted-foreground group-hover:text-primary",
            )}
          >
            <Calendar className={cn(sz.icon, "transition-transform duration-300", open && "rotate-12")} />
          </div>
          <span
            className={cn("truncate font-medium transition-colors duration-200", !hasValue && "text-muted-foreground", hasValue && "text-foreground")}
          >
            {hasValue ? display : placeholder}
          </span>
        </div>
        <span className={cn("ml-2 transition-all duration-300 text-muted-foreground group-hover:text-foreground", open && "rotate-180 text-primary")}>
          <ChevronDown className={sz.icon} />
        </span>
      </button>
    );

  const contentWidth = variant === "compact" ? 280 : 340;

  const pickerContent = (
    <div className={panelSz.stackGap}>
      {/* Current Display */}
      <div className="flex items-center justify-center py-1">
        <span
          className={cn(
            panelSz.displayText,
            "font-bold tabular-nums tracking-wide text-foreground underline underline-offset-8 decoration-primary/60",
          )}
        >
          {monthNames[parts.month]} {parts.year}
        </span>
      </div>

      {/* Wheel Columns */}
      <div className="flex gap-3">
        <WheelColumn
          labelText={columnLabels.month ?? "Month"}
          column="month"
          items={months}
          labels={monthNames}
          valueIndex={monthIndex}
          onSelect={(m) => tryUpdate({ ...parts, month: m })}
          scrollRef={monthScrollRef}
          itemHeight={itemHeight}
          size={size}
          animate={animate}
          focused={focusedColumn === "month"}
          setFocusedColumn={setFocusedColumn}
          onKeyDown={handleKeyDown}
          loop={true}
        />
        <WheelColumn
          labelText={columnLabels.year ?? "Year"}
          column="year"
          items={years}
          valueIndex={yearIndex >= 0 ? yearIndex : 0}
          onSelect={(y) => tryUpdate({ ...parts, year: y })}
          scrollRef={yearScrollRef}
          itemHeight={itemHeight}
          size={size}
          animate={animate}
          focused={focusedColumn === "year"}
          setFocusedColumn={setFocusedColumn}
          onKeyDown={handleKeyDown}
          loop={false}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        {showThisMonth && (
          <button
            type="button"
            onClick={setThisMonth}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-full",
              "bg-linear-to-r from-primary/10 via-primary/5 to-primary/10",
              "border border-primary/30 text-primary",
              "hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 hover:border-primary/50",
              "transition-all duration-300",
              panelSz.actionText,
              panelSz.actionPadding,
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">This Month</span>
          </button>
        )}
        {clearable && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full",
              "bg-muted/50 text-muted-foreground border border-border/40",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              "transition-all duration-300",
              panelSz.actionText,
              panelSz.actionPadding,
            )}
          >
            <X className="w-3.5 h-3.5" />
            <span className="font-medium">Clear</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-full",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "transition-all duration-300 shadow-sm shadow-primary/20",
            panelSz.actionText,
            panelSz.actionPadding,
          )}
        >
          <Check className="w-3.5 h-3.5" />
          <span className="font-medium">Done</span>
        </button>
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("w-full", className)} {...rest}>
        {label && (
          <label className={cn(sz.label, "block mb-1.5 font-medium text-foreground/80")}>
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <div className={cn(panelSz.contentPadding, "rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm")}>{pickerContent}</div>
        {(helperText || error) && (
          <div className={cn("mt-1.5 text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error || helperText}</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...rest}>
      {label && (
        <label className={cn(sz.label, "block mb-1.5 font-medium text-foreground/80")}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <Popover
        trigger={trigger!}
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom"
        contentWidth={contentWidth}
        matchTriggerWidth={matchTriggerWidth}
        disabled={disabled}
        contentClassName={cn(panelSz.contentPadding, "rounded-2xl")}
      >
        {pickerContent}
      </Popover>
      {(helperText || error) && (
        <div className={cn("mt-1.5 text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error || helperText}</div>
      )}
    </div>
  );
}

export { MonthYearPicker };
