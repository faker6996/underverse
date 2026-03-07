"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { ChartTooltip } from "./ChartTooltip";

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartSeries {
  name: string;
  data: BarChartDataPoint[];
  color: string;
}

export interface BarChartProps {
  /** Single series data (backward compatible) */
  data?: BarChartDataPoint[];
  /** Multi-series data */
  series?: BarChartSeries[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
  showValues?: boolean;
  showGrid?: boolean;
  /** Show legend for multi-series */
  showLegend?: boolean;
  horizontal?: boolean;
  animated?: boolean;
  /** Stacked mode for multi-series */
  stacked?: boolean;
  barRadius?: number;
  barGap?: number;
  /** Custom value formatter */
  formatValue?: (value: number) => string;
  /** Custom class for axis labels */
  labelClassName?: string;
  className?: string;
}

export function BarChart({
  data,
  series,
  width = 400,
  height = 200,
  color = "currentColor",
  showLabels = true,
  showValues = true,
  showGrid = true,
  showLegend,
  horizontal = false,
  animated = true,
  stacked = false,
  barRadius = 4,
  barGap = 0.3,
  formatValue,
  labelClassName,
  className = "",
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const padding = horizontal ? { top: 20, right: 40, bottom: 20, left: 80 } : { top: 20, right: 20, bottom: 40, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [hoveredBar, setHoveredBar] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    color?: string;
    seriesName?: string;
  } | null>(null);

  // Normalize to multi-series format
  const normalizedSeries = useMemo(() => {
    if (series && series.length > 0) return series;
    if (data && data.length > 0) return [{ name: "", data, color }];
    return [];
  }, [series, data, color]);

  const isMultiSeries = normalizedSeries.length > 1;

  const { maxValue, barGroups, gridLines } = useMemo(() => {
    if (!normalizedSeries.length || !normalizedSeries[0]?.data?.length) {
      return { maxValue: 0, barGroups: [], gridLines: [] };
    }

    const allLabels = normalizedSeries[0].data.map((d) => d.label);
    const seriesCount = normalizedSeries.length;
    const labelCount = allLabels.length;

    let max = 0;
    if (stacked) {
      for (let li = 0; li < labelCount; li++) {
        const stackVal = normalizedSeries.reduce((sum, s) => sum + (s.data[li]?.value || 0), 0);
        max = Math.max(max, stackVal);
      }
    } else {
      max = Math.max(...normalizedSeries.flatMap((s) => s.data.map((d) => d.value)));
    }

    const groups = allLabels.map((label, li) => {
      if (horizontal) {
        const groupH = chartHeight / labelCount;
        const gap = groupH * barGap;
        const usable = groupH - gap;
        if (stacked) {
          let cum = 0;
          const bars = normalizedSeries.map((s) => {
            const val = s.data[li]?.value || 0;
            const w = (val / max) * chartWidth;
            const bar = {
              x: padding.left + cum,
              y: padding.top + li * groupH + gap / 2,
              width: w,
              height: usable,
              value: val,
              color: s.data[li]?.color || s.color,
              seriesName: s.name,
              label,
            };
            cum += w;
            return bar;
          });
          return { label, bars };
        } else {
          const bH = usable / seriesCount;
          const bars = normalizedSeries.map((s, si) => {
            const val = s.data[li]?.value || 0;
            return {
              x: padding.left,
              y: padding.top + li * groupH + gap / 2 + si * bH,
              width: (val / max) * chartWidth,
              height: bH,
              value: val,
              color: s.data[li]?.color || s.color,
              seriesName: s.name,
              label,
            };
          });
          return { label, bars };
        }
      } else {
        const groupW = chartWidth / labelCount;
        const gap = groupW * barGap;
        const usable = groupW - gap;
        if (stacked) {
          let cum = 0;
          const bars = normalizedSeries.map((s) => {
            const val = s.data[li]?.value || 0;
            const h = (val / max) * chartHeight;
            const bar = {
              x: padding.left + li * groupW + gap / 2,
              y: padding.top + chartHeight - cum - h,
              width: usable,
              height: h,
              value: val,
              color: s.data[li]?.color || s.color,
              seriesName: s.name,
              label,
            };
            cum += h;
            return bar;
          });
          return { label, bars };
        } else {
          const bW = usable / seriesCount;
          const bars = normalizedSeries.map((s, si) => {
            const val = s.data[li]?.value || 0;
            return {
              x: padding.left + li * groupW + gap / 2 + si * bW,
              y: padding.top + chartHeight - (val / max) * chartHeight,
              width: bW,
              height: (val / max) * chartHeight,
              value: val,
              color: s.data[li]?.color || s.color,
              seriesName: s.name,
              label,
            };
          });
          return { label, bars };
        }
      }
    });

    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = (i / steps) * max;
      if (horizontal) {
        lines.push({ x: padding.left + (i / steps) * chartWidth, y1: padding.top, y2: height - padding.bottom, value });
      } else {
        lines.push({ y: padding.top + chartHeight - (i / steps) * chartHeight, x1: padding.left, x2: width - padding.right, value });
      }
    }

    return { maxValue: max, barGroups: groups, gridLines: lines };
  }, [normalizedSeries, chartWidth, chartHeight, horizontal, stacked, barGap, padding, width, height]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} className={`overflow-visible ${className}`} style={{ fontFamily: "inherit" }}>
        {/* Grid */}
        {showGrid && (
          <g className="text-muted-foreground/20">
            {gridLines.map((line, i) => (
              <g key={i}>
                {horizontal ? (
                  <>
                    <line x1={line.x} y1={line.y1} x2={line.x} y2={line.y2} stroke="currentColor" strokeDasharray="4 4" />
                    <text
                      x={line.x}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="10"
                      className={labelClassName || "text-muted-foreground"}
                      fill="currentColor"
                    >
                      {formatValue ? formatValue(line.value) : line.value.toFixed(0)}
                    </text>
                  </>
                ) : (
                  <>
                    <line x1={line.x1} y1={line.y} x2={line.x2} y2={line.y} stroke="currentColor" strokeDasharray="4 4" />
                    <text
                      x={padding.left - 8}
                      y={line.y! + 4}
                      textAnchor="end"
                      fontSize="10"
                      className={labelClassName || "text-muted-foreground"}
                      fill="currentColor"
                    >
                      {formatValue ? formatValue(line.value) : line.value.toFixed(0)}
                    </text>
                  </>
                )}
              </g>
            ))}
          </g>
        )}

        {/* Bars */}
        {barGroups.map((group, gi) => (
          <g key={gi}>
            {group.bars.map((bar, bi) => {
              const animDelay = gi * 0.08 + bi * 0.04;
              return (
                <g
                  key={bi}
                  onMouseEnter={() =>
                    setHoveredBar({
                      x: horizontal ? bar.x + bar.width : bar.x + bar.width / 2,
                      y: horizontal ? bar.y + bar.height / 2 : bar.y,
                      label: bar.label,
                      value: bar.value,
                      color: bar.color,
                      seriesName: bar.seriesName,
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx={barRadius}
                    ry={barRadius}
                    fill={bar.color}
                    className={`transition-all duration-150 ${hoveredBar?.label === bar.label && hoveredBar?.seriesName === bar.seriesName ? "opacity-80" : ""}`}
                    style={
                      animated
                        ? {
                            animation: horizontal
                              ? `growWidth 0.5s ease-out ${animDelay}s forwards`
                              : `growHeight 0.5s ease-out ${animDelay}s forwards`,
                            ...(horizontal ? { width: 0 } : { height: 0, y: padding.top + chartHeight }),
                          }
                        : undefined
                    }
                  >
                    <animate
                      attributeName={horizontal ? "width" : "height"}
                      from="0"
                      to={horizontal ? bar.width : bar.height}
                      dur="0.5s"
                      begin={`${animDelay}s`}
                      fill="freeze"
                    />
                    {!horizontal && (
                      <animate attributeName="y" from={padding.top + chartHeight} to={bar.y} dur="0.5s" begin={`${animDelay}s`} fill="freeze" />
                    )}
                  </rect>

                  {/* Values */}
                  {showValues && (
                    <text
                      x={horizontal ? bar.x + bar.width + 8 : bar.x + bar.width / 2}
                      y={horizontal ? bar.y + bar.height / 2 + 4 : bar.y - 8}
                      textAnchor={horizontal ? "start" : "middle"}
                      fontSize="11"
                      fontWeight="500"
                      className="text-foreground"
                      fill="currentColor"
                      style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${animDelay + 0.3}s forwards` } : undefined}
                    >
                      {formatValue ? formatValue(bar.value) : bar.value}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Labels (one per group) */}
            {showLabels && (
              <text
                x={horizontal ? padding.left - 8 : padding.left + (gi + 0.5) * (chartWidth / barGroups.length)}
                y={horizontal ? padding.top + (gi + 0.5) * (chartHeight / barGroups.length) + 4 : height - 10}
                textAnchor={horizontal ? "end" : "middle"}
                fontSize="10"
                className={labelClassName || "text-muted-foreground"}
                fill="currentColor"
              >
                {group.label}
              </text>
            )}
          </g>
        ))}

        <style>{`
          @keyframes growHeight {
            from { height: 0; }
          }
          @keyframes growWidth {
            from { width: 0; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </svg>

      {/* Legend */}
      {(showLegend ?? isMultiSeries) && isMultiSeries && (
        <div className="flex items-center justify-center gap-6 mt-2">
          {normalizedSeries.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-md" style={{ backgroundColor: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip with Portal */}
      <ChartTooltip
        x={hoveredBar?.x ?? 0}
        y={hoveredBar?.y ?? 0}
        visible={!!hoveredBar}
        label={hoveredBar?.seriesName ? `${hoveredBar.label} — ${hoveredBar.seriesName}` : hoveredBar?.label}
        value={hoveredBar?.value}
        color={hoveredBar?.color}
        containerRef={svgRef}
        formatter={formatValue ? (v) => formatValue(Number(v)) : undefined}
      />
    </>
  );
}

export default BarChart;
