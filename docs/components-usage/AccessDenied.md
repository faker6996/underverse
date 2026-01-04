# AccessDenied

Source: `components/ui/AccessDenied.tsx`

Exports:
- AccessDenied

Note: Usage snippets are minimal; fill required props from the props type below.

## AccessDenied

Props type: `AccessDeniedProps`

```tsx
import { AccessDenied } from "@underverse-ui/underverse";

export function Example() {
  return (
    <AccessDenied>
      Content
    </AccessDenied>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { AccessDenied } from "@underverse-ui/underverse";

export function Example() {
  return (
    <AccessDenied
      description={"Mo ta ngan"}
      variant={"default"}
      title={"Tieu de"}
    >
      Noi dung
    </AccessDenied>
  );
}
```

```ts
interface AccessDeniedProps {
  title?: string;
  description?: string;
  variant?: Variant;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode; // actions
}
```
