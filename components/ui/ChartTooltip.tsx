"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

export interface ChartTooltipItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface ChartTooltipProps {
  x: number;
  y: number;
  visible: boolean;
  label?: string;
  value?: string | number;
  color?: string;
  secondaryLabel?: string;
  secondaryValue?: string | number;
  items?: ChartTooltipItem[];
  /** Reference element to calculate absolute position from SVG coordinates */
  containerRef?: React.RefObject<HTMLElement | SVGSVGElement | null>;
  /** Custom value formatter */
  formatter?: (value: string | number) => string;
}

export function ChartTooltip({
  x,
  y,
  visible,
  label,
  value,
  color,
  secondaryLabel,
  secondaryValue,
  items,
  containerRef,
  formatter,
}: ChartTooltipProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (visible && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tw = tooltipRef.current?.offsetWidth ?? 160;
      const th = tooltipRef.current?.offsetHeight ?? 80;

      let left = rect.left + x + 12;
      let top = rect.top + y - th / 2;

      // Auto-flip when near viewport edges
      if (left + tw > window.innerWidth - 8) {
        left = rect.left + x - tw - 12;
      }
      if (top + th > window.innerHeight - 8) {
        top = window.innerHeight - th - 8;
      }
      if (top < 8) top = 8;
      if (left < 8) left = 8;

      setPosition({ top, left });
    }
  }, [visible, x, y, containerRef]);

  if (!visible || !isMounted || !position) return null;

  const tooltipContent = (
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 99999,
        pointerEvents: "none",
        animation: "chartTooltipFadeIn 0.15s ease-out",
      }}
    >
      <div
        className={cn("bg-popover text-popover-foreground border border-border", "rounded-2xl shadow-xl px-3 py-2 text-sm", "backdrop-blur-sm")}
        style={{
          minWidth: "80px",
          width: "max-content",
          boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.3)",
        }}
      >
        {label && <div className="text-muted-foreground text-xs mb-1">{label}</div>}

        {items && items.length > 0 ? (
          <div className="flex flex-col gap-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.color && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />}
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-semibold ml-auto">{formatter ? formatter(item.value) : item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {color && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />}
              <span className="font-semibold">{formatter && value != null ? formatter(value) : value}</span>
            </div>
            {secondaryLabel && (
              <div className="text-muted-foreground text-xs mt-1">
                {secondaryLabel}: {secondaryValue}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes chartTooltipFadeIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(tooltipContent, document.body);
}

export default ChartTooltip;
