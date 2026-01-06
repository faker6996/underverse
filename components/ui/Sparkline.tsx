"use client";

import React, { useMemo } from "react";

export interface SparklineDataPoint {
  value: number;
}

export interface SparklineProps {
  data: SparklineDataPoint[] | number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showFill?: boolean;
  showDots?: boolean;
  showEndDot?: boolean;
  animated?: boolean;
  curved?: boolean;
  strokeWidth?: number;
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

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "currentColor",
  fillColor,
  showFill = true,
  showDots = false,
  showEndDot = true,
  animated = true,
  curved = true,
  strokeWidth = 2,
  className = "",
}: SparklineProps) {
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const { points, linePath, areaPath, lineLength, trend } = useMemo(() => {
    const normalizedData = data.map((d) => (typeof d === "number" ? d : d.value));
    if (!normalizedData.length) {
      return { points: [], linePath: "", areaPath: "", lineLength: 0, trend: 0 };
    }

    const min = Math.min(...normalizedData);
    const max = Math.max(...normalizedData);
    const range = max - min || 1;

    const pts = normalizedData.map((value, i) => ({
      x: padding + (i / (normalizedData.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight,
      value,
    }));

    const line = curved ? getCatmullRomSpline(pts) : `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`;

    const area = `${line} L ${padding + chartWidth} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

    const length = pts.reduce((acc, p, i) => {
      if (i === 0) return 0;
      const prev = pts[i - 1];
      return acc + Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
    }, 0);

    // Calculate trend (last - first)
    const trendValue = normalizedData[normalizedData.length - 1] - normalizedData[0];

    return { points: pts, linePath: line, areaPath: area, lineLength: length, trend: trendValue };
  }, [data, chartWidth, chartHeight, padding, curved]);

  const effectiveFillColor = fillColor || color;

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`} style={{ fontFamily: "inherit" }}>
      {/* Area fill */}
      {showFill && (
        <path
          d={areaPath}
          fill={effectiveFillColor}
          fillOpacity={0.1}
          style={animated ? { opacity: 0, animation: "fadeIn 0.5s ease-out 0.3s forwards" } : undefined}
        />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animated
            ? {
                strokeDasharray: lineLength,
                strokeDashoffset: lineLength,
                animation: "drawLine 0.8s ease-out forwards",
              }
            : undefined
        }
      />

      {/* All dots */}
      {showDots &&
        points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={2}
            fill={color}
            style={
              animated
                ? {
                    opacity: 0,
                    animation: `fadeIn 0.3s ease-out ${i * 0.05 + 0.5}s forwards`,
                  }
                : undefined
            }
          />
        ))}

      {/* End dot only */}
      {showEndDot && !showDots && points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={color}
          style={
            animated
              ? {
                  opacity: 0,
                  transform: "scale(0)",
                  transformOrigin: `${points[points.length - 1].x}px ${points[points.length - 1].y}px`,
                  animation: "dotPop 0.3s ease-out 0.6s forwards",
                }
              : undefined
          }
        />
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
  );
}

export default Sparkline;
