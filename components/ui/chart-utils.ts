/**
 * Shared chart utilities for all chart components.
 * Centralizes common functions to reduce duplication.
 */

/** Catmull-Rom spline interpolation for smooth curves */
export function getCatmullRomSpline(points: { x: number; y: number }[], tension = 0.5): string {
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

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/** Calculate line/path length for SVG stroke-dasharray animation */
export function getPathLength(points: { x: number; y: number }[]): number {
  return points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return acc + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);
}

/** Default number formatter with K/M abbreviation */
export function defaultFormatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

/** Generate a unique ID for SVG defs (gradients, clip-paths, etc.) */
let _idCounter = 0;
export function uniqueChartId(prefix: string): string {
  return `${prefix}-${++_idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Chart empty state placeholder */
export function renderChartEmpty(width: number, height: number, text = "No data"): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return React.createElement(
    "svg",
    { width, height, className: "overflow-visible" },
    React.createElement(
      "text",
      {
        x: width / 2,
        y: height / 2,
        textAnchor: "middle",
        dominantBaseline: "middle",
        fontSize: "13",
        className: "text-muted-foreground",
        fill: "currentColor",
      },
      text,
    ),
  );
}

/** Shared CSS keyframe animations for charts */
export const CHART_KEYFRAMES = `
  @keyframes chartDrawLine {
    to { stroke-dashoffset: 0; }
  }
  @keyframes chartFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes chartScaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes chartGrowHeight {
    from { height: 0; }
  }
  @keyframes chartGrowWidth {
    from { width: 0; }
  }
  @keyframes chartPieSlice {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes chartRadarPop {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes chartNeedleRotate {
    to { transform: rotate(var(--needle-end)); }
  }
`;
