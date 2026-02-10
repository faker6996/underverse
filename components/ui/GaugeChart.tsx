"use client";

import React, { useMemo } from "react";

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  showMinMax?: boolean;
  label?: string;
  animated?: boolean;
  startAngle?: number;
  endAngle?: number;
  /** Color zones on the gauge arc */
  zones?: { min: number; max: number; color: string }[];
  /** Custom value formatter */
  formatValue?: (value: number) => string;
  /** Custom class for min/max/value labels */
  labelClassName?: string;
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 200,
  thickness = 20,
  color = "currentColor",
  backgroundColor,
  showValue = true,
  showMinMax = true,
  label,
  animated = true,
  startAngle = -135,
  endAngle = 135,
  zones,
  formatValue,
  labelClassName,
  className = "",
}: GaugeChartProps) {
  const center = size / 2;
  const radius = center - thickness / 2 - 10;

  const { backgroundPath, valuePath, percentage, needleAngle, zonePaths } = useMemo(() => {
    const normalizedValue = Math.min(Math.max(value, min), max);
    const pct = (normalizedValue - min) / (max - min);
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + pct * totalAngle;

    const polarToCartesian = (angle: number) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: center + radius * Math.cos(radians),
        y: center + radius * Math.sin(radians),
      };
    };

    const createArc = (start: number, end: number) => {
      const startPoint = polarToCartesian(start);
      const endPoint = polarToCartesian(end);
      const largeArc = Math.abs(end - start) > 180 ? 1 : 0;
      return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y}`;
    };

    const zonePaths = (zones ?? []).map((zone) => {
      const zoneStart = startAngle + ((Math.max(zone.min, min) - min) / (max - min)) * totalAngle;
      const zoneEnd = startAngle + ((Math.min(zone.max, max) - min) / (max - min)) * totalAngle;
      return { path: createArc(zoneStart, zoneEnd), color: zone.color };
    });

    return {
      backgroundPath: createArc(startAngle, endAngle),
      valuePath: createArc(startAngle, currentAngle),
      percentage: pct,
      needleAngle: currentAngle,
      zonePaths,
    };
  }, [value, min, max, center, radius, startAngle, endAngle, zones]);

  const needleLength = radius - 10;
  const needleAngleRad = (needleAngle * Math.PI) / 180;
  const needleX = center + needleLength * Math.cos(needleAngleRad);
  const needleY = center + needleLength * Math.sin(needleAngleRad);

  return (
    <svg width={size} height={size * 0.7} className={`overflow-visible ${className}`} style={{ fontFamily: "inherit" }}>
      {/* Background arc */}
      <path
        d={backgroundPath}
        fill="none"
        stroke={backgroundColor || "currentColor"}
        strokeWidth={thickness}
        strokeLinecap="round"
        className={!backgroundColor ? "text-muted-foreground/20" : ""}
      />

      {/* Zone arcs */}
      {zonePaths.map((zone, i) => (
        <path key={`zone-${i}`} d={zone.path} fill="none" stroke={zone.color} strokeWidth={thickness} strokeLinecap="round" opacity={0.35} />
      ))}

      {/* Value arc */}
      <path
        d={valuePath}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        style={
          animated
            ? {
                strokeDasharray: "1000",
                strokeDashoffset: 1000,
                animation: "drawArc 1s ease-out forwards",
              }
            : undefined
        }
      />

      {/* Needle */}
      <g
        style={
          animated
            ? {
                transform: `rotate(${startAngle}deg)`,
                transformOrigin: `${center}px ${center}px`,
                animation: `needleRotate 1s ease-out forwards`,
                ["--needle-end" as string]: `${needleAngle}deg`,
              }
            : {
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: `${center}px ${center}px`,
              }
        }
      >
        <line x1={center} y1={center} x2={center + needleLength} y2={center} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={center} cy={center} r={8} fill={color} />
        <circle cx={center} cy={center} r={4} className="text-background" fill="currentColor" />
      </g>

      {/* Min/Max labels */}
      {showMinMax && (
        <g className={labelClassName || "text-muted-foreground"}>
          <text
            x={center + (radius + 20) * Math.cos((startAngle * Math.PI) / 180)}
            y={center + (radius + 20) * Math.sin((startAngle * Math.PI) / 180) + 5}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
          >
            {min}
          </text>
          <text
            x={center + (radius + 20) * Math.cos((endAngle * Math.PI) / 180)}
            y={center + (radius + 20) * Math.sin((endAngle * Math.PI) / 180) + 5}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
          >
            {max}
          </text>
        </g>
      )}

      {/* Center value */}
      {showValue && (
        <g>
          <text
            x={center}
            y={center + 35}
            textAnchor="middle"
            fontSize="24"
            fontWeight="600"
            className="text-foreground"
            fill="currentColor"
            style={animated ? { opacity: 0, animation: "fadeIn 0.5s ease-out 0.5s forwards" } : undefined}
          >
            {formatValue ? formatValue(value) : value}
          </text>
          {label && (
            <text
              x={center}
              y={center + 55}
              textAnchor="middle"
              fontSize="12"
              className="text-muted-foreground"
              fill="currentColor"
              style={animated ? { opacity: 0, animation: "fadeIn 0.5s ease-out 0.6s forwards" } : undefined}
            >
              {label}
            </text>
          )}
        </g>
      )}

      <style>{`
        @keyframes drawArc {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes needleRotate {
          to {
            transform: rotate(var(--needle-end));
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}

export default GaugeChart;
