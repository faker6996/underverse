# FallingIcons

Source: `components/ui/FallingIcons.tsx`

Exports:
- FallingIcons

Note: Usage snippets are minimal; fill required props from the props type below.

## FallingIcons

Props type: `FallingIconsProps`

```tsx
import { FallingIcons } from "@underverse-ui/underverse";

export function Example() {
  return <FallingIcons />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FallingIcons } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FallingIcons
      count={1}
     />
  );
}
```

```ts
export interface FallingIconsProps {
  icon?: IconComponent;
  imageUrl?: string; // Custom image URL to use instead of icon
  count?: number;
  className?: string;
  areaClassName?: string;
  colorClassName?: string;
  zIndex?: number;
  speedRange?: [number, number]; // seconds
  sizeRange?: [number, number]; // px
  horizontalDrift?: number; // px amplitude
  spin?: boolean;
  fullScreen?: boolean;
  // Randomize properties again each time a particle finishes a fall
  randomizeEachLoop?: boolean;
  // Modern UI enhancements
  glow?: boolean; // Add glow/shadow effect
  glowColor?: string; // Custom glow color
  glowIntensity?: number; // 0-1
  trail?: boolean; // Add particle trail effect
  trailLength?: number; // Number of trail particles (1-5)
  physics?: {
    gravity?: number; // 0.5-2, default 1
    windDirection?: number; // -1 (left) to 1 (right), default 0
    windStrength?: number; // 0-1
    rotation?: boolean; // Physics-based rotation
  };
  easingFunction?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "bounce" | "elastic";
}
```
