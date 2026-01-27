# NotificationModal

Source: `components/ui/NotificationModal.tsx`

Exports:
- NotificationModal

Note: Usage snippets are minimal; fill required props from the props type below.

## NotificationModal

Props type: `NotificationModalProps`

```tsx
import { NotificationModal } from "@underverse-ui/underverse";

export function Example() {
  return <NotificationModal />;
}
```

Vi du day du:

```tsx
import React from "react";
import { NotificationModal } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(true);
  const notification = {
    id: 1,
    title: "Don hang moi",
    body: "Ban co mot don hang moi can xu ly.",
    is_read: false,
    created_at: new Date().toISOString(),
    metadata: { link: "https://example.com" },
  };

  return (
    <NotificationModal
      isOpen={open}
      onClose={() => setOpen(false)}
      notification={notification}
    />
  );
}
```

```ts
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
  titleText?: string;
  openLinkText?: string;
  closeText?: string;
}
```
