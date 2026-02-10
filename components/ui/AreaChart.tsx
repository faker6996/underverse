"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { ChartTooltip } from "./ChartTooltip";
import { getCatmullRomSpline } from "./chart-utils";

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
  /** Custom value formatter for labels and tooltips */
  formatValue?: (value: number) => string;
  /** Text shown when data is empty */
  emptyText?: string;
  className?: string;
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
  formatValue,
  emptyText = "No data",
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

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const toggleSeries = useCallback((name: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

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
                  {formatValue ? formatValue(line.value) : line.value.toFixed(0)}
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
            fillOpacity={hiddenSeries.has(s.name) ? 0 : (s.fillOpacity ?? 0.3)}
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
            className="transition-opacity duration-300"
            opacity={hiddenSeries.has(s.name) ? 0 : 1}
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
          processedSeries.map(
            (s, seriesIdx) =>
              !hiddenSeries.has(s.name) &&
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
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
              style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.1 + 0.5}s forwards` } : undefined}
              onClick={() => toggleSeries(s.name)}
            >
              <div
                className="w-3 h-3 rounded-md transition-opacity"
                style={{ backgroundColor: s.color, opacity: hiddenSeries.has(s.name) ? 0.3 : 1 }}
              />
              <span className={hiddenSeries.has(s.name) ? "text-muted-foreground/40 line-through" : "text-muted-foreground"}>{s.name}</span>
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
