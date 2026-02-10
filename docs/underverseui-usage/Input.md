# Input

Source: `components/ui/Input.tsx`

Exports:

- Input
- PasswordInput
- NumberInput
- SearchInput

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja) cho validation messages.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                             | Status |
| ----------------------------------- | ------ |
| Label `htmlFor` attribute           | ✅     |
| `aria-invalid` for errors           | ✅     |
| `aria-describedby` for descriptions | ✅     |
| `focus-visible` ring                | ✅     |
| Proper `autocomplete`               | ✅     |

## i18n Support (ValidationInput namespace)

| Locale | Required               | Too Short     | Too Long    |
| ------ | ---------------------- | ------------- | ----------- |
| `en`   | This field is required | Too short     | Too long    |
| `vi`   | Trường này bắt buộc    | Quá ngắn      | Quá dài     |
| `ko`   | 이 필드는 필수입니다   | 너무 짧습니다 | 너무 깁니다 |
| `ja`   | この項目は必須です     | 短すぎます    | 長すぎます  |

## Input

Props type: `InputProps`

```tsx
import { Input } from "@underverse-ui/underverse";

export function Example() {
  return <Input />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Input } from "@underverse-ui/underverse";

export function Example() {
  return <Input label={"Nhan"} description={"Mo ta ngan"} variant={"default"} size={"md"} placeholder="Nhap..." />;
}
```

```ts
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  labelClassName?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined" | "minimal";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  clearable?: boolean;
  loading?: boolean;
  success?: boolean;
  onClear?: () => void;
  hint?: string;
  counter?: boolean;
  maxLength?: number;
}
```

## PasswordInput

Props type: `PasswordInputProps`

```tsx
import { PasswordInput } from "@underverse-ui/underverse";

export function Example() {
  return <PasswordInput />;
}
```

Vi du day du:

```tsx
import React from "react";
import { PasswordInput } from "@underverse-ui/underverse";

export function Example() {
  return <PasswordInput placeholder="Nhap..." />;
}
```

```ts
// Password Input - enhanced password field
interface PasswordInputProps extends Omit<InputProps, "type"> {
  showStrength?: boolean;
  strengthLabels?: string[];
}
```

## NumberInput

Props type: `NumberInputProps`

```tsx
import { NumberInput } from "@underverse-ui/underverse";

export function Example() {
  return <NumberInput />;
}
```

Vi du day du:

```tsx
import React from "react";
import { NumberInput } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return <NumberInput value={value} onChange={setValue} placeholder="Nhap..." />;
}
```

```ts
// Number Input - enhanced numeric input
interface NumberInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  min?: number;
  max?: number;
  step?: number;
  showSteppers?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  formatThousands?: boolean;
  locale?: string;
  value?: number | string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}
```

## SearchInput

Props type: `SearchInputProps`

```tsx
import { SearchInput } from "@underverse-ui/underverse";

export function Example() {
  return <SearchInput />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SearchInput } from "@underverse-ui/underverse";

export function Example() {
  return <SearchInput placeholder="Nhap..." />;
}
```

```ts
// Search Input - specialized for search functionality
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "type"> {
  onSearch?: (value: string) => void;
  searchDelay?: number;
}
```
