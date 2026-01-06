"use client";

import React, { useMemo, useState, useRef } from "react";
import { ChartTooltip } from "./ChartTooltip";

export interface PieChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  size?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  startAngle?: number;
  className?: string;
}

export function PieChart({
  data,
  size = 200,
  donut = false,
  donutWidth = 40,
  showLabels = true,
  showLegend = true,
  showPercentage = true,
  animated = true,
  startAngle = -90,
  className = "",
}: PieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const center = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = donut ? radius - donutWidth : 0;

  const { segments, total } = useMemo(() => {
    if (!data.length) return { segments: [], total: 0 };

    const sum = data.reduce((acc, d) => acc + d.value, 0);
    let currentAngle = startAngle;

    const segs = data.map((d, i) => {
      const percentage = d.value / sum;
      const angle = percentage * 360;
      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = ((currentAngle + angle) * Math.PI) / 180;
      const midRad = ((currentAngle + angle / 2) * Math.PI) / 180;

      // Large arc flag
      const largeArc = angle > 180 ? 1 : 0;

      // Start and end points for outer arc
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      // Start and end points for inner arc (donut)
      const x3 = center + innerRadius * Math.cos(endRad);
      const y3 = center + innerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(startRad);
      const y4 = center + innerRadius * Math.sin(startRad);

      // Label position
      const labelRadius = radius + 20;
      const labelX = center + labelRadius * Math.cos(midRad);
      const labelY = center + labelRadius * Math.sin(midRad);

      let path: string;
      if (donut) {
        path = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          `L ${x3} ${y3}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
          "Z",
        ].join(" ");
      } else {
        path = [`M ${center} ${center}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, "Z"].join(" ");
      }

      currentAngle += angle;

      return {
        path,
        ...d,
        percentage,
        labelX,
        labelY,
        midAngle: currentAngle - angle / 2,
      };
    });

    return { segments: segs, total: sum };
  }, [data, center, radius, innerRadius, donut, startAngle]);

  const [hoveredSegment, setHoveredSegment] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    percentage: number;
    color: string;
  } | null>(null);

  return (
    <div ref={containerRef} className={`relative flex items-center gap-6 ${className}`}>
      <svg width={size + 40} height={size + 40} className="overflow-visible" style={{ fontFamily: "inherit" }}>
        <g transform={`translate(20, 20)`}>
          {segments.map((seg, i) => (
            <g
              key={i}
              onMouseEnter={() =>
                setHoveredSegment({
                  x: seg.labelX + 20,
                  y: seg.labelY + 20,
                  label: seg.label,
                  value: seg.value,
                  percentage: seg.percentage,
                  color: seg.color,
                })
              }
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <path
                d={seg.path}
                fill={seg.color}
                className={`transition-all duration-150 cursor-pointer ${hoveredSegment?.label === seg.label ? "opacity-80" : ""}`}
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transform: hoveredSegment?.label === seg.label ? "scale(1.05)" : "scale(1)",
                  ...(animated
                    ? {
                        opacity: hoveredSegment?.label === seg.label ? 0.8 : 0,
                        animation: `pieSlice 0.5s ease-out ${i * 0.1}s forwards`,
                      }
                    : undefined),
                }}
              />

              {/* Label with percentage */}
              {showLabels && (
                <text
                  x={seg.labelX}
                  y={seg.labelY}
                  textAnchor={seg.labelX > center ? "start" : "end"}
                  fontSize="10"
                  className="text-foreground"
                  fill="currentColor"
                  style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.1 + 0.3}s forwards` } : undefined}
                >
                  {showPercentage ? `${(seg.percentage * 100).toFixed(0)}%` : seg.value}
                </text>
              )}
            </g>
          ))}

          {/* Center text for donut */}
          {donut && (
            <g>
              <text x={center} y={center - 5} textAnchor="middle" fontSize="12" className="text-muted-foreground" fill="currentColor">
                Total
              </text>
              <text x={center} y={center + 15} textAnchor="middle" fontSize="18" fontWeight="600" className="text-foreground" fill="currentColor">
                {total}
              </text>
            </g>
          )}
        </g>

        <style>{`
          @keyframes pieSlice {
            from {
              opacity: 0;
              transform: scale(0);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-2">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm"
              style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.1 + 0.3}s forwards` } : undefined}
            >
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-muted-foreground">{seg.label}</span>
              <span className="text-foreground font-medium ml-auto">{showPercentage ? `${(seg.percentage * 100).toFixed(0)}%` : seg.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip with Portal */}
      <ChartTooltip
        x={hoveredSegment?.x ?? center}
        y={hoveredSegment?.y ?? center}
        visible={!!hoveredSegment}
        label={hoveredSegment?.label}
        value={`${hoveredSegment?.value} (${((hoveredSegment?.percentage ?? 0) * 100).toFixed(1)}%)`}
        color={hoveredSegment?.color}
        containerRef={containerRef}
      />
    </div>
  );
}

export default PieChart;
