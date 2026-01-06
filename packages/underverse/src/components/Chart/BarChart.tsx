"use client";

import React, { useMemo, useState } from "react";
import { ChartTooltip } from "./ChartTooltip";

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
  showValues?: boolean;
  showGrid?: boolean;
  horizontal?: boolean;
  animated?: boolean;
  barRadius?: number;
  barGap?: number;
  className?: string;
}

export function BarChart({
  data,
  width = 400,
  height = 200,
  color = "currentColor",
  showLabels = true,
  showValues = true,
  showGrid = true,
  horizontal = false,
  animated = true,
  barRadius = 4,
  barGap = 0.3,
  className = "",
}: BarChartProps) {
  const padding = horizontal ? { top: 20, right: 40, bottom: 20, left: 80 } : { top: 20, right: 20, bottom: 40, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [hoveredBar, setHoveredBar] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    color?: string;
  } | null>(null);

  const { maxValue, bars, gridLines } = useMemo(() => {
    if (!data.length) return { maxValue: 0, bars: [], gridLines: [] };

    const max = Math.max(...data.map((d) => d.value));
    const barCount = data.length;

    const barsData = data.map((d, i) => {
      if (horizontal) {
        const barHeight = (chartHeight / barCount) * (1 - barGap);
        const gap = (chartHeight / barCount) * barGap;
        return {
          x: padding.left,
          y: padding.top + i * (barHeight + gap) + gap / 2,
          width: (d.value / max) * chartWidth,
          height: barHeight,
          ...d,
        };
      } else {
        const barWidth = (chartWidth / barCount) * (1 - barGap);
        const gap = (chartWidth / barCount) * barGap;
        return {
          x: padding.left + i * (barWidth + gap) + gap / 2,
          y: padding.top + chartHeight - (d.value / max) * chartHeight,
          width: barWidth,
          height: (d.value / max) * chartHeight,
          ...d,
        };
      }
    });

    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = (i / steps) * max;
      if (horizontal) {
        lines.push({
          x: padding.left + (i / steps) * chartWidth,
          y1: padding.top,
          y2: height - padding.bottom,
          value,
        });
      } else {
        lines.push({
          y: padding.top + chartHeight - (i / steps) * chartHeight,
          x1: padding.left,
          x2: width - padding.right,
          value,
        });
      }
    }

    return { maxValue: max, bars: barsData, gridLines: lines };
  }, [data, chartWidth, chartHeight, horizontal, barGap, padding, width, height]);

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`} style={{ fontFamily: "inherit" }}>
      {/* Grid */}
      {showGrid && (
        <g className="text-muted-foreground/20">
          {gridLines.map((line, i) => (
            <g key={i}>
              {horizontal ? (
                <>
                  <line x1={line.x} y1={line.y1} x2={line.x} y2={line.y2} stroke="currentColor" strokeDasharray="4 4" />
                  <text x={line.x} y={height - 8} textAnchor="middle" fontSize="10" className="text-muted-foreground" fill="currentColor">
                    {line.value.toFixed(0)}
                  </text>
                </>
              ) : (
                <>
                  <line x1={line.x1} y1={line.y} x2={line.x2} y2={line.y} stroke="currentColor" strokeDasharray="4 4" />
                  <text x={padding.left - 8} y={line.y! + 4} textAnchor="end" fontSize="10" className="text-muted-foreground" fill="currentColor">
                    {line.value.toFixed(0)}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
      )}

      {/* Bars */}
      {bars.map((bar, i) => (
        <g
          key={i}
          onMouseEnter={() =>
            setHoveredBar({
              x: horizontal ? bar.x + bar.width : bar.x + bar.width / 2,
              y: horizontal ? bar.y + bar.height / 2 : bar.y,
              label: bar.label,
              value: bar.value,
              color: bar.color || color,
            })
          }
          onMouseLeave={() => setHoveredBar(null)}
          className="cursor-pointer"
        >
          <rect
            x={bar.x}
            y={horizontal ? bar.y : bar.y}
            width={animated && !horizontal ? 0 : bar.width}
            height={animated && horizontal ? bar.height : horizontal ? bar.height : 0}
            rx={barRadius}
            ry={barRadius}
            fill={bar.color || color}
            className={`transition-all duration-150 ${hoveredBar?.label === bar.label ? "opacity-80" : ""}`}
            style={
              animated
                ? {
                    animation: horizontal ? `growWidth 0.5s ease-out ${i * 0.1}s forwards` : `growHeight 0.5s ease-out ${i * 0.1}s forwards`,
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
              begin={`${i * 0.1}s`}
              fill="freeze"
            />
            {!horizontal && <animate attributeName="y" from={padding.top + chartHeight} to={bar.y} dur="0.5s" begin={`${i * 0.1}s`} fill="freeze" />}
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
              style={animated ? { opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.1 + 0.3}s forwards` } : undefined}
            >
              {bar.value}
            </text>
          )}

          {/* Labels */}
          {showLabels && (
            <text
              x={horizontal ? padding.left - 8 : bar.x + bar.width / 2}
              y={horizontal ? bar.y + bar.height / 2 + 4 : height - 10}
              textAnchor={horizontal ? "end" : "middle"}
              fontSize="10"
              className="text-muted-foreground"
              fill="currentColor"
            >
              {bar.label}
            </text>
          )}
        </g>
      ))}

      {/* Tooltip */}
      <ChartTooltip
        x={hoveredBar?.x ?? 0}
        y={hoveredBar?.y ?? 0}
        visible={!!hoveredBar}
        label={hoveredBar?.label}
        value={hoveredBar?.value}
        color={hoveredBar?.color}
      />

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
  );
}

export default BarChart;
