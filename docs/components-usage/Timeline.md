# Timeline

Source: `components/ui/Timeline.tsx`

Exports:
- Timeline
- TimelineItem

Note: Usage snippets are minimal; fill required props from the props type below.

## Timeline

Props type: `TimelineProps`

```tsx
import { Timeline } from "@underverse-ui/underverse";

export function Example() {
  return <Timeline />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Timeline } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Timeline
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: Align;
  variant?: Variant;
  size?: Size;
  mode?: Mode;
  lineColor?: string;
  lineStyle?: LineStyle;
  items?: TimelineItemProps[];
  itemClassName?: string;
  /** Animate items on mount */
  animate?: boolean;
  /** Compact spacing */
  dense?: boolean;
  /** Show connecting line */
  showLine?: boolean;
}
```

## TimelineItem

Props type: `TimelineItemProps`

```tsx
import { TimelineItem } from "@underverse-ui/underverse";

export function Example() {
  return <TimelineItem />;
}
```

Vi du day du:

```tsx
import React from "react";
import { TimelineItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <TimelineItem
      description={"Mo ta ngan"}
      title={"Tieu de"}
     />
  );
}
```

```ts
export interface TimelineItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  status?: "default" | "primary" | "success" | "warning" | "error" | "info";
  // Override dot and line color
  color?: string;
  // Mark current/active step
  active?: boolean;
  /** Custom dot content */
  dot?: React.ReactNode;
  /** Make item collapsible */
  collapsible?: boolean;
  /** Expanded state for collapsible */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Content to show when expanded */
  expandContent?: React.ReactNode;
  /** Custom badge/tag */
  badge?: React.ReactNode;
}
```
