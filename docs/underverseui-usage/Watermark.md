# Watermark

Source: `components/ui/Watermark.tsx`

Exports:
- Watermark

Note: Usage snippets are minimal; fill required props from the props type below.

## Watermark

Props type: `WatermarkProps`

```tsx
import { Watermark } from "@underverse-ui/underverse";

export function Example() {
  return <Watermark />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Watermark } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Watermark />
  );
}
```

```ts
export interface WatermarkProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string | string[]; // text watermark (support multi-line)
  image?: string; // image src watermark
  width?: number; // pattern tile width (content box)
  height?: number; // pattern tile height (content box)
  gapX?: number; // horizontal gap between tiles
  gapY?: number; // vertical gap between tiles
  rotate?: number; // degrees
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  color?: string; // text color
  /** Use gradient colors */
  gradient?: string;
  opacity?: number; // overall layer opacity (0..1)
  offsetLeft?: number; // background-position x
  offsetTop?: number; // background-position y
  zIndex?: number;
  fullPage?: boolean; // fixed overlay over entire viewport
  /** Preset watermark styles */
  preset?: WatermarkPreset;
  /** Pattern layout */
  pattern?: WatermarkPattern;
  /** Enable interactive mode (click to toggle) */
  interactive?: boolean;
  /** Animation effect */
  animate?: boolean;
  /** Animation variant */
  animationVariant?: AnimationVariant;
  /** Enable backdrop blur */
  blur?: boolean;
  /** Blur amount in pixels */
  blurAmount?: number;
  /** Enable text shadow */
  textShadow?: boolean;
  /** Text shadow color */
  shadowColor?: string;
  /** Enable dark mode auto-adjust */
  darkMode?: boolean;
  /** Class for the overlay layer */
  overlayClassName?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}
```
