"use client";

import React from "react";

export interface ChartTooltipProps {
  x: number;
  y: number;
  visible: boolean;
  label?: string;
  value?: string | number;
  color?: string;
  secondaryLabel?: string;
  secondaryValue?: string | number;
  items?: { label: string; value: string | number; color?: string }[];
}

export function ChartTooltip({ x, y, visible, label, value, color, secondaryLabel, secondaryValue, items }: ChartTooltipProps) {
  if (!visible) return null;

  const itemCount = items?.length ?? 1;
  const estimatedHeight = 40 + itemCount * 24;

  return (
    <g style={{ pointerEvents: "none" }}>
      <foreignObject x={x + 12} y={y - estimatedHeight / 2} width="200" height={estimatedHeight + 20} style={{ overflow: "visible" }}>
        <div
          className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-3 py-2 text-sm"
          style={{
            minWidth: "80px",
            width: "max-content",
            animation: "tooltipFadeIn 0.15s ease-out",
          }}
        >
          {label && <div className="text-muted-foreground text-xs mb-1">{label}</div>}

          {items && items.length > 0 ? (
            <div className="space-y-1">
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
      </foreignObject>
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </g>
  );
}

export default ChartTooltip;
