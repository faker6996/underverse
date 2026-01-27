# OverlayControls

Source: `components/ui/OverlayControls.tsx`

Exports:
- OverlayControls

Note: Usage snippets are minimal; fill required props from the props type below.

## OverlayControls

Props type: `OverlayControlsProps`

```tsx
import { OverlayControls } from "@underverse-ui/underverse";

export function Example() {
  return <OverlayControls />;
}
```

Vi du day du:

```tsx
import React from "react";
import { OverlayControls } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <OverlayControls
      value={value}
      onChange={setValue}
      mode={undefined}
      max={1}
     />
  );
}
```

```ts
interface OverlayControlsProps {
  mode: "live" | "review";
  value: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void; // Called when user releases drag
  playing?: boolean; // review only
  onTogglePlay?: () => void; // review only
  onGoLive?: () => void; // review only: exit to live
  // Volume controls (review)
  volume?: number; // 0..1
  muted?: boolean;
  onVolumeChange?: (v: number) => void;
  onToggleMute?: () => void;
  // Playback rate (review)
  rate?: number;
  onChangeRate?: (r: number) => void;
  // Fullscreen toggle (review)
  onToggleFullscreen?: () => void;
  showOnHover?: boolean; // live: true -> only show when parent has group-hover
  className?: string;
  showTime?: boolean; // review: show current/total label
  // Skip controls (review)
  skipSeconds?: number; // default 10s
  onSkip?: (seconds: number) => void; // positive = forward, negative = backward
  // Preview thumbnail
  onSeekPreview?: (time: number) => string | undefined; // return thumbnail URL for given time
  // Auto-hide behavior
  autoHide?: boolean; // default false for review, true for live
  autoHideDelay?: number; // ms, default 3000
  // Keyboard shortcuts
  enableKeyboardShortcuts?: boolean; // default true
}
```
