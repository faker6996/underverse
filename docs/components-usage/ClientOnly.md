# ClientOnly

Source: `components/ui/ClientOnly.tsx`

Exports:
- ClientOnly

Note: Usage snippets are minimal; fill required props from the props type below.

## ClientOnly

Props type: `ClientOnlyProps`

```tsx
import { ClientOnly } from "@underverse-ui/underverse";

export function Example() {
  return (
    <ClientOnly>
      Content
    </ClientOnly>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { ClientOnly } from "@underverse-ui/underverse";

export function Example() {
  return (
    <ClientOnly>
      Noi dung
    </ClientOnly>
  );
}
```

```ts
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```
