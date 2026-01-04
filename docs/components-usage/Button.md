# Button

Source: `components/ui/Button.tsx`

Exports:
- Button

Note: Usage snippets are minimal; fill required props from the props type below.

## Button

Props type: `ButtonProps`

```tsx
import { Button } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Button>
      Content
    </Button>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Button } from "@underverse-ui/underverse";

export function Example() {
  const [loading, setLoading] = React.useState(false);

  return (
    <Button
      variant="primary"
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
      }}
    >
      Luu thay doi
    </Button>
  );
}
```

```ts
// Khai báo kiểu cho props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  icon?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
  variant?: keyof typeof VARIANT_STYLES_BTN;
  size?: keyof typeof SIZE_STYLES_BTN;
  className?: string;
  iConClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  title?: string;
  // Nâng cấp: tuỳ biến spinner & UX khi loading
  spinner?: React.ComponentType<{ className?: string }>;
  loadingText?: React.ReactNode;
  preserveChildrenOnLoading?: boolean; // giữ nguyên children khi loading
  // Chống double-click vô ý
  preventDoubleClick?: boolean;
  lockMs?: number; // thời gian khóa nếu onClick không trả Promise
  // Layout flexibility
  asContainer?: boolean; // cho phép children tự do layout (không force items-center)
  // Ngăn xuống dòng khiến icon nằm trên, text nằm dưới
  noWrap?: boolean; // mặc định: true
  // Tắt overlay gradient hover mặc định
  noHoverOverlay?: boolean;
  // Bật nền gradient (alias cho variant="gradient")
  gradient?: boolean;
}
```
