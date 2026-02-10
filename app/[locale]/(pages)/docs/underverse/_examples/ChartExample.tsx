"use client";

import React, { useState } from "react";
import { LineChart, BarChart, PieChart, AreaChart, Sparkline, RadarChart, GaugeChart } from "@underverse-ui/underverse";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

// Sample data
const lineData = [
  { label: "Jan", value: 40 },
  { label: "Feb", value: 30 },
  { label: "Mar", value: 45 },
  { label: "Apr", value: 50 },
  { label: "May", value: 35 },
  { label: "Jun", value: 60 },
];

const barData = [
  { label: "A", value: 40, color: "#3b82f6" },
  { label: "B", value: 65, color: "#10b981" },
  { label: "C", value: 45, color: "#f59e0b" },
  { label: "D", value: 80, color: "#ef4444" },
  { label: "E", value: 55, color: "#8b5cf6" },
];

const pieData = [
  { label: "Desktop", value: 45, color: "#3b82f6" },
  { label: "Mobile", value: 35, color: "#10b981" },
  { label: "Tablet", value: 20, color: "#f59e0b" },
];

const areaSeriesData = [
  {
    name: "Revenue",
    color: "#3b82f6",
    data: [
      { label: "Jan", value: 40 },
      { label: "Feb", value: 30 },
      { label: "Mar", value: 45 },
      { label: "Apr", value: 50 },
      { label: "May", value: 35 },
      { label: "Jun", value: 60 },
    ],
  },
  {
    name: "Profit",
    color: "#10b981",
    data: [
      { label: "Jan", value: 20 },
      { label: "Feb", value: 15 },
      { label: "Mar", value: 25 },
      { label: "Apr", value: 30 },
      { label: "May", value: 20 },
      { label: "Jun", value: 35 },
    ],
  },
];

const radarData = [
  {
    name: "Player A",
    color: "#3b82f6",
    data: [
      { axis: "Speed", value: 80 },
      { axis: "Power", value: 65 },
      { axis: "Defense", value: 70 },
      { axis: "Stamina", value: 85 },
      { axis: "Skill", value: 75 },
    ],
  },
  {
    name: "Player B",
    color: "#ef4444",
    data: [
      { axis: "Speed", value: 70 },
      { axis: "Power", value: 85 },
      { axis: "Defense", value: 60 },
      { axis: "Stamina", value: 70 },
      { axis: "Skill", value: 80 },
    ],
  },
];

const sparklineData = [10, 25, 15, 30, 20, 35, 25, 40, 30, 45];

const codeExample = `import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  Sparkline,
  RadarChart,
  GaugeChart,
} from '@underverse-ui/underverse';

// LineChart — single series
<LineChart
  data={[
    { label: "Jan", value: 40 },
    { label: "Feb", value: 30 },
    { label: "Mar", value: 45 },
  ]}
  width={400}
  height={200}
  color="#3b82f6"
  showDots
  showGrid
  curved
  animated
  formatValue={(v) => \`$\${v}k\`}
  labelClassName="text-xs text-muted-foreground"
/>

// LineChart — multi-series
<LineChart
  series={[
    {
      name: "Revenue",
      color: "#3b82f6",
      data: [{ label: "Jan", value: 40 }, ...],
    },
    {
      name: "Profit",
      color: "#10b981",
      data: [{ label: "Jan", value: 20 }, ...],
    },
  ]}
  width={400}
  height={200}
  showDots
  showGrid
  showLegend
  curved
  animated
  referenceLines={[{ value: 35, label: "Target", color: "#f59e0b" }]}
/>

// BarChart — single series
<BarChart
  data={[
    { label: "A", value: 40, color: "#3b82f6" },
    { label: "B", value: 65, color: "#10b981" },
  ]}
  width={400}
  height={200}
  horizontal={false}
  animated
/>

// BarChart — multi-series (grouped)
<BarChart
  series={[
    { name: "2023", color: "#3b82f6", data: [...] },
    { name: "2024", color: "#10b981", data: [...] },
  ]}
  width={400}
  height={200}
  showLegend
  animated
/>

// BarChart — multi-series (stacked)
<BarChart
  series={[...]}
  stacked
  showLegend
  animated
/>

// PieChart (donut with custom center)
<PieChart
  data={[
    { label: "Desktop", value: 45, color: "#3b82f6" },
    { label: "Mobile", value: 35, color: "#10b981" },
  ]}
  size={200}
  donut
  donutWidth={40}
  showLegend
  animated
  renderCenter={({ total }) => (
    <div className="text-center">
      <div className="text-2xl font-bold">{total}</div>
      <div className="text-xs text-muted-foreground">Total</div>
    </div>
  )}
/>

// AreaChart with multiple series
<AreaChart
  series={[
    {
      name: "Revenue",
      color: "#3b82f6",
      data: [{ label: "Jan", value: 40 }, ...],
    },
  ]}
  width={400}
  height={200}
  stacked={false}
  animated
/>

// RadarChart
<RadarChart
  series={[
    {
      name: "Player",
      color: "#3b82f6",
      data: [{ axis: "Speed", value: 80 }, ...],
    },
  ]}
  size={300}
  showLegend
  animated
/>

// GaugeChart with color zones
<GaugeChart
  value={72}
  min={0}
  max={100}
  size={200}
  color="#3b82f6"
  label="Performance"
  animated
  zones={[
    { min: 0, max: 30, color: "#ef4444" },
    { min: 30, max: 70, color: "#f59e0b" },
    { min: 70, max: 100, color: "#10b981" },
  ]}
  formatValue={(v) => \`\${v}%\`}
/>

// Sparkline (mini chart)
<Sparkline
  data={[10, 25, 15, 30, 20, 35]}
  width={100}
  height={30}
  color="#10b981"
  animated
/>`;

const docContent = `## Charts

Pure SVG chart components with CSS animations. No external chart libraries required.

### Features
- **Pure SVG** - No dependencies on recharts, chart.js, etc.
- **Animated** - Smooth CSS animations for drawing and transitions
- **Responsive** - Configurable width/height
- **Themed** - Uses system colors (\`currentColor\`, Tailwind classes)
- **TypeScript** - Full type definitions
- **Multi-series** - LineChart, BarChart, AreaChart, RadarChart support multiple data series
- **Interactive Legend** - Click legend items to show/hide series
- **Custom Formatting** - \`formatValue\` callback for tooltips and labels

### Available Charts

| Component | Description |
|-----------|-------------|
| \`LineChart\` | Line chart with dots, grid, labels, curved/straight lines. Supports multi-series, reference lines |
| \`BarChart\` | Vertical or horizontal bar chart. Supports multi-series (grouped & stacked) |
| \`PieChart\` | Pie or donut chart with legend. Supports custom donut center via \`renderCenter\` |
| \`AreaChart\` | Area chart, supports multiple series and stacking |
| \`Sparkline\` | Minimal inline chart for dashboards |
| \`RadarChart\` | Radar/spider chart for multi-dimensional comparison |
| \`GaugeChart\` | Gauge with needle for metrics/KPIs. Supports color zones |

### Common Props

| Prop | Type | Description |
|------|------|-------------|
| \`animated\` | \`boolean\` | Enable/disable animations (default: true) |
| \`width\` | \`number\` | Chart width in pixels |
| \`height\` | \`number\` | Chart height in pixels |
| \`color\` | \`string\` | Primary color (supports \`currentColor\`) |
| \`showGrid\` | \`boolean\` | Show grid lines |
| \`showLabels\` | \`boolean\` | Show axis labels |
| \`className\` | \`string\` | Additional CSS classes |
| \`labelClassName\` | \`string\` | Custom CSS class for chart label text |
| \`formatValue\` | \`(value: number) => string\` | Custom formatter for tooltip / axis values |
| \`emptyText\` | \`string\` | Text displayed when data is empty |

### LineChart / BarChart Multi-series Props

| Prop | Type | Description |
|------|------|-------------|
| \`series\` | \`Array<{ name, data, color }>\` | Multiple data series (overrides \`data\`) |
| \`showLegend\` | \`boolean\` | Show interactive legend (auto-shown for multi-series) |
| \`stacked\` | \`boolean\` | (BarChart only) Stack bars instead of grouping |
| \`referenceLines\` | \`Array<{ value, label?, color? }>\` | (LineChart only) Horizontal reference lines |

### PieChart Extra Props

| Prop | Type | Description |
|------|------|-------------|
| \`renderCenter\` | \`(info: { total }) => ReactNode\` | Custom content in donut center (uses foreignObject) |

### GaugeChart Extra Props

| Prop | Type | Description |
|------|------|-------------|
| \`zones\` | \`Array<{ min, max, color }>\` | Color zone arcs on the gauge background |
`;

export default function ChartExample() {
  const [key, setKey] = useState(0);

  const replayAnimations = () => {
    setKey((k) => k + 1);
  };

  const preview = (
    <div className="space-y-12" key={key}>
      {/* Replay Button */}
      <div className="flex justify-end">
        <button onClick={replayAnimations} className="text-sm text-primary hover:underline">
          ↻ Replay Animations
        </button>
      </div>

      {/* LineChart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">LineChart</h4>
        <div className="flex justify-center">
          <LineChart data={lineData} width={400} height={200} color="#3b82f6" showDots showGrid showLabels curved animated />
        </div>
      </div>

      {/* BarChart */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">BarChart (Vertical)</h4>
          <div className="flex justify-center">
            <BarChart data={barData} width={300} height={200} showGrid showLabels showValues animated />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">BarChart (Horizontal)</h4>
          <div className="flex justify-center">
            <BarChart data={barData} width={300} height={200} horizontal showGrid showLabels showValues animated />
          </div>
        </div>
      </div>

      {/* PieChart */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">PieChart</h4>
          <div className="flex justify-center">
            <PieChart data={pieData} size={180} showLabels showLegend showPercentage animated />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">DonutChart</h4>
          <div className="flex justify-center">
            <PieChart data={pieData} size={180} donut donutWidth={40} showLabels showLegend showPercentage animated />
          </div>
        </div>
      </div>

      {/* AreaChart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">AreaChart (Multi-series)</h4>
        <div className="flex justify-center">
          <AreaChart series={areaSeriesData} width={400} height={200} showDots showGrid showLabels showLegend curved animated />
        </div>
      </div>

      {/* RadarChart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">RadarChart</h4>
        <div className="flex justify-center">
          <RadarChart series={radarData} size={280} showLabels showLegend animated />
        </div>
      </div>

      {/* GaugeChart */}
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">GaugeChart</h4>
          <div className="flex justify-center">
            <GaugeChart value={72} min={0} max={100} size={180} color="#3b82f6" label="Score" animated />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Low Value</h4>
          <div className="flex justify-center">
            <GaugeChart value={25} min={0} max={100} size={180} color="#ef4444" label="Risk" animated />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">High Value</h4>
          <div className="flex justify-center">
            <GaugeChart value={95} min={0} max={100} size={180} color="#10b981" label="Health" animated />
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Sparkline (Inline Charts)</h4>
        <div className="flex flex-wrap gap-8 items-center justify-center">
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <span className="text-sm text-muted-foreground">Revenue</span>
            <Sparkline data={sparklineData} width={80} height={24} color="#3b82f6" animated />
            <span className="text-sm font-medium text-green-500">+12%</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <span className="text-sm text-muted-foreground">Users</span>
            <Sparkline data={[30, 25, 35, 20, 40, 30, 45]} width={80} height={24} color="#10b981" animated />
            <span className="text-sm font-medium text-green-500">+8%</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <span className="text-sm text-muted-foreground">Bounce</span>
            <Sparkline data={[40, 35, 45, 50, 40, 55, 60]} width={80} height={24} color="#ef4444" animated />
            <span className="text-sm font-medium text-red-500">+5%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: preview },
        { value: "code", label: "Code", content: <CodeBlock code={codeExample} /> },
        {
          value: "docs",
          label: "Document",
          content: (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: docContent.replace(/\n/g, "<br/>") }} />
            </div>
          ),
        },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
