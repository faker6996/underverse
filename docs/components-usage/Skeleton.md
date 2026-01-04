# Skeleton

Source: `components/ui/Skeleton.tsx`

Exports:
- Skeleton
- SkeletonAvatar
- SkeletonButton
- SkeletonText
- SkeletonCard
- SkeletonPost
- SkeletonMessage
- SkeletonList
- SkeletonTable

Note: Usage snippets are minimal; fill required props from the props type below.

## Skeleton

Props type: `SkeletonProps`

```tsx
import { Skeleton } from "@underverse-ui/underverse";

export function Example() {
  return <Skeleton />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Skeleton } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Skeleton
      variant={"default"}
     />
  );
}
```

```ts
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "rectangular" | "circular" | "rounded" | "text";
  animation?: "pulse" | "wave" | "none";
  lines?: number;
}
```

## SkeletonAvatar

Props type: `SkeletonAvatarProps`

```tsx
import { SkeletonAvatar } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonAvatar />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonAvatar } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonAvatar
      size={"md"}
     />
  );
}
```

```ts
type SkeletonAvatarProps = { size?: "sm" | "md" | "lg"; className?: string };
```

## SkeletonButton

Props type: `SkeletonButtonProps`

```tsx
import { SkeletonButton } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonButton />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonButton } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonButton
      size={"md"}
     />
  );
}
```

```ts
type SkeletonButtonProps = { size?: "sm" | "md" | "lg"; className?: string };
```

## SkeletonText

Props type: `SkeletonTextProps`

```tsx
import { SkeletonText } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonText />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonText } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonText />
  );
}
```

```ts
type SkeletonTextProps = { 
  lines?: number; 
  className?: string;
  width?: string;
};
```

## SkeletonCard

Props type: `SkeletonCardProps`

```tsx
import { SkeletonCard } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonCard>
      Content
    </SkeletonCard>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonCard } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonCard>
      Noi dung
    </SkeletonCard>
  );
}
```

```ts
type SkeletonCardProps = { 
  showAvatar?: boolean;
  showImage?: boolean;
  textLines?: number;
  className?: string;
  children?: React.ReactNode;
};
```

## SkeletonPost

Props type: `SkeletonPostProps`

```tsx
import { SkeletonPost } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonPost />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonPost } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonPost />
  );
}
```

```ts
type SkeletonPostProps = { className?: string };
```

## SkeletonMessage

Props type: `SkeletonMessageProps`

```tsx
import { SkeletonMessage } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonMessage />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonMessage } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonMessage />
  );
}
```

```ts
type SkeletonMessageProps = { 
  own?: boolean; 
  showAvatar?: boolean;
  className?: string;
};
```

## SkeletonList

Props type: `SkeletonListProps`

```tsx
import { SkeletonList } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonList />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonList } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonList />
  );
}
```

```ts
type SkeletonListProps = { 
  items?: number;
  itemHeight?: number;
  showAvatar?: boolean;
  className?: string;
};
```

## SkeletonTable

Props type: `SkeletonTableProps`

```tsx
import { SkeletonTable } from "@underverse-ui/underverse";

export function Example() {
  return <SkeletonTable />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SkeletonTable } from "@underverse-ui/underverse";

export function Example() {
  return (
    <SkeletonTable />
  );
}
```

```ts
type SkeletonTableProps = { 
  rows?: number;
  columns?: number;
  className?: string;
};
```
