"use client";

import React, { useMemo, useState, useRef } from "react";
import { ChartTooltip } from "./ChartTooltip";

export interface AreaChartDataPoint {
  label: string;
  value: number;
}

export interface AreaChartSeries {
  name: string;
  data: AreaChartDataPoint[];
  color: string;
  fillOpacity?: number;
}

export interface AreaChartProps {
  series: AreaChartSeries[];
  width?: number;
  height?: number;
  showDots?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  animated?: boolean;
  stacked?: boolean;
  curved?: boolean;
  className?: string;
}

function getCatmullRomSpline(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.5;

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export function AreaChart({
  series,
  width = 400,
  height = 200,
  showDots = true,
  showGrid = true,
  showLabels = true,
  showLegend = true,
  animated = true,
  stacked = false,
  curved = true,
  className = "",
}: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    items: { label: string; value: number; color: string }[];
  } | null>(null);

  const { processedSeries, gridLines, maxValue, labels } = useMemo(() => {
    if (!series.length || !series[0]?.data?.length) {
      return { processedSeries: [], gridLines: [], maxValue: 0, labels: [] };
    }

    const allLabels = series[0].data.map((d) => d.label);
    const dataLength = series[0].data.length;

    // Calculate max value
    let max = 0;
    if (stacked) {
      for (let i = 0; i < dataLength; i++) {
        const stackedValue = series.reduce((sum, s) => sum + (s.data[i]?.value || 0), 0);
        max = Math.max(max, stackedValue);
      }
    } else {
      max = Math.max(...series.flatMap((s) => s.data.map((d) => d.value)));
    }

    // Process series into drawable paths
    const processed = series.map((s, seriesIndex) => {
      const points = s.data.map((d, i) => {
        const x = padding.left + (i / (dataLength - 1)) * chartWidth;
        let y: number;

        if (stacked && seriesIndex > 0) {
          // Add previous series values for stacking
          const stackedBase = series.slice(0, seriesIndex).reduce((sum, prevS) => sum + (prevS.data[i]?.value || 0), 0);
          const stackedValue = stackedBase + d.value;
          y = padding.top + chartHeight - (stackedValue / max) * chartHeight;
        } else {
          y = padding.top + chartHeight - (d.value / max) * chartHeight;
        }

        return { x, y, value: d.value, label: d.label };
      });

      const linePath = curved ? getCatmullRomSpline(points) : `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;

      // Create area path
      let areaPath: string;
      if (stacked && seriesIndex > 0) {
        const prevSeriesPoints = series
          .slice(0, seriesIndex)
          .reduce((acc, prevS) => {
            return prevS.data.map((d, i) => {
              const prevVal = acc[i] || 0;
              return prevVal + d.value;
            });
          }, [] as number[])
          .map((val, i) => ({
            x: padding.left + (i / (dataLength - 1)) * chartWidth,
            y: padding.top + chartHeight - (val / max) * chartHeight,
          }));

        const reversedPrevPoints = [...prevSeriesPoints].reverse();
        areaPath = `${linePath} L ${reversedPrevPoints.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
      } else {
        areaPath = `${linePath} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
      }

      return {
        ...s,
        points,
        linePath,
        areaPath,
        lineLength: points.reduce((acc, p, i) => {
          if (i === 0) return 0;
          const prev = points[i - 1];
          return acc + Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
        }, 0),
      };
    });

    // Grid lines
    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = (i / steps) * max;
      lines.push({
        y: padding.top + chartHeight - (i / steps) * chartHeight,
        value,
      });
    }

    return { processedSeries: processed, gridLines: lines, maxValue: max, labels: allLabels };
  }, [series, chartWidth, chartHeight, padding, stacked, curved]);

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-4 ${className}`}>
      <svg width={width} height={height} className="overflow-visible" style={{ fontFamily: "inherit" }}>
        {/* Grid */}
        {showGrid && (
          <g className="text-muted-foreground/20">
            {gridLines.map((line, i) => (
              <g key={i}>
                <line x1={padding.left} y1={line.y} x2={width - padding.right} y2={line.y} stroke="currentColor" strokeDasharray="4 4" />
                <text x={padding.left - 8} y={line.y + 4} textAnchor="end" fontSize="10" className="text-muted-foreground" fill="currentColor">
                  {line.value.toFixed(0)}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Areas (render in reverse order for proper stacking) */}
        {[...processedSeries].reverse().map((s, i) => (
          <path
            key={`area-${i}`}
            d={s.areaPath}
            fill={s.color}
            fillOpacity={s.fillOpacity ?? 0.3}
            className="transition-all duration-300"
            style={
              animated
                ? {
                    opacity: 0,
                    animation: `fadeIn 0.5s ease-out ${i * 0.1}s forwards`,
                  }
                : undefined
            }
          />
        ))}

        {/* Lines */}
        {processedSeries.map((s, i) => (
          <path
            key={`line-${i}`}
            d={s.linePath}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              animated
                ? {
                    strokeDasharray: s.lineLength,
                    strokeDashoffset: s.lineLength,
                    animation: `drawLine 1s ease-out ${i * 0.1}s forwards`,
                  }
                : undefined
            }
          />
        ))}

        {/* Dots */}
        {showDots &&
          processedSeries.map((s, seriesIdx) =>
            s.points.map((point, i) => (
              <g
                key={`dot-${seriesIdx}-${i}`}
                onMouseEnter={() => {
                  const items = processedSeries.map((ps) => ({
                    label: ps.name,
                    value: ps.points[i]?.value ?? 0,
                    color: ps.color,
                  }));
                  setHoveredPoint({
                    x: point.x,
                    y: point.y,
                    label: point.label,
                    items,
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint?.x === point.x ? 6 : 4}
                  fill={s.color}
                  className="transition-all duration-150"
                  style={
                    animated
                      ? {
                          transform: "scale(0)",
                          opacity: 0,
                          transformOrigin: `${point.x}px ${point.y}px`,
                          animation: `dotPop 0.3s ease-out ${seriesIdx * 0.1 + i * 0.05 + 0.5}s forwards`,
                        }
                      : undefined
                  }
                />
                <circle cx={point.x} cy={point.y} r={12} fill="transparent" />
              </g>
            )),
          )}

        {/* X-axis labels */}
        {showLabels && (
          <g className="text-muted-foreground">
            {labels.map((label, i) => {
              const x = padding.left + (i / (labels.length - 1)) * chartWidth;
              return (
                <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="currentColor">
                  {label}
                </text>
              );
            })}
          </g>
        )}

        {/* Hover crosshair */}
        {hoveredPoint && (
          <g className="pointer-events-none">
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={padding.top + chartHeight}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.3}
              className="text-foreground"
            />
          </g>
        )}

        <style>{`
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes dotPop {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-center gap-6">
          {series.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm"
              style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.1 + 0.5}s forwards` } : undefined}
            >
              <div className="w-3 h-3 rounded-md" style={{ backgroundColor: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip with Portal */}
      <ChartTooltip
        x={hoveredPoint?.x ?? 0}
        y={hoveredPoint?.y ?? 0}
        visible={!!hoveredPoint}
        label={hoveredPoint?.label}
        items={hoveredPoint?.items}
        containerRef={containerRef}
      />
    </div>
  );
}

export default AreaChart;
