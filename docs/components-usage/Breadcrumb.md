# Breadcrumb

Source: `components/ui/Breadcrumb.tsx`

Exports:
- Breadcrumb

Note: Usage snippets are minimal; fill required props from the props type below.

## Breadcrumb

Props type: `BreadcrumbProps`

```tsx
import { Breadcrumb } from "@underverse-ui/underverse";

export function Example() {
  return <Breadcrumb />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Breadcrumb } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Breadcrumb
      items={undefined}
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ComponentType<{ className?: string }> | string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "simple" | "slash" | "arrow" | "pill";
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  collapsible?: boolean;
}
```
