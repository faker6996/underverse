# Charts

Pure SVG chart components with CSS animations. No external chart libraries required.

## Features

- **Pure SVG** - No dependencies on recharts, chart.js, etc.
- **Animated** - Smooth CSS animations for drawing and transitions
- **Responsive** - Configurable width/height
- **Themed** - Uses system colors (`currentColor`, Tailwind classes)
- **TypeScript** - Full type definitions
- **Multi-series** - LineChart, BarChart, AreaChart, RadarChart support multiple data series with interactive legends
- **Custom Formatting** - `formatValue` callback for custom tooltip and axis label formatting
- **Interactive Legend** - Click legend items to show/hide series dynamically
- **Reference Lines** - LineChart supports horizontal reference lines with labels
- **Color Zones** - GaugeChart supports color zones for visual zones
- **Custom Center** - PieChart/DonutChart supports custom center content via `renderCenter`

## Available Charts

| Component    | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `LineChart`  | Line chart with dots, grid, labels, curved/straight. Multi-series, reference lines, custom formatting |
| `BarChart`   | Vertical or horizontal bar chart. Multi-series support (grouped & stacked)                            |
| `PieChart`   | Pie or donut chart with legend. Custom center content via `renderCenter`                              |
| `AreaChart`  | Area chart, supports multiple series and stacking                                                     |
| `Sparkline`  | Minimal inline chart for dashboards                                                                   |
| `RadarChart` | Radar/spider chart for multi-dimensional comparison                                                   |
| `GaugeChart` | Gauge with needle for metrics/KPIs. Color zones support                                               |

## Installation

```bash
npm i @underverse-ui/underverse
```

## Import

```tsx
import { LineChart, BarChart, PieChart, AreaChart, Sparkline, RadarChart, GaugeChart } from "@underverse-ui/underverse";
```

## LineChart

```tsx
import { LineChart } from "@underverse-ui/underverse";

const data = [
  { label: "Jan", value: 40 },
  { label: "Feb", value: 30 },
  { label: "Mar", value: 45 },
  { label: "Apr", value: 50 },
  { label: "May", value: 35 },
  { label: "Jun", value: 60 },
];

<LineChart data={data} width={400} height={200} color="#3b82f6" showDots showGrid showLabels showValues curved animated />;
```

### LineChart Props

| Prop             | Type                          | Default        | Description                                        |
| ---------------- | ----------------------------- | -------------- | -------------------------------------------------- |
| `data`           | `LineChartDataPoint[]`        | optional       | Array of `{ label, value }` (simple single series) |
| `series`         | `LineChartSeries[]`           | optional       | Multi-series data (overrides `data`)               |
| `width`          | `number`                      | `400`          | Chart width in pixels                              |
| `height`         | `number`                      | `200`          | Chart height in pixels                             |
| `color`          | `string`                      | `currentColor` | Line color (used when no series)                   |
| `fillColor`      | `string`                      | -              | Area fill color                                    |
| `showDots`       | `boolean`                     | `true`         | Show data points                                   |
| `showGrid`       | `boolean`                     | `true`         | Show grid lines                                    |
| `showLabels`     | `boolean`                     | `true`         | Show X-axis labels                                 |
| `showValues`     | `boolean`                     | `false`        | Show values above dots                             |
| `showLegend`     | `boolean`                     | `false`        | Show legend (auto-enabled for multi-series)        |
| `curved`         | `boolean`                     | `true`         | Use curved lines (Catmull-Rom)                     |
| `formatValue`    | `(value: number) => string`   | -              | Custom formatter for tooltip/axis values           |
| `labelClassName` | `string`                      | -              | Custom CSS class for axis labels                   |
| `referenceLines` | `{ value, label?, color? }[]` | -              | Horizontal reference lines                         |
| `animated`       | `boolean`                     | `true`         | Enable animations                                  |
| `className`      | `string`                      | -              | Additional CSS classes                             |

## BarChart

```tsx
import { BarChart } from "@underverse-ui/underverse";

const data = [
  { label: "A", value: 40, color: "#3b82f6" },
  { label: "B", value: 65, color: "#10b981" },
  { label: "C", value: 45, color: "#f59e0b" },
  { label: "D", value: 80, color: "#ef4444" },
];

// Vertical bars
<BarChart data={data} width={400} height={200} showGrid showLabels showValues animated />

// Horizontal bars
<BarChart data={data} width={400} height={200} horizontal showGrid showLabels showValues animated />
```

### BarChart Props

| Prop             | Type                        | Default        | Description                                         |
| ---------------- | --------------------------- | -------------- | --------------------------------------------------- |
| `data`           | `BarChartDataPoint[]`       | optional       | Array of `{ label, value, color? }` (simple series) |
| `series`         | `BarChartSeries[]`          | optional       | Multi-series data (overrides `data`)                |
| `width`          | `number`                    | `400`          | Chart width in pixels                               |
| `height`         | `number`                    | `200`          | Chart height in pixels                              |
| `color`          | `string`                    | `currentColor` | Default bar color                                   |
| `horizontal`     | `boolean`                   | `false`        | Horizontal bars                                     |
| `showGrid`       | `boolean`                   | `true`         | Show grid lines                                     |
| `showLabels`     | `boolean`                   | `true`         | Show axis labels                                    |
| `showValues`     | `boolean`                   | `true`         | Show values on bars                                 |
| `showLegend`     | `boolean`                   | `false`        | Show legend (auto-enabled for multi-series)         |
| `stacked`        | `boolean`                   | `false`        | Stack bars (for multi-series)                       |
| `barRadius`      | `number`                    | `4`            | Border radius of bars                               |
| `barGap`         | `number`                    | `0.3`          | Gap between bars (0-1)                              |
| `formatValue`    | `(value: number) => string` | -              | Custom formatter for values                         |
| `labelClassName` | `string`                    | -              | Custom CSS class for axis labels                    |
| `animated`       | `boolean`                   | `true`         | Enable animations                                   |

## PieChart

```tsx
import { PieChart } from "@underverse-ui/underverse";

const data = [
  { label: "Desktop", value: 45, color: "#3b82f6" },
  { label: "Mobile", value: 35, color: "#10b981" },
  { label: "Tablet", value: 20, color: "#f59e0b" },
];

// Pie chart
<PieChart data={data} size={200} showLabels showLegend showPercentage animated />

// Donut chart
<PieChart data={data} size={200} donut donutWidth={40} showLabels showLegend animated />
```

### PieChart Props

| Prop             | Type                             | Default  | Description                        |
| ---------------- | -------------------------------- | -------- | ---------------------------------- |
| `data`           | `PieChartDataPoint[]`            | required | Array of `{ label, value, color }` |
| `size`           | `number`                         | `200`    | Chart size in pixels               |
| `donut`          | `boolean`                        | `false`  | Render as donut chart              |
| `donutWidth`     | `number`                         | `40`     | Width of donut ring                |
| `showLabels`     | `boolean`                        | `true`   | Show labels around chart           |
| `showLegend`     | `boolean`                        | `true`   | Show legend                        |
| `showPercentage` | `boolean`                        | `true`   | Show percentages                   |
| `formatValue`    | `(value: number) => string`      | -        | Custom formatter for values        |
| `labelClassName` | `string`                         | -        | Custom CSS class for labels        |
| `renderCenter`   | `({ total }) => React.ReactNode` | -        | Custom center content (donut only) |
| `startAngle`     | `number`                         | `-90`    | Starting angle in degrees          |
| `animated`       | `boolean`                        | `true`   | Enable animations                  |

## AreaChart

```tsx
import { AreaChart } from "@underverse-ui/underverse";

const series = [
  {
    name: "Revenue",
    color: "#3b82f6",
    data: [
      { label: "Jan", value: 40 },
      { label: "Feb", value: 30 },
      { label: "Mar", value: 45 },
    ],
  },
  {
    name: "Profit",
    color: "#10b981",
    data: [
      { label: "Jan", value: 20 },
      { label: "Feb", value: 15 },
      { label: "Mar", value: 25 },
    ],
  },
];

<AreaChart series={series} width={400} height={200} showDots showGrid showLabels showLegend curved stacked={false} animated />;
```

### AreaChart Props

| Prop             | Type                        | Default  | Description                            |
| ---------------- | --------------------------- | -------- | -------------------------------------- |
| `series`         | `AreaChartSeries[]`         | required | Array of series with name, color, data |
| `width`          | `number`                    | `400`    | Chart width in pixels                  |
| `height`         | `number`                    | `200`    | Chart height in pixels                 |
| `showDots`       | `boolean`                   | `true`   | Show data points                       |
| `showGrid`       | `boolean`                   | `true`   | Show grid lines                        |
| `showLabels`     | `boolean`                   | `true`   | Show X-axis labels                     |
| `showLegend`     | `boolean`                   | `true`   | Show legend                            |
| `stacked`        | `boolean`                   | `false`  | Stack areas                            |
| `curved`         | `boolean`                   | `true`   | Use curved lines                       |
| `formatValue`    | `(value: number) => string` | -        | Custom formatter for values            |
| `labelClassName` | `string`                    | -        | Custom CSS class for axis labels       |
| `animated`       | `boolean`                   | `true`   | Enable animations                      |

## RadarChart

```tsx
import { RadarChart } from "@underverse-ui/underverse";

const series = [
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
];

<RadarChart series={series} size={300} showLabels showLegend animated />;
```

### RadarChart Props

| Prop             | Type                        | Default  | Description                            |
| ---------------- | --------------------------- | -------- | -------------------------------------- |
| `series`         | `RadarChartSeries[]`        | required | Array of series with name, color, data |
| `size`           | `number`                    | `300`    | Chart size in pixels                   |
| `levels`         | `number`                    | `5`      | Number of concentric levels            |
| `showLabels`     | `boolean`                   | `true`   | Show axis labels                       |
| `showLegend`     | `boolean`                   | `true`   | Show legend                            |
| `showValues`     | `boolean`                   | `false`  | Show values at data points             |
| `formatValue`    | `(value: number) => string` | -        | Custom formatter for values            |
| `labelClassName` | `string`                    | -        | Custom CSS class for axis labels       |
| `animated`       | `boolean`                   | `true`   | Enable animations                      |

## GaugeChart

```tsx
import { GaugeChart } from "@underverse-ui/underverse";

<GaugeChart value={72} min={0} max={100} size={200} color="#3b82f6" label="Score" animated />;
```

### GaugeChart Props

| Prop              | Type                        | Default        | Description                       |
| ----------------- | --------------------------- | -------------- | --------------------------------- |
| `value`           | `number`                    | required       | Current value                     |
| `min`             | `number`                    | `0`            | Minimum value                     |
| `max`             | `number`                    | `100`          | Maximum value                     |
| `size`            | `number`                    | `200`          | Chart size in pixels              |
| `thickness`       | `number`                    | `20`           | Arc thickness                     |
| `color`           | `string`                    | `currentColor` | Arc color                         |
| `backgroundColor` | `string`                    | -              | Background arc color              |
| `showValue`       | `boolean`                   | `true`         | Show value in center              |
| `showMinMax`      | `boolean`                   | `true`         | Show min/max labels               |
| `label`           | `string`                    | -              | Label text below value            |
| `formatValue`     | `(value: number) => string` | -              | Custom formatter for center value |
| `labelClassName`  | `string`                    | -              | Custom CSS class for label text   |
| `zones`           | `{ min, max, color }[]`     | -              | Color zone arcs on background     |
| `startAngle`      | `number`                    | `-135`         | Starting angle in degrees         |
| `endAngle`        | `number`                    | `135`          | Ending angle in degrees           |
| `animated`        | `boolean`                   | `true`         | Enable animations                 |

## Sparkline

Minimal inline charts for dashboards and compact displays.

```tsx
import { Sparkline } from "@underverse-ui/underverse";

// Simple usage with number array
<Sparkline data={[10, 25, 15, 30, 20, 35]} width={100} height={30} color="#3b82f6" animated />

// Dashboard usage
<div className="flex items-center gap-3">
  <span>Revenue</span>
  <Sparkline data={[10, 25, 15, 30, 20, 35, 45]} width={80} height={24} color="#10b981" />
  <span className="text-green-500">+12%</span>
</div>
```

### Sparkline Props

| Prop          | Type                                 | Default        | Description            |
| ------------- | ------------------------------------ | -------------- | ---------------------- |
| `data`        | `number[]` or `SparklineDataPoint[]` | required       | Data values            |
| `width`       | `number`                             | `100`          | Chart width in pixels  |
| `height`      | `number`                             | `30`           | Chart height in pixels |
| `color`       | `string`                             | `currentColor` | Line color             |
| `fillColor`   | `string`                             | -              | Area fill color        |
| `showFill`    | `boolean`                            | `true`         | Show area fill         |
| `showDots`    | `boolean`                            | `false`        | Show all data points   |
| `showEndDot`  | `boolean`                            | `true`         | Show only end point    |
| `curved`      | `boolean`                            | `true`         | Use curved lines       |
| `strokeWidth` | `number`                             | `2`            | Line stroke width      |
| `animated`    | `boolean`                            | `true`         | Enable animations      |

## Common Props

All chart components share these common props:

| Prop        | Type      | Default | Description               |
| ----------- | --------- | ------- | ------------------------- |
| `animated`  | `boolean` | `true`  | Enable/disable animations |
| `className` | `string`  | -       | Additional CSS classes    |

## Styling

Charts use `currentColor` by default, making them easy to style with Tailwind:

```tsx
<div className="text-blue-500">
  <LineChart data={data} /> {/* Will be blue */}
</div>

<div className="text-green-500">
  <Sparkline data={values} /> {/* Will be green */}
</div>
```

## TypeScript Types

```tsx
// LineChart
interface LineChartDataPoint {
  label: string;
  value: number;
}

// BarChart
interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// PieChart
interface PieChartDataPoint {
  label: string;
  value: number;
  color: string;
}

// AreaChart
interface AreaChartDataPoint {
  label: string;
  value: number;
}

interface AreaChartSeries {
  name: string;
  data: AreaChartDataPoint[];
  color: string;
  fillOpacity?: number;
}

// RadarChart
interface RadarChartDataPoint {
  axis: string;
  value: number;
}

interface RadarChartSeries {
  name: string;
  data: RadarChartDataPoint[];
  color: string;
  fillOpacity?: number;
}

// Sparkline
interface SparklineDataPoint {
  value: number;
}
```
