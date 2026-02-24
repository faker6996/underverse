"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Popover } from "./Popover";
import { Clock, X, Check, Sun, Moon, Sunset, Coffee } from "lucide-react";
import Input from "./Input";

type TimeFormat = "24" | "12";
type TimePickerVariant = "default" | "compact" | "inline";

export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string; // e.g. "14:05" or "02:05 PM"
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  required?: boolean;
  format?: TimeFormat; // 24 or 12
  includeSeconds?: boolean;
  minuteStep?: number; // default 1
  secondStep?: number; // default 1
  clearable?: boolean;
  /** Visual variant of the picker */
  variant?: TimePickerVariant;
  /** Match dropdown width to trigger width */
  matchTriggerWidth?: boolean;
  /** Show "Now" button */
  showNow?: boolean;
  /** Show time presets (Morning, Afternoon, Evening) */
  showPresets?: boolean;
  /** Enable manual input */
  allowManualInput?: boolean;
  /** Custom presets with labels and times */
  customPresets?: Array<{ label: string; time: string }>;
  /** Alias for minTime (e.g., "09:00") */
  min?: string;
  /** Alias for maxTime (e.g., "18:00") */
  max?: string;
  /** Minimum allowed time (e.g., "09:00") */
  minTime?: string;
  /** Maximum allowed time (e.g., "18:00") */
  maxTime?: string;
  /** Disabled times function or array */
  disabledTimes?: ((time: string) => boolean) | string[];
  /** Show validation feedback */
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
}

type Parts = { h: number; m: number; s: number; p?: "AM" | "PM" };

const pad = (n: number) => n.toString().padStart(2, "0");
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const WHEEL_ITEM_HEIGHT = {
  sm: 30,
  md: 34,
  lg: 40,
} as const;

const WHEEL_VISIBLE_ITEMS = 5;

type WheelColumnKind = "hour" | "minute" | "second";
type PickerSize = "sm" | "md" | "lg";

function WheelColumn({
  labelText,
  column,
  items,
  valueIndex,
  onSelect,
  scrollRef,
  itemHeight,
  size,
  animate,
  focused,
  setFocusedColumn,
  onKeyDown,
}: {
  labelText: string;
  column: WheelColumnKind;
  items: number[];
  valueIndex: number;
  onSelect: (value: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  itemHeight: number;
  size: PickerSize;
  animate: boolean;
  focused: boolean;
  setFocusedColumn: (col: WheelColumnKind) => void;
  onKeyDown: (e: React.KeyboardEvent, column: WheelColumnKind) => void;
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
  const inertiaVelocityRef = React.useRef(0); // px/ms
  const inertiaLastTimeRef = React.useRef(0);
  const moveSamplesRef = React.useRef<Array<{ t: number; top: number }>>([]);

  const loop = true;
  const ui = React.useMemo(() => {
    if (size === "sm") {
      return {
        columnWidth: "min-w-16 max-w-21",
        label: "text-[9px] mb-2",
        selectedText: "text-base",
        unselectedText: "text-sm",
        fadeHeight: "h-10",
      };
    }
    if (size === "lg") {
      return {
        columnWidth: "min-w-20 max-w-27.5",
        label: "text-[11px] mb-3",
        selectedText: "text-xl",
        unselectedText: "text-lg",
        fadeHeight: "h-14",
      };
    }
    return {
      columnWidth: "min-w-17.5 max-w-22.5",
      label: "text-[10px] mb-3",
      selectedText: "text-lg",
      unselectedText: "text-base",
      fadeHeight: "h-12",
    };
  }, [size]);
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
    // On first open, start from the middle copy so the list shows previous values (e.g. 58,59 above 00).
    const desiredVirtual =
      loop && lastVirtualIndexRef.current == null ? baseOffset + valueIndex : loop ? getNearestVirtualIndex(valueIndex, currentVirtual) : valueIndex;
    const nextTop = desiredVirtual * itemHeight;
    const delta = Math.abs(el.scrollTop - nextTop);
    if (delta > 1) {
      // Avoid long animated scroll on mount/open (feels like "looping twice").
      // Use smooth only for small adjustments.
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

        // Re-center to the middle copy after snapping so subsequent wheel steps stay continuous.
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

      // Re-center to the middle copy so subsequent wheel steps feel continuous.
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
    // Avoid triggering "select on scroll end" while the user is dragging.
    suppressScrollSelectUntilRef.current = Date.now() + 500;
    el.scrollTop = drag.startScrollTop - dy;

    const now = performance.now();
    const samples = moveSamplesRef.current;
    samples.push({ t: now, top: el.scrollTop });
    // Keep only the last ~120ms of samples for a stable flick velocity.
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
    const frictionPerFrame = 0.92; // per ~16ms

    const tick = () => {
      const now = performance.now();
      const last = inertiaLastTimeRef.current || now;
      const dt = Math.min(48, Math.max(0, now - last)); // clamp dt for stability
      inertiaLastTimeRef.current = now;

      let v = inertiaVelocityRef.current;
      // Apply velocity
      el.scrollTop += v * dt;

      // Keep away from edges (content repeats, so wrapping is visually seamless).
      if (loop && cycle > 0) {
        if (el.scrollTop < cycle * 0.5) el.scrollTop += cycle;
        else if (el.scrollTop > cycle * 2.5) el.scrollTop -= cycle;
      }

      // Exponential decay of velocity based on dt.
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

  return (
    <div className={cn("flex-1", ui.columnWidth)}>
      <div className={cn(ui.label, "font-bold uppercase tracking-wider text-muted-foreground/70 text-center")}>{labelText}</div>
      <div className="relative rounded-xl bg-muted/30 overflow-hidden" style={{ height }}>
        <div
          className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-linear-to-r from-primary/20 via-primary/15 to-primary/20 border border-primary/30 shadow-sm shadow-primary/10"
          style={{ height: itemHeight }}
        />
        <div className={cn("pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-muted/20 via-muted/5 to-transparent z-10", ui.fadeHeight)} />
        <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-muted/20 via-muted/5 to-transparent z-10", ui.fadeHeight)} />

        <div
          ref={scrollRef as any}
         
          className={cn(
            "h-full overflow-y-auto overscroll-contain snap-y snap-mandatory",
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
              // Make the outer two items feel "further away" to emphasize the center selection.
              const distForVisual = Math.min(dist, 2);
              const t = distForVisual / 2; // 0..1 (visible range)
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
                  {pad(n)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function parseTime(input?: string, fmt: TimeFormat = "24", includeSeconds?: boolean): Parts | null {
  if (!input) return null;
  try {
    const s = input.trim().toUpperCase();
    const ampm = s.endsWith("AM") || s.endsWith("PM");
    const clean = s.replace(/\s*(AM|PM)\s*$/, "");
    const segs = clean.split(":");
    const h = Number(segs[0]);
    const m = Number(segs[1] ?? 0);
    const sec = Number(segs[2] ?? 0);
    if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(sec)) return null;
    if (fmt === "12" || ampm) {
      const p = s.endsWith("PM") ? "PM" : "AM";
      return { h: Math.max(1, Math.min(12, h)), m: Math.max(0, Math.min(59, m)), s: Math.max(0, Math.min(59, sec)), p };
    }
    return { h: Math.max(0, Math.min(23, h)), m: Math.max(0, Math.min(59, m)), s: Math.max(0, Math.min(59, sec)) };
  } catch (error) {
    console.error("Error parsing time:", error);
    return null;
  }
}

function formatTime({ h, m, s, p }: Parts, fmt: TimeFormat, includeSeconds?: boolean): string {
  if (fmt === "12") {
    const period = p || (h >= 12 ? "PM" : "AM");
    const hr12 = h % 12 === 0 ? 12 : h % 12;
    const base = `${pad(hr12)}:${pad(m)}`;
    return includeSeconds ? `${base}:${pad(s)} ${period}` : `${base} ${period}`;
  }
  const base = `${pad(h)}:${pad(m)}`;
  return includeSeconds ? `${base}:${pad(s)}` : base;
}

// Time presets with icons
const PRESETS = {
  morning: { h: 9, m: 0, s: 0, icon: Coffee, label: "Morning", color: "from-amber-400 to-orange-400" },
  afternoon: { h: 14, m: 0, s: 0, icon: Sun, label: "Afternoon", color: "from-yellow-400 to-amber-400" },
  evening: { h: 18, m: 0, s: 0, icon: Sunset, label: "Evening", color: "from-orange-400 to-rose-400" },
  night: { h: 21, m: 0, s: 0, icon: Moon, label: "Night", color: "from-indigo-400 to-purple-400" },
};

export default function TimePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Select time",
  disabled = false,
  size = "md",
  label,
  required,
  format = "24",
  includeSeconds = false,
  minuteStep = 1,
  secondStep = 1,
  clearable = true,
  variant = "default",
  matchTriggerWidth = true,
  showNow = false,
  showPresets = false,
  allowManualInput = false,
  customPresets = [],
  min,
  max,
  minTime,
  maxTime,
  disabledTimes,
  error,
  success,
  helperText,
  animate = true,
  onOpen,
  onClose,
  className,
  ...rest
}: TimePickerProps) {
  const isControlled = value !== undefined;
  const now = new Date();
  const initial: Parts =
    parseTime(isControlled ? value : defaultValue, format, includeSeconds) ||
    (format === "12"
      ? { h: now.getHours() % 12 || 12, m: now.getMinutes(), s: now.getSeconds(), p: now.getHours() >= 12 ? "PM" : "AM" }
      : { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() });

  const [open, setOpen] = React.useState(false);
  const [parts, setParts] = React.useState<Parts>(initial);
  const [manualInput, setManualInput] = React.useState("");
  const [focusedColumn, setFocusedColumn] = React.useState<"hour" | "minute" | "second" | "period" | null>(null);

  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollRef = React.useRef<HTMLDivElement>(null);
  const secondScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isControlled) {
      const parsed = parseTime(value, format, includeSeconds);
      if (parsed) setParts(parsed);
    }
  }, [value, isControlled, format, includeSeconds]);

  // Check if time is disabled
  const isTimeDisabled = React.useCallback(
    (timeStr: string): boolean => {
      if (!disabledTimes) return false;
      if (typeof disabledTimes === "function") return disabledTimes(timeStr);
      return disabledTimes.includes(timeStr);
    },
    [disabledTimes],
  );

  const resolvedMinTime = minTime ?? min;
  const resolvedMaxTime = maxTime ?? max;

  const toSeconds = React.useCallback(
    (p: Parts): number => {
      let h = p.h;
      if (format === "12") {
        const period = p.p ?? (h >= 12 ? "PM" : "AM");
        const base = h % 12; // 12 -> 0
        h = period === "PM" ? base + 12 : base;
      }
      return h * 3600 + p.m * 60 + (includeSeconds ? p.s : 0);
    },
    [format, includeSeconds],
  );

  // Check if time is within range
  const isTimeInRange = React.useCallback(
    (timeStr: string): boolean => {
      if (!resolvedMinTime && !resolvedMaxTime) return true;
      const parsed = parseTime(timeStr, format, includeSeconds);
      if (!parsed) return true;

      const current = toSeconds(parsed);
      if (resolvedMinTime) {
        const minParsed = parseTime(resolvedMinTime, format, includeSeconds);
        if (minParsed && current < toSeconds(minParsed)) return false;
      }
      if (resolvedMaxTime) {
        const maxParsed = parseTime(resolvedMaxTime, format, includeSeconds);
        if (maxParsed && current > toSeconds(maxParsed)) return false;
      }

      return true;
    },
    [format, includeSeconds, resolvedMaxTime, resolvedMinTime, toSeconds],
  );

  const canEmit = React.useCallback(
    (next: Parts | undefined): boolean => {
      const timeStr = next ? formatTime(next, format, includeSeconds) : undefined;
      if (!timeStr) return true;
      if (!isTimeInRange(timeStr)) return false;
      if (isTimeDisabled(timeStr)) return false;
      return true;
    },
    [format, includeSeconds, isTimeDisabled, isTimeInRange],
  );

  const emit = React.useCallback(
    (next: Parts | undefined) => {
      const timeStr = next ? formatTime(next, format, includeSeconds) : undefined;
      if (!canEmit(next)) return;
      onChange?.(timeStr);
    },
    [canEmit, format, includeSeconds, onChange],
  );

  const tryUpdate = React.useCallback(
    (next: Parts) => {
      if (!canEmit(next)) return false;
      setParts(next);
      emit(next);
      return true;
    },
    [canEmit, emit],
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, column: "hour" | "minute" | "second" | "period") => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(e.key)) return;
    e.preventDefault();

    let newParts = { ...parts };

    switch (column) {
      case "hour":
        if (e.key === "ArrowUp") newParts.h = format === "24" ? (parts.h + 1) % 24 : (parts.h % 12) + 1;
        if (e.key === "ArrowDown") newParts.h = format === "24" ? (parts.h - 1 + 24) % 24 : ((parts.h - 2 + 12) % 12) + 1;
        if (e.key === "Home") newParts.h = format === "24" ? 0 : 1;
        if (e.key === "End") newParts.h = format === "24" ? 23 : 12;
        if (e.key === "PageUp") newParts.h = format === "24" ? (parts.h + 6) % 24 : (parts.h % 12) + 3;
        if (e.key === "PageDown") newParts.h = format === "24" ? (parts.h - 6 + 24) % 24 : ((parts.h - 4 + 12) % 12) + 1;
        if (e.key === "ArrowRight") setFocusedColumn("minute");
        break;
      case "minute":
        if (e.key === "ArrowUp") newParts.m = (parts.m + minuteStep) % 60;
        if (e.key === "ArrowDown") newParts.m = (parts.m - minuteStep + 60) % 60;
        if (e.key === "Home") newParts.m = 0;
        if (e.key === "End") newParts.m = 59 - (59 % minuteStep);
        if (e.key === "PageUp") newParts.m = (parts.m + minuteStep * 3) % 60;
        if (e.key === "PageDown") newParts.m = (parts.m - minuteStep * 3 + 60) % 60;
        if (e.key === "ArrowLeft") setFocusedColumn("hour");
        if (e.key === "ArrowRight") setFocusedColumn(includeSeconds ? "second" : format === "12" ? "period" : null);
        break;
      case "second":
        if (e.key === "ArrowUp") newParts.s = (parts.s + secondStep) % 60;
        if (e.key === "ArrowDown") newParts.s = (parts.s - secondStep + 60) % 60;
        if (e.key === "Home") newParts.s = 0;
        if (e.key === "End") newParts.s = 59 - (59 % secondStep);
        if (e.key === "PageUp") newParts.s = (parts.s + secondStep * 3) % 60;
        if (e.key === "PageDown") newParts.s = (parts.s - secondStep * 3 + 60) % 60;
        if (e.key === "ArrowLeft") setFocusedColumn("minute");
        if (e.key === "ArrowRight" && format === "12") setFocusedColumn("period");
        break;
      case "period":
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Home" || e.key === "End") {
          newParts.p = newParts.p === "AM" ? "PM" : "AM";
        }
        if (e.key === "ArrowLeft") setFocusedColumn(includeSeconds ? "second" : "minute");
        break;
    }

    tryUpdate(newParts);
  };

  const setNow = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    let next: Parts;
    if (format === "12") {
      next = { h: h % 12 || 12, m, s, p: h >= 12 ? "PM" : "AM" };
    } else {
      next = { h, m, s };
    }
    tryUpdate(next);
  };

  const setPreset = (preset: keyof typeof PRESETS) => {
    const { h, m, s } = PRESETS[preset];
    let next: Parts;
    if (format === "12") {
      next = { h: h % 12 || 12, m, s, p: h >= 12 ? "PM" : "AM" };
    } else {
      next = { h, m, s };
    }
    tryUpdate(next);
  };

  const handleManualInput = (input: string) => {
    setManualInput(input);
    const parsed = parseTime(input, format, includeSeconds);
    if (parsed) {
      const timeStr = formatTime(parsed, format, includeSeconds);
      if (isTimeInRange(timeStr) && !isTimeDisabled(timeStr)) {
        tryUpdate(parsed);
      }
    }
  };

  const handleCustomPreset = (time: string) => {
    const parsed = parseTime(time, format, includeSeconds);
    if (parsed) {
      tryUpdate(parsed);
    }
  };

  const hours: number[] = format === "24" ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes: number[] = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => Math.min(59, i * minuteStep));
  const seconds: number[] = Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => Math.min(59, i * secondStep));

  const panelSizeClasses: Record<PickerSize, { contentPadding: string; stackGap: string; timeText: string; inputSize: "sm" | "md"; icon: string; separatorPad: string; presetText: string; presetPadding: string; actionText: string; actionPadding: string; periodLabel: string; periodGap: string; periodButton: string }> =
    {
      sm: {
        contentPadding: "p-4",
        stackGap: "space-y-3",
        timeText: "text-xl",
        inputSize: "sm",
        icon: "w-3 h-3",
        separatorPad: "pt-6",
        presetText: "text-[11px]",
        presetPadding: "px-3 py-2",
        actionText: "text-[11px]",
        actionPadding: "px-3 py-2",
        periodLabel: "text-[9px] mb-2",
        periodGap: "gap-1.5",
        periodButton: "px-3 py-2 text-xs",
      },
      md: {
        contentPadding: "p-5",
        stackGap: "space-y-4",
        timeText: "text-2xl",
        inputSize: "sm",
        icon: "w-3.5 h-3.5",
        separatorPad: "pt-8",
        presetText: "text-xs",
        presetPadding: "px-3 py-2.5",
        actionText: "text-xs",
        actionPadding: "px-4 py-2.5",
        periodLabel: "text-[10px] mb-3",
        periodGap: "gap-2",
        periodButton: "px-4 py-3 text-sm",
      },
      lg: {
        contentPadding: "p-6",
        stackGap: "space-y-5",
        timeText: "text-3xl",
        inputSize: "md",
        icon: "w-4 h-4",
        separatorPad: "pt-9",
        presetText: "text-sm",
        presetPadding: "px-4 py-3",
        actionText: "text-sm",
        actionPadding: "px-5 py-3",
        periodLabel: "text-[11px] mb-3",
        periodGap: "gap-2",
        periodButton: "px-5 py-3.5 text-base",
      },
    };

  const sizeClasses = {
    sm: { label: "text-xs", height: "h-8", padding: "px-2.5 py-1.5", text: "text-xs", icon: "w-3.5 h-3.5" },
    md: { label: "text-sm", height: "h-10", padding: "px-3 py-2", text: "text-sm", icon: "w-4 h-4" },
    lg: { label: "text-base", height: "h-12", padding: "px-4 py-3", text: "text-base", icon: "w-5 h-5" },
  };

  const sz = sizeClasses[size];
  const panelSz = panelSizeClasses[size];

  const display = formatTime(parts, format, includeSeconds);

  const trigger =
    variant === "inline" ? null : (
      <button
        type="button"
        disabled={disabled}
        aria-label="Select time"
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
              error
                ? "text-destructive"
                : success
                  ? "text-success"
                  : open
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
            )}
          >
            <Clock className={cn(sz.icon, "transition-transform duration-300", open && "rotate-12")} />
          </div>
          <span
            className={cn(
              "truncate font-medium transition-colors duration-200",
              !value && !defaultValue && "text-muted-foreground",
              value || defaultValue ? "text-foreground" : "",
            )}
          >
            {value || defaultValue ? display : placeholder}
          </span>
        </div>
        <span className={cn("ml-2 transition-all duration-300 text-muted-foreground group-hover:text-foreground", open && "rotate-180 text-primary")}>
          <svg className={sz.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
    );

  const contentWidth = variant === "compact" ? 240 : variant === "inline" ? 320 : includeSeconds ? 340 : 300;
  const itemHeight = WHEEL_ITEM_HEIGHT[size];

  const setHourFromDisplay = (hourDisplay: number) => {
    const period = parts.p ?? (parts.h >= 12 ? "PM" : "AM");
    const nextH =
      format === "24"
        ? hourDisplay
        : (() => {
            const base = hourDisplay % 12; // 12 -> 0
            return period === "PM" ? base + 12 : base;
          })();
    const next: Parts = { ...parts, h: nextH, p: format === "12" ? period : parts.p };
    tryUpdate(next);
  };

  const timePickerContent = (
    <div className={panelSz.stackGap}>
      {/* Current Time Display */}
      <div className="flex items-center justify-center py-1">
        <span className={cn(panelSz.timeText, "font-bold tabular-nums tracking-wide text-foreground underline underline-offset-8 decoration-primary/60")}>
          {display}
        </span>
      </div>

      {/* Manual Input */}
      {allowManualInput && (
        <div className="relative">
          <Input
            placeholder={format === "12" ? "02:30 PM" : "14:30"}
            value={manualInput || display}
            onChange={(e) => handleManualInput(e.target.value)}
            size={panelSz.inputSize}
            variant="outlined"
            className="pl-9"
          />
          <Clock className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", panelSz.icon)} />
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((preset) => {
            const { icon: Icon, label, color } = PRESETS[preset];
            return (
              <button
                key={preset}
                type="button"
                className={cn(
                  "group relative font-medium rounded-xl border border-border/50 overflow-hidden",
                  panelSz.presetPadding,
                  panelSz.presetText,
                  "bg-linear-to-br from-background to-muted/30",
                  "hover:border-primary/40 hover:shadow-md transition-all duration-300",
                  animate && "hover:scale-[1.02] active:scale-[0.98]",
                )}
                onClick={() => setPreset(preset)}
                aria-label={`Set time to ${label}`}
              >
                <div
                  className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", "bg-linear-to-r", color)}
                  style={{ opacity: 0.08 }}
                />
                <div className="relative flex items-center gap-2">
                  <Icon className={cn("text-muted-foreground group-hover:text-primary transition-colors", panelSz.icon)} />
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Presets */}
      {customPresets && customPresets.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {customPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                "font-medium rounded-xl border border-border/50",
                panelSz.presetPadding,
                panelSz.presetText,
                "bg-linear-to-br from-background to-muted/30",
                "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md transition-all duration-300",
                animate && "hover:scale-[1.02] active:scale-[0.98]",
              )}
              onClick={() => handleCustomPreset(preset.time)}
              aria-label={`Set time to ${preset.label}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Time Selector */}
      <div className="flex gap-2 justify-center items-stretch">
        {/* Hours */}
        {(() => {
          const hourDisplay = format === "24" ? parts.h : parts.h % 12 || 12;
          const hourIndex = Math.max(0, hours.indexOf(hourDisplay));
          return (
            <WheelColumn
              labelText="Hour"
              column="hour"
              items={hours}
              valueIndex={hourIndex}
              onSelect={setHourFromDisplay}
              scrollRef={hourScrollRef}
              itemHeight={itemHeight}
              size={size}
              animate={animate}
              focused={focusedColumn === "hour"}
              setFocusedColumn={(col) => setFocusedColumn(col)}
              onKeyDown={(e, col) => handleKeyDown(e, col)}
            />
          );
        })()}

        {/* Separator */}
        <div className={cn("flex flex-col items-center justify-center", panelSz.separatorPad)}>
          <div className="flex flex-col gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          </div>
        </div>

        {/* Minutes */}
        {(() => {
          const minuteIndex = Math.max(0, Math.min(minutes.length - 1, Math.round(parts.m / minuteStep)));
          return (
            <WheelColumn
              labelText="Min"
              column="minute"
              items={minutes}
              valueIndex={minuteIndex}
              onSelect={(m) => {
                const next = { ...parts, m };
                tryUpdate(next);
              }}
              scrollRef={minuteScrollRef}
              itemHeight={itemHeight}
              size={size}
              animate={animate}
              focused={focusedColumn === "minute"}
              setFocusedColumn={(col) => setFocusedColumn(col)}
              onKeyDown={(e, col) => handleKeyDown(e, col)}
            />
          );
        })()}

        {/* Seconds */}
        {includeSeconds && (
          <>
            {/* Separator */}
            <div className={cn("flex flex-col items-center justify-center", panelSz.separatorPad)}>
              <div className="flex flex-col gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              </div>
            </div>
            {(() => {
              const secondIndex = Math.max(0, Math.min(seconds.length - 1, Math.round(parts.s / secondStep)));
              return (
                <WheelColumn
                  labelText="Sec"
                  column="second"
                  items={seconds}
                  valueIndex={secondIndex}
                  onSelect={(s) => {
                    const next = { ...parts, s };
                    tryUpdate(next);
                  }}
                  scrollRef={secondScrollRef}
                  itemHeight={itemHeight}
                  size={size}
                  animate={animate}
                  focused={focusedColumn === "second"}
                  setFocusedColumn={(col) => setFocusedColumn(col)}
                  onKeyDown={(e, col) => handleKeyDown(e, col)}
                />
              );
            })()}
          </>
        )}

        {/* AM/PM */}
        {format === "12" && (
          <div
            className={cn(
              "flex-1",
              size === "sm" ? "min-w-16 max-w-21" : size === "lg" ? "min-w-20 max-w-27.5" : "min-w-17.5 max-w-22.5",
            )}
          >
            <div className={cn(panelSz.periodLabel, "font-bold uppercase tracking-wider text-muted-foreground/70 text-center")}>Period</div>
            <div
              className={cn("flex flex-col p-1 rounded-xl bg-muted/30", panelSz.periodGap)}
              role="radiogroup"
              aria-label="Select AM or PM"
              tabIndex={focusedColumn === "period" ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, "period")}
              onFocus={() => setFocusedColumn("period")}
            >
              {["AM", "PM"].map((p) => {
                const isSelected = parts.p === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={cn(
                      "relative rounded-lg transition-all duration-300 font-bold overflow-hidden",
                      panelSz.periodButton,
                      "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
                      isSelected && "bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25",
                      !isSelected && "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      animate && "hover:scale-[1.02] active:scale-[0.98]",
                    )}
                    onClick={() => {
                      const pVal = p as "AM" | "PM";
                      let hour = parts.h;
                      if (pVal === "AM" && hour >= 12) hour -= 12;
                      if (pVal === "PM" && hour < 12) hour += 12;
                      const next = { ...parts, p: pVal, h: hour };
                      tryUpdate(next);
                    }}
                  >
                    {isSelected && <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent" />}
                    <span className="relative">{p}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(showNow || clearable) && (
        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
          {showNow && (
            <button
              type="button"
              className={cn(
                "flex-1 font-semibold rounded-xl",
                panelSz.actionPadding,
                panelSz.actionText,
                "bg-linear-to-r from-primary/10 to-primary/5 border border-primary/30",
                "text-primary hover:from-primary/20 hover:to-primary/10 hover:border-primary/50",
                "transition-all duration-300 flex items-center justify-center gap-2",
                animate && "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-primary/10",
              )}
              onClick={() => {
                setNow();
                if (variant === "compact") handleOpenChange(false);
              }}
              aria-label="Set current time"
            >
              <Clock className={panelSz.icon} />
              Now
            </button>
          )}
          {clearable && (
            <button
              type="button"
              className={cn(
                "flex-1 font-semibold rounded-xl",
                panelSz.actionPadding,
                panelSz.actionText,
                "bg-linear-to-r from-destructive/10 to-destructive/5 border border-destructive/30",
                "text-destructive hover:from-destructive/20 hover:to-destructive/10 hover:border-destructive/50",
                "transition-all duration-300 flex items-center justify-center gap-2",
                animate && "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-destructive/10",
              )}
              onClick={() => {
                setParts(initial);
                emit(undefined);
                handleOpenChange(false);
              }}
              aria-label="Clear selected time"
            >
              <X className={panelSz.icon} />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Inline variant renders content directly without popover
  if (variant === "inline") {
    return (
      <div className="w-fit max-w-full" {...rest}>
        {label && (
          <div className="flex items-center justify-between mb-3">
            <label className={cn(sz.label, "font-semibold", disabled ? "text-muted-foreground" : "text-foreground")}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          </div>
        )}
        <div
          className={cn(panelSz.contentPadding, "rounded-2xl md:rounded-3xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-xl", className)}
        >
          {timePickerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" {...rest}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            className={cn(
              sz.label,
              "font-semibold",
              disabled ? "text-muted-foreground" : "text-foreground",
              "cursor-pointer transition-colors hover:text-primary",
            )}
            onClick={() => !disabled && handleOpenChange(true)}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}

      <Popover
        trigger={trigger!}
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
        matchTriggerWidth={matchTriggerWidth}
        contentWidth={matchTriggerWidth ? undefined : contentWidth}
        contentClassName={cn(
          panelSz.contentPadding,
          "rounded-2xl md:rounded-3xl border bg-popover/98 backdrop-blur-md shadow-2xl",
          error && "border-destructive/40",
          success && "border-success/40",
          !error && !success && "border-border/60",
          animate && "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
        )}
      >
        {timePickerContent}
      </Popover>

      {/* Validation and Helper Text */}
      {(error || success || helperText) && (
        <div className={cn("mt-2 flex items-start gap-2", sz.label)}>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
              <X className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          {success && !error && (
            <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">Valid time selected</span>
            </div>
          )}
          {helperText && !error && !success && <span className="text-muted-foreground/80 italic">{helperText}</span>}
        </div>
      )}
    </div>
  );
}
