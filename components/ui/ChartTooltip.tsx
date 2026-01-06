"use client";

import React, { useEffect, useState } from "react";
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
}

export function ChartTooltip({ x, y, visible, label, value, color, secondaryLabel, secondaryValue, items, containerRef }: ChartTooltipProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (visible && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + y,
        left: rect.left + x,
      });
    }
  }, [visible, x, y, containerRef]);

  if (!visible || !isMounted || !position) return null;

  const tooltipContent = (
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left + 12,
        zIndex: 99999,
        pointerEvents: "none",
        animation: "chartTooltipFadeIn 0.15s ease-out",
      }}
    >
      <div
        className={cn("bg-popover text-popover-foreground border border-border", "rounded-lg shadow-xl px-3 py-2 text-sm", "backdrop-blur-sm")}
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
                <span className="font-semibold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {color && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />}
              <span className="font-semibold">{value}</span>
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
