# Grid

Source: `components/ui/Grid.tsx`

Exports:
- Grid
- GridItem

Note: Usage snippets are minimal; fill required props from the props type below.

## Grid

Props type: `GridProps`

```tsx
import { Grid } from "@underverse-ui/underverse";

export function Example() {
  return <Grid />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Grid } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Grid
      variant={"default"}
     />
  );
}
```

```ts
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns or full template string. Default: 12 (1fr each). */
  columns?: number | string;
  /** Number of rows or full template string. */
  rows?: number | string;
  /** Overall gap (shorthand). */
  gap?: number | string;
  /** Horizontal gap. */
  gapX?: number | string;
  /** Vertical gap. */
  gapY?: number | string;
  /** Auto rows value (e.g. 'minmax(100px, auto)'). */
  autoRows?: string;
  /** Auto columns value (e.g. 'minmax(100px, 1fr)'). */
  autoColumns?: string;
  /** Grid auto-flow direction and density. */
  autoFlow?: GridAutoFlow;
  /** Use auto-fit with a min width to create responsive columns. */
  minColumnWidth?: number | string;
  /** CSS grid-template-areas. Provide full string or joined lines. */
  areas?: string | string[];
  /** Item alignment within cells. */
  alignItems?: React.CSSProperties["alignItems"];
  justifyItems?: React.CSSProperties["justifyItems"];
  /** Grid content alignment. */
  alignContent?: React.CSSProperties["alignContent"];
  justifyContent?: React.CSSProperties["justifyContent"];
  /** Responsive overrides by breakpoint (Tailwind defaults). */
  responsive?: Partial<Record<Breakpoint, ResponsiveConfig>>;
  /** Visual variant style. */
  variant?: GridVariant;
  /** Enable smooth animations for grid layout changes. */
  animated?: boolean;
  /** Apply Card-like outline (rounded + border + bg-card). @deprecated Use variant="card" instead */
  outlined?: boolean;
}
```

## GridItem

Props type: `GridItemProps`

```tsx
import { GridItem } from "@underverse-ui/underverse";

export function Example() {
  return <GridItem />;
}
```

Vi du day du:

```tsx
import React from "react";
import { GridItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <GridItem />
  );
}
```

```ts
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span (e.g., 3 => span 3). */
  colSpan?: number | string;
  /** Row span. */
  rowSpan?: number | string;
  /** Column start line. */
  colStart?: number | string;
  /** Column end line. */
  colEnd?: number | string;
  /** Row start line. */
  rowStart?: number | string;
  /** Row end line. */
  rowEnd?: number | string;
  /** Named area (must match container areas). */
  area?: string;
  /** Item alignment override. */
  alignSelf?: React.CSSProperties["alignSelf"];
  justifySelf?: React.CSSProperties["justifySelf"];
  /** Order of the item in the grid. */
  order?: number;
  /** Add hover effect. */
  hoverable?: boolean;
  /** Add animation delay (in ms). */
  animationDelay?: number;
}
```
