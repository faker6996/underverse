# Progress

Source: `components/ui/Progress.tsx`

Exports:
- Progress
- CircularProgress
- StepProgress
- MiniProgress
- BatteryProgress
- SegmentedProgress
- LoadingProgress

Note: Usage snippets are minimal; fill required props from the props type below.

## Progress

Props type: `ProgressProps`

```tsx
import { Progress } from "@underverse-ui/underverse";

export function Example() {
  return <Progress />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Progress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Progress
      value={1}
      label={"Nhan"}
      description={"Mo ta ngan"}
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  description?: string;
  status?: "normal" | "error" | "complete";
}
```

## CircularProgress

Props type: `CircularProgressProps`

```tsx
import { CircularProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <CircularProgress>
      Content
    </CircularProgress>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { CircularProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <CircularProgress
      value={1}
      variant={"default"}
      size={"md"}
    >
      Noi dung
    </CircularProgress>
  );
}
```

```ts
// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  showValue?: boolean;
  children?: React.ReactNode;
  indeterminate?: boolean;
  status?: "normal" | "error" | "complete";
  trackColor?: string;
}
```

## StepProgress

Props type: `StepProgressProps`

```tsx
import { StepProgress } from "@underverse-ui/underverse";

export function Example() {
  return <StepProgress />;
}
```

Vi du day du:

```tsx
import React from "react";
import { StepProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <StepProgress
      steps={"Gia tri"}
      currentStep={1}
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
// Multi-step Progress Component
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}
```

## MiniProgress

Props type: `MiniProgressProps`

```tsx
import { MiniProgress } from "@underverse-ui/underverse";

export function Example() {
  return <MiniProgress />;
}
```

Vi du day du:

```tsx
import React from "react";
import { MiniProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <MiniProgress
      value={1}
      variant={"default"}
     />
  );
}
```

```ts
// Mini Progress - compact version for tight spaces
interface MiniProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  showValue?: boolean;
}
```

## BatteryProgress

Props type: `BatteryProgressProps`

```tsx
import { BatteryProgress } from "@underverse-ui/underverse";

export function Example() {
  return <BatteryProgress />;
}
```

Vi du day du:

```tsx
import React from "react";
import { BatteryProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <BatteryProgress
      value={1}
     />
  );
}
```

```ts
// Battery Progress - for battery/power indicators
interface BatteryProgressProps {
  value: number;
  max?: number;
  className?: string;
  charging?: boolean;
  showValue?: boolean;
}
```

## SegmentedProgress

Props type: `SegmentedProgressProps`

```tsx
import { SegmentedProgress } from "@underverse-ui/underverse";

export function Example() {
  return <SegmentedProgress />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SegmentedProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SegmentedProgress
      segments={1}
      activeSegments={1}
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
// Segmented Progress - for multi-segment indicators
interface SegmentedProgressProps {
  segments: number;
  activeSegments: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}
```

## LoadingProgress

Props type: `LoadingProgressProps`

```tsx
import { LoadingProgress } from "@underverse-ui/underverse";

export function Example() {
  return <LoadingProgress />;
}
```

Vi du day du:

```tsx
import React from "react";
import { LoadingProgress } from "@underverse-ui/underverse";

export function Example() {
  return (
    <LoadingProgress
      value={1}
      label={"Nhan"}
      variant={"default"}
     />
  );
}
```

```ts
// Loading Progress - for file uploads, downloads etc
interface LoadingProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  label?: string;
  status?: "loading" | "complete" | "error" | "paused";
  speed?: string;
  timeRemaining?: string;
}
```
