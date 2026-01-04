# Loading

Source: `components/ui/Loading.tsx`

Exports:
- LoadingSpinner
- LoadingDots
- LoadingBar
- InlineLoading

Note: Usage snippets are minimal; fill required props from the props type below.

## LoadingSpinner

Props type: `LoadingSpinnerProps`

```tsx
import { LoadingSpinner } from "@underverse-ui/underverse";

export function Example() {
  return <LoadingSpinner />;
}
```

Vi du day du:

```tsx
import React from "react";
import { LoadingSpinner } from "@underverse-ui/underverse";

export function Example() {
  return (
    <LoadingSpinner
      size={"md"}
     />
  );
}
```

```ts
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'foreground' | 'muted';
}
```

## LoadingDots

Props type: `LoadingDotsProps`

```tsx
import { LoadingDots } from "@underverse-ui/underverse";

export function Example() {
  return <LoadingDots />;
}
```

Vi du day du:

```tsx
import React from "react";
import { LoadingDots } from "@underverse-ui/underverse";

export function Example() {
  return (
    <LoadingDots />
  );
}
```

```ts
interface LoadingDotsProps {
  className?: string;
  color?: 'primary' | 'foreground' | 'muted';
}
```

## LoadingBar

Props type: `LoadingBarProps`

```tsx
import { LoadingBar } from "@underverse-ui/underverse";

export function Example() {
  return <LoadingBar />;
}
```

Vi du day du:

```tsx
import React from "react";
import { LoadingBar } from "@underverse-ui/underverse";

export function Example() {
  return (
    <LoadingBar
      label={"Nhan"}
     />
  );
}
```

```ts
interface LoadingBarProps {
  progress?: number; // 0-100
  className?: string;
  animated?: boolean;
  label?: string;
}
```

## InlineLoading

Props type: `InlineLoadingProps`

```tsx
import { InlineLoading } from "@underverse-ui/underverse";

export function Example() {
  return <InlineLoading />;
}
```

Vi du day du:

```tsx
import React from "react";
import { InlineLoading } from "@underverse-ui/underverse";

export function Example() {
  return (
    <InlineLoading
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots';
  className?: string;
}
```
