# ScrollArea

Source: `components/ui/ScrollArea.tsx`

Exports:
- ScrollArea

Note: Usage snippets are minimal; fill required props from the props type below.

## ScrollArea

Props type: `ScrollAreaProps`

```tsx
import { ScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return <ScrollArea />;
}
```

Vi du day du:

```tsx
import React from "react";
import { ScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return (
    <ScrollArea />
  );
}
```

```ts
interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```
