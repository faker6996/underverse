# GlobalLoading

Source: `components/ui/GlobalLoading.tsx`

Exports:

- GlobalLoading
- PageLoading
- InlineLoading
- ButtonLoading

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja) cho loading text.

## i18n Support (Loading namespace)

| Locale | Loading Page          | Please Wait         |
| ------ | --------------------- | ------------------- |
| `en`   | Loading page...       | Please wait         |
| `vi`   | Đang tải trang...     | Vui lòng chờ        |
| `ko`   | 페이지 로딩 중...     | 잠시만 기다려주세요 |
| `ja`   | ページを読み込み中... | お待ちください      |

## GlobalLoading

Props type: `GlobalLoadingProps`

```tsx
import { GlobalLoading } from "@underverse-ui/underverse";

export function Example() {
  return <GlobalLoading />;
}
```

Vi du day du:

```tsx
import React from "react";
import { GlobalLoading } from "@underverse-ui/underverse";

export function Example() {
  return <GlobalLoading size={"md"} />;
}
```

```ts
interface GlobalLoadingProps {
  className?: string;
  backdrop?: boolean;
  position?: "fixed" | "absolute";
  size?: "sm" | "md" | "lg";
}
```

## PageLoading

Props type: `PageLoadingProps`

```tsx
import { PageLoading } from "@underverse-ui/underverse";

export function Example() {
  return <PageLoading />;
}
```

Vi du day du:

```tsx
import React from "react";
import { PageLoading } from "@underverse-ui/underverse";

export function Example() {
  return <PageLoading />;
}
```

```ts
interface PageLoadingProps {
  message?: string;
  className?: string;
}
```

## InlineLoading

Props type: `InlineLoadingProps`

```tsx
import { InlineLoading } from "@underverse-ui/underverse";

export function Example() {
  return <InlineLoading />;
}
```

Vi du day du:

```tsx
import React from "react";
import { InlineLoading } from "@underverse-ui/underverse";

export function Example() {
  return <InlineLoading isLoading={false} size={"md"} />;
}
```

```ts
// Inline loading component cho buttons hoặc containers nhỏ
interface InlineLoadingProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}
```

## ButtonLoading

Props type: `ButtonLoadingProps`

```tsx
import { ButtonLoading } from "@underverse-ui/underverse";

export function Example() {
  return <ButtonLoading>Content</ButtonLoading>;
}
```

Vi du day du:

```tsx
import React from "react";
import { ButtonLoading } from "@underverse-ui/underverse";

export function Example() {
  return <ButtonLoading isLoading={false}>Noi dung</ButtonLoading>;
}
```

```ts
// Button loading wrapper
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
}
```
