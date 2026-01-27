# Badge

Source: `components/ui/Badge.tsx`

Exports:
- Badge
- BadgeBase
- NotificationBadge
- StatusBadge
- TagBadge
- InteractiveBadge
- GradientBadge
- PulseBadge

Note: Usage snippets are minimal; fill required props from the props type below.

## Badge

Props type: `BadgeProps`

```tsx
import { Badge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Badge>
      Content
    </Badge>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Badge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Badge variant="success" count={12} maxCount={99} showZero>
      Don hang
    </Badge>
  );
}
```

```ts
interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "destructive" | "info" | "outline" | "ghost" | "transparent" | "gradient";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  clickable?: boolean;
  onClick?: () => void;
}
```

## BadgeBase

Props type: `BadgeProps`

```tsx
import { BadgeBase } from "@underverse-ui/underverse";

export function Example() {
  return (
    <BadgeBase>
      Content
    </BadgeBase>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { BadgeBase } from "@underverse-ui/underverse";

export function Example() {
  return (
    <BadgeBase
      variant={"default"}
      size={"md"}
      count={1}
    >
      Noi dung
    </BadgeBase>
  );
}
```

```ts
interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "destructive" | "info" | "outline" | "ghost" | "transparent" | "gradient";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  clickable?: boolean;
  onClick?: () => void;
}
```

## NotificationBadge

Props type: `NotificationBadgeProps`

```tsx
import { NotificationBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <NotificationBadge>
      Content
    </NotificationBadge>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { NotificationBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <NotificationBadge
      variant={"default"}
      size={"md"}
      count={1}
    >
      Noi dung
    </NotificationBadge>
  );
}
```

```ts
// Notification Badge component - wrapper for positioning badges over other elements
interface NotificationBadgeProps {
  children: React.ReactNode;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  dot?: boolean;
  variant?: BadgeProps["variant"];
  size?: BadgeProps["size"];
  className?: string;
  badgeClassName?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  pulse?: boolean;
}
```

## StatusBadge

Props type: `StatusBadgeProps`

```tsx
import { StatusBadge } from "@underverse-ui/underverse";

export function Example() {
  return <StatusBadge />;
}
```

Vi du day du:

```tsx
import React from "react";
import { StatusBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <StatusBadge />
  );
}
```

```ts
// Specialized Badge components
interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status?: "online" | "offline" | "busy" | "away" | "idle";
}
```

## TagBadge

Props type: `TagBadgeProps`

```tsx
import { TagBadge } from "@underverse-ui/underverse";

export function Example() {
  return <TagBadge />;
}
```

Vi du day du:

```tsx
import React from "react";
import { TagBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <TagBadge />
  );
}
```

```ts
interface TagBadgeProps extends Omit<BadgeProps, "removable"> {
  tags?: string[];
  onTagRemove?: (tag: string) => void;
  maxTags?: number;
}
```

## InteractiveBadge

Props type: `InteractiveBadgeProps`

```tsx
import { InteractiveBadge } from "@underverse-ui/underverse";

export function Example() {
  return <InteractiveBadge />;
}
```

Vi du day du:

```tsx
import React from "react";
import { InteractiveBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <InteractiveBadge />
  );
}
```

```ts
interface InteractiveBadgeProps extends BadgeProps {
  active?: boolean;
  disabled?: boolean;
}
```

## GradientBadge

Props type: `GradientBadgeProps`

```tsx
import { GradientBadge } from "@underverse-ui/underverse";

export function Example() {
  return <GradientBadge />;
}
```

Vi du day du:

```tsx
import React from "react";
import { GradientBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <GradientBadge />
  );
}
```

```ts
interface GradientBadgeProps extends Omit<BadgeProps, "variant"> {
  from?: string;
  to?: string;
}
```

## PulseBadge

Props type: `PulseBadgeProps`

```tsx
import { PulseBadge } from "@underverse-ui/underverse";

export function Example() {
  return <PulseBadge />;
}
```

Vi du day du:

```tsx
import React from "react";
import { PulseBadge } from "@underverse-ui/underverse";

export function Example() {
  return (
    <PulseBadge />
  );
}
```

```ts
interface PulseBadgeProps extends BadgeProps {
  speed?: "slow" | "normal" | "fast";
}
```
