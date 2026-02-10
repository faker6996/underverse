"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { ChartTooltip } from "./ChartTooltip";
import { getCatmullRomSpline, getPathLength } from "./chart-utils";

export interface LineChartDataPoint {
  label: string;
  value: number;
}

export interface LineChartSeries {
  name: string;
  data: LineChartDataPoint[];
  color: string;
  fillColor?: string;
}

export interface LineChartProps {
  /** Single series data (backward compatible) */
  data?: LineChartDataPoint[];
  /** Multi-series data */
  series?: LineChartSeries[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  /** Show legend (auto-enabled for multi-series) */
  showLegend?: boolean;
  animated?: boolean;
  curved?: boolean;
  /** Custom value formatter for labels and tooltips */
  formatValue?: (value: number) => string;
  /** Horizontal reference lines */
  referenceLines?: { value: number; color?: string; label?: string; strokeDasharray?: string }[];
  /** Custom class for axis labels */
  labelClassName?: string;
  className?: string;
}

export function LineChart({
  data,
  series,
  width = 400,
  height = 200,
  color = "currentColor",
  fillColor,
  showDots = true,
  showGrid = true,
  showLabels = true,
  showValues = false,
  showLegend,
  animated = true,
  curved = true,
  formatValue,
  referenceLines = [],
  labelClassName,
  className = "",
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const clipId = useRef(`line-clip-${Math.random().toString(36).slice(2, 8)}`).current;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    items?: { label: string; value: number; color: string }[];
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

  // Normalize to multi-series format for internal processing
  const normalizedSeries = useMemo(() => {
    if (series && series.length > 0) return series;
    if (data && data.length > 0) return [{ name: "", data, color, fillColor }];
    return [];
  }, [series, data, color, fillColor]);

  const isMultiSeries = normalizedSeries.length > 1;

  const { minValue, maxValue, processedSeries, labels } = useMemo(() => {
    if (!normalizedSeries.length || !normalizedSeries[0]?.data?.length) {
      return { minValue: 0, maxValue: 0, processedSeries: [], labels: [] };
    }

    const allLabels = normalizedSeries[0].data.map((d) => d.label);
    const allValues = normalizedSeries.flatMap((s) => s.data.map((d) => d.value));
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;

    const processed = normalizedSeries.map((s) => {
      const pts = s.data.map((d, i) => ({
        x: padding.left + (i / (s.data.length - 1 || 1)) * chartWidth,
        y: padding.top + chartHeight - ((d.value - min) / range) * chartHeight,
        ...d,
      }));

      let linePath = "";
      let areaPath = "";

      if (curved && pts.length > 2) {
        linePath = getCatmullRomSpline(pts);
        areaPath = `${linePath} L ${pts[pts.length - 1].x} ${padding.top + chartHeight} L ${pts[0].x} ${padding.top + chartHeight} Z`;
      } else {
        linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        areaPath =
          `M ${pts[0].x} ${padding.top + chartHeight} ` +
          pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
          ` L ${pts[pts.length - 1].x} ${padding.top + chartHeight} Z`;
      }

      const lineLength = getPathLength(pts);

      return { ...s, points: pts, linePath, areaPath, lineLength };
    });

    return { minValue: min, maxValue: max, processedSeries: processed, labels: allLabels };
  }, [normalizedSeries, chartWidth, chartHeight, curved, padding.left, padding.top]);

  const gridLines = useMemo(() => {
    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + (i / steps) * chartHeight;
      const value = maxValue - (i / steps) * (maxValue - minValue);
      lines.push({ y, value });
    }
    return lines;
  }, [minValue, maxValue, chartHeight, padding.top]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} className={`overflow-visible ${className}`} style={{ fontFamily: "inherit" }}>
        {/* Clip path to prevent spline overshoot */}
        <defs>
          <clipPath id={clipId}>
            <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} />
          </clipPath>
        </defs>

        {/* Grid */}
        {showGrid && (
          <g className="text-muted-foreground/20">
            {gridLines.map((line, i) => (
              <g key={i}>
                <line x1={padding.left} y1={line.y} x2={width - padding.right} y2={line.y} stroke="currentColor" strokeDasharray="4 4" />
                <text
                  x={padding.left - 8}
                  y={line.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="currentColor"
                  className={labelClassName || "text-muted-foreground"}
                >
                  {formatValue ? formatValue(line.value) : line.value.toFixed(0)}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Area fills + Lines — clipped to chart bounds to prevent spline overshoot */}
        <g clipPath={`url(#${clipId})`}>
          {processedSeries.map(
            (s, si) =>
              s.fillColor &&
              s.areaPath && (
                <path
                  key={`area-${si}`}
                  d={s.areaPath}
                  fill={s.fillColor}
                  className="transition-opacity duration-300"
                  opacity={hiddenSeries.has(s.name) ? 0 : 0.15}
                  style={animated ? { opacity: 0, animation: `fadeIn 0.6s ease-out ${si * 0.1}s forwards` } : undefined}
                />
              ),
          )}

          {/* Lines */}
          {processedSeries.map((s, si) => (
            <path
              key={`line-${si}`}
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
                      animation: `drawLine 1s ease-out ${si * 0.15}s forwards`,
                    }
                  : undefined
              }
            />
          ))}
        </g>

        {/* Dots */}
        {showDots &&
          processedSeries.map(
            (s, si) =>
              !hiddenSeries.has(s.name) &&
              s.points.map((point, i) => (
                <g
                  key={`dot-${si}-${i}`}
                  onMouseEnter={() => {
                    if (isMultiSeries) {
                      const items = processedSeries
                        .filter((ps) => !hiddenSeries.has(ps.name))
                        .map((ps) => ({
                          label: ps.name,
                          value: ps.points[i]?.value ?? 0,
                          color: ps.color,
                        }));
                      setHoveredPoint({ x: point.x, y: point.y, label: point.label, value: point.value, items });
                    } else {
                      setHoveredPoint({ x: point.x, y: point.y, label: point.label, value: point.value });
                    }
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint?.x === point.x ? 6 : 4}
                    fill={s.color}
                    className={`transition-all duration-150 ${animated ? "animate-[scaleIn_0.3s_ease-out]" : ""}`}
                    style={animated ? { animationDelay: `${si * 0.15 + i * 0.05}s`, animationFillMode: "both" } : undefined}
                  />
                  <circle cx={point.x} cy={point.y} r={16} fill="transparent" />
                  {showValues && (
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="500"
                      className="text-foreground"
                      fill="currentColor"
                    >
                      {formatValue ? formatValue(point.value) : point.value}
                    </text>
                  )}
                </g>
              )),
          )}

        {/* Reference lines */}
        {referenceLines.map((ref, i) => {
          const range = maxValue - minValue || 1;
          const y = padding.top + chartHeight - ((ref.value - minValue) / range) * chartHeight;
          return (
            <g key={`ref-${i}`} className="pointer-events-none">
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke={ref.color || "#ef4444"}
                strokeWidth={1.5}
                strokeDasharray={ref.strokeDasharray || "6 4"}
                opacity={0.7}
              />
              {ref.label && (
                <text x={padding.left + chartWidth + 4} y={y + 4} fontSize="10" fill={ref.color || "#ef4444"} fontWeight="500">
                  {ref.label}
                </text>
              )}
            </g>
          );
        })}

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

        {/* X-axis labels */}
        {showLabels &&
          labels.map((lbl, i) => {
            const x = padding.left + (i / (labels.length - 1 || 1)) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                className={labelClassName || "text-muted-foreground"}
                fill="currentColor"
              >
                {lbl}
              </text>
            );
          })}

        <style>{`
          @keyframes drawLine {
            to { stroke-dashoffset: 0; }
          }
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 0.15; }
          }
        `}</style>
      </svg>

      {/* Legend */}
      {(showLegend ?? isMultiSeries) && isMultiSeries && (
        <div className="flex items-center justify-center gap-6 mt-2">
          {normalizedSeries.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm cursor-pointer select-none" onClick={() => toggleSeries(s.name)}>
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
        value={!isMultiSeries ? hoveredPoint?.value : undefined}
        items={isMultiSeries ? hoveredPoint?.items : undefined}
        color={!isMultiSeries ? processedSeries[0]?.color || color : undefined}
        containerRef={svgRef}
        formatter={formatValue ? (v) => formatValue(Number(v)) : undefined}
      />
    </>
  );
}

export default LineChart;
