# Modal

Source: `components/ui/Modal.tsx`

Exports:

- Modal

Note: Modal đã được cải tiến để hỗ trợ các portal components (DatePicker, Popover, DropdownMenu) bên trong mà không bị đóng khi click.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                        | Status      |
| ------------------------------ | ----------- |
| Close button `aria-label`      | ✅          |
| ESC key to close               | ✅          |
| `overscroll-behavior: contain` | ✅          |
| Focus trap (recommended)       | ⚠️ Optional |
| Decorative icons `aria-hidden` | ✅          |

## Portal Detection

Modal tự động detect khi click vào các portal elements:

- DatePicker dropdown
- Popover content
- DropdownMenu items
- Tooltip
- Sheet

Điều này cho phép sử dụng các components này trong Modal mà không lo bị đóng.

## Modal

Props type: `ModalProps`

```tsx
import { Modal } from "@underverse-ui/underverse";

export function Example() {
  return <Modal>Content</Modal>;
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
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Xac nhan" description="Ban co chac chan muon tiep tuc?">
        <div className="text-sm">Day la noi dung trong modal.</div>
      </Modal>
    </>
  );
}
```

### Modal với DatePicker (Portal Support):

```tsx
import React from "react";
import { Modal, DatePicker, Button } from "@underverse-ui/underverse";

export function ModalWithDatePicker() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date>();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Chọn ngày">
        {/* DatePicker hoạt động bình thường trong Modal */}
        <DatePicker value={date} onChange={setDate} label="Ngày giao hàng" />
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Xác nhận
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

### Modal với Form đầy đủ:

```tsx
import React from "react";
import { Modal, Input, DatePicker, Combobox, Button } from "@underverse-ui/underverse";

export function FormModal() {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    date: undefined,
    category: "",
  });

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Thêm mới" size="lg">
      <div className="space-y-4">
        <Input label="Tên" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <DatePicker label="Ngày" value={formData.date} onChange={(date) => setFormData({ ...formData, date })} />
        <Combobox
          label="Danh mục"
          options={[
            { value: "1", label: "Category 1" },
            { value: "2", label: "Category 2" },
          ]}
          value={formData.category}
          onChange={(val) => setFormData({ ...formData, category: val })}
        />
      </div>
    </Modal>
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
