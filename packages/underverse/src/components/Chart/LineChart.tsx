"use client";

import React, { useMemo, useState } from "react";
import { ChartTooltip } from "./ChartTooltip";

export interface LineChartDataPoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  curved?: boolean;
  className?: string;
}

export function LineChart({
  data,
  width = 400,
  height = 200,
  color = "currentColor",
  fillColor,
  showDots = true,
  showGrid = true,
  showLabels = true,
  showValues = false,
  animated = true,
  curved = true,
  className = "",
}: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const { minValue, maxValue, points, linePath, areaPath } = useMemo(() => {
    if (!data.length) return { minValue: 0, maxValue: 0, points: [], linePath: "", areaPath: "" };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const pts = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1 || 1)) * chartWidth,
      y: padding.top + chartHeight - ((d.value - min) / range) * chartHeight,
      ...d,
    }));

    let path = "";
    let area = "";

    if (curved && pts.length > 2) {
      // Catmull-Rom spline for smooth curves
      path = `M ${pts[0].x} ${pts[0].y}`;
      area = `M ${pts[0].x} ${padding.top + chartHeight} L ${pts[0].x} ${pts[0].y}`;

      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        area += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      area += ` L ${pts[pts.length - 1].x} ${padding.top + chartHeight} Z`;
    } else {
      path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
      area =
        `M ${pts[0].x} ${padding.top + chartHeight} ` +
        pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
        ` L ${pts[pts.length - 1].x} ${padding.top + chartHeight} Z`;
    }

    return { minValue: min, maxValue: max, points: pts, linePath: path, areaPath: area };
  }, [data, chartWidth, chartHeight, curved, padding.left, padding.top]);

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
    <svg width={width} height={height} className={`overflow-visible ${className}`} style={{ fontFamily: "inherit" }}>
      {/* Grid */}
      {showGrid && (
        <g className="text-muted-foreground/20">
          {gridLines.map((line, i) => (
            <g key={i}>
              <line x1={padding.left} y1={line.y} x2={width - padding.right} y2={line.y} stroke="currentColor" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={line.y + 4} textAnchor="end" fontSize="10" fill="currentColor" className="text-muted-foreground">
                {line.value.toFixed(0)}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Area fill */}
      {fillColor && areaPath && <path d={areaPath} fill={fillColor} opacity={0.2} className={animated ? "animate-[fadeIn_0.6s_ease-out]" : ""} />}

      {/* Line */}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "animate-[drawLine_1s_ease-out]" : ""}
          style={
            animated
              ? {
                  strokeDasharray: 1000,
                  strokeDashoffset: 0,
                  animation: "drawLine 1s ease-out forwards",
                }
              : undefined
          }
        />
      )}

      {/* Dots */}
      {showDots &&
        points.map((point, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredPoint({ x: point.x, y: point.y, label: point.label, value: point.value })}
            onMouseLeave={() => setHoveredPoint(null)}
            className="cursor-pointer"
          >
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint?.x === point.x ? 6 : 4}
              fill={color}
              className={`transition-all duration-150 ${animated ? "animate-[scaleIn_0.3s_ease-out]" : ""}`}
              style={animated ? { animationDelay: `${i * 0.05}s`, animationFillMode: "both" } : undefined}
            />
            <circle cx={point.x} cy={point.y} r={16} fill="transparent" />
            {showValues && (
              <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="10" fontWeight="500" className="text-foreground" fill="currentColor">
                {point.value}
              </text>
            )}
          </g>
        ))}

      {/* Hover crosshair */}
      {hoveredPoint && (
        <g className="pointer-events-none">
          <line
            x1={hoveredPoint.x}
            y1={padding.top}
            x2={hoveredPoint.x}
            y2={padding.top + chartHeight}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
          <line
            x1={padding.left}
            y1={hoveredPoint.y}
            x2={padding.left + chartWidth}
            y2={hoveredPoint.y}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
        </g>
      )}

      {/* Tooltip */}
      <ChartTooltip
        x={hoveredPoint?.x ?? 0}
        y={hoveredPoint?.y ?? 0}
        visible={!!hoveredPoint}
        label={hoveredPoint?.label}
        value={hoveredPoint?.value}
        color={color}
      />

      {/* X-axis labels */}
      {showLabels &&
        points.map((point, i) => (
          <text key={i} x={point.x} y={height - 10} textAnchor="middle" fontSize="10" className="text-muted-foreground" fill="currentColor">
            {point.label}
          </text>
        ))}

      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 0.2; }
        }
      `}</style>
    </svg>
  );
}

export default LineChart;
