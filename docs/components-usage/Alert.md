# Alert

Source: `components/ui/Alert.tsx`

Exports:

- Alert

Note: Component hỗ trợ đa ngôn ngữ cho nút đóng (en, vi, ko, ja).

## Accessibility (Web Interface Guidelines Compliant)

| Feature                              | Status |
| ------------------------------------ | ------ |
| `role="alert"`                       | ✅     |
| Dismissible with `aria-label`        | ✅     |
| `focus-visible` ring on close button | ✅     |
| Visual variant icons                 | ✅     |

## i18n Support

| Locale | Close Button Aria Label |
| ------ | ----------------------- |
| `en`   | Close alert             |
| `vi`   | Đóng thông báo          |
| `ko`   | 알림 닫기               |
| `ja`   | アラートを閉じる        |

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
  return <Alert description={"Mo ta ngan"} variant={"default"} title={"Tieu de"} />;
}
```

### Với TranslationProvider:

```tsx
import { TranslationProvider, Alert } from "@underverse-ui/underverse";

export function App() {
  return (
    <TranslationProvider locale="ja">
      <Alert title="警告" description="これは警告メッセージです" variant="warning" dismissible />
      {/* Nút đóng sẽ có aria-label: アラートを閉じる */}
    </TranslationProvider>
  );
}
```

### Override close label:

```tsx
<Alert title="Custom" description="With custom close label" dismissible closeAriaLabel="閉じる (custom)" />
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
