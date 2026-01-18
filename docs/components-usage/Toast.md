# Toast

Source: `components/ui/Toast.tsx`

Exports:

- ToastProvider
- useToast

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                               | Status |
| ------------------------------------- | ------ |
| `aria-live="polite"` for info/success | ✅     |
| `aria-live="assertive"` for errors    | ✅     |
| Pause on hover/focus                  | ✅     |
| Dismissible with close button         | ✅     |
| `role="alert"` for error toasts       | ✅     |

## ToastProvider

Props type: `ToastProviderProps`

```tsx
import { ToastProvider } from "@underverse-ui/underverse";

export function Example() {
  return <ToastProvider>Content</ToastProvider>;
}
```

Vi du day du:

```tsx
import React from "react";
import { ToastProvider, useToast } from "@underverse-ui/underverse";

function Inner() {
  const { addToast } = useToast();
  return (
    <button type="button" onClick={() => addToast({ type: "success", message: "Luu thanh cong" })}>
      Hien toast
    </button>
  );
}

export function Example() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
```

```ts
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}
```

## useToast

Hook API

Vi du day du:

`useToast` returns `{ addToast, removeToast, toasts }` from the ToastProvider context.
