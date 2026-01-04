# Alert

Source: `components/ui/Alert.tsx`

Exports:
- Alert

Note: Usage snippets are minimal; fill required props from the props type below.

## Alert

Props type: `AlertProps`

```tsx
import { Alert } from "@underverse-ui/underverse";

export function Example() {
  return <Alert />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Alert } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Alert
      description={"Mo ta ngan"}
      variant={"default"}
      title={"Tieu de"}
     />
  );
}
```

```ts
interface AlertProps {
  title?: string;
  description?: ReactNode;
  variant?: AlertVariant;
  className?: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  actions?: ReactNode;
  closeAriaLabel?: string;
}
```
