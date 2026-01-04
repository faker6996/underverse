# Modal

Source: `components/ui/Modal.tsx`

Exports:
- Modal

Note: Usage snippets are minimal; fill required props from the props type below.

## Modal

Props type: `ModalProps`

```tsx
import { Modal } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Modal>
      Content
    </Modal>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Modal } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mo modal
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Xac nhan"
        description="Ban co chac chan muon tiep tuc?"
      >
        <div className="text-sm">Day la noi dung trong modal.</div>
      </Modal>
    </>
  );
}
```

```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  noPadding?: boolean;
  fullWidth?: boolean;
  width?: string | number;
  height?: string | number;
}
```
