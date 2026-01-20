"use client";

import React, { useMemo, useState, useRef } from "react";
import { ChartTooltip } from "./ChartTooltip";

export interface RadarChartDataPoint {
  axis: string;
  value: number;
}

export interface RadarChartSeries {
  name: string;
  data: RadarChartDataPoint[];
  color: string;
  fillOpacity?: number;
}

export interface RadarChartProps {
  series: RadarChartSeries[];
  size?: number;
  levels?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

export function RadarChart({
  series,
  size = 300,
  levels = 5,
  showLabels = true,
  showLegend = true,
  showValues = false,
  animated = true,
  className = "",
}: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const center = size / 2;
  const radius = size / 2 - 40;

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    axis: string;
    items: { label: string; value: number; color: string }[];
  } | null>(null);

  const { axes, processedSeries, levelPaths } = useMemo(() => {
    if (!series.length || !series[0]?.data?.length) {
      return { axes: [], processedSeries: [], levelPaths: [] };
    }

    const axisLabels = series[0].data.map((d) => d.axis);
    const axisCount = axisLabels.length;
    const angleStep = (2 * Math.PI) / axisCount;

    // Calculate max value across all series
    const maxValue = Math.max(...series.flatMap((s) => s.data.map((d) => d.value)));

    // Create axis lines
    const axesData = axisLabels.map((label, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const labelX = center + (radius + 20) * Math.cos(angle);
      const labelY = center + (radius + 20) * Math.sin(angle);
      return { label, x, y, labelX, labelY, angle };
    });

    // Create level polygons (grid)
    const levelsData = [];
    for (let l = 1; l <= levels; l++) {
      const levelRadius = (l / levels) * radius;
      const points = axisLabels.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
          x: center + levelRadius * Math.cos(angle),
          y: center + levelRadius * Math.sin(angle),
        };
      });
      levelsData.push({
        path: `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`,
        level: l,
        value: (l / levels) * maxValue,
      });
    }

    // Process series into polygon paths
    const processed = series.map((s) => {
      const points = s.data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (d.value / maxValue) * radius;
        return {
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
          value: d.value,
        };
      });

      return {
        ...s,
        points,
        path: `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`,
      };
    });

    return { axes: axesData, processedSeries: processed, levelPaths: levelsData };
  }, [series, center, radius, levels]);

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-4 ${className}`}>
      <svg width={size} height={size} className="overflow-visible" style={{ fontFamily: "inherit" }}>
        {/* Grid levels */}
        <g className="text-muted-foreground/20">
          {levelPaths.map((level, i) => (
            <path key={i} d={level.path} fill="none" stroke="currentColor" strokeWidth={1} />
          ))}
        </g>

        {/* Axis lines */}
        <g className="text-muted-foreground/30">
          {axes.map((axis, i) => (
            <line key={i} x1={center} y1={center} x2={axis.x} y2={axis.y} stroke="currentColor" strokeWidth={1} />
          ))}
        </g>

        {/* Data polygons */}
        {processedSeries.map((s, i) => (
          <g key={i}>
            <path
              d={s.path}
              fill={s.color}
              fillOpacity={s.fillOpacity ?? 0.2}
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              className="transition-all duration-300"
              style={
                animated
                  ? {
                      opacity: 0,
                      transform: "scale(0)",
                      transformOrigin: `${center}px ${center}px`,
                      animation: `radarPop 0.5s ease-out ${i * 0.15}s forwards`,
                    }
                  : undefined
              }
            />

            {/* Data points */}
            {s.points.map((point, j) => (
              <g
                key={j}
                onMouseEnter={() => {
                  const items = processedSeries.map((ps) => ({
                    label: ps.name,
                    value: ps.points[j]?.value ?? 0,
                    color: ps.color,
                  }));
                  setHoveredPoint({
                    x: point.x,
                    y: point.y,
                    axis: series[0]?.data[j]?.axis ?? "",
                    items,
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint?.axis === series[0]?.data[j]?.axis ? 6 : 4}
                  fill={s.color}
                  className="transition-all duration-150"
                  style={
                    animated
                      ? {
                          opacity: 0,
                          transform: "scale(0)",
                          transformOrigin: `${point.x}px ${point.y}px`,
                          animation: `dotPop 0.3s ease-out ${i * 0.15 + j * 0.05 + 0.3}s forwards`,
                        }
                      : undefined
                  }
                />
                <circle cx={point.x} cy={point.y} r={12} fill="transparent" />
              </g>
            ))}

            {/* Values */}
            {showValues &&
              s.points.map((point, j) => (
                <text
                  key={`val-${j}`}
                  x={point.x}
                  y={point.y - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="500"
                  className="text-foreground"
                  fill="currentColor"
                  style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.15 + 0.5}s forwards` } : undefined}
                >
                  {point.value}
                </text>
              ))}
          </g>
        ))}

        {/* Axis labels */}
        {showLabels && (
          <g className="text-muted-foreground">
            {axes.map((axis, i) => (
              <text key={i} x={axis.labelX} y={axis.labelY} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="currentColor">
                {axis.label}
              </text>
            ))}
          </g>
        )}

        <style>{`
          @keyframes radarPop {
            from {
              opacity: 0;
              transform: scale(0);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
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
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
        label={hoveredPoint?.axis}
        items={hoveredPoint?.items}
        containerRef={containerRef}
      />
    </div>
  );
}

export default RadarChart;
