# TagInput

Source: `components/ui/TagInput.tsx`

Exports:
- TagInput
- TagInputBase

Note: Usage snippets are minimal; fill required props from the props type below.

## TagInput

Props type: `TagInputProps`

```tsx
import { TagInput } from "@underverse-ui/underverse";

export function Example() {
  return <TagInput />;
}
```

Vi du day du:

```tsx
import React from "react";
import { TagInput } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <TagInput
      value={value}
      onChange={setValue}
      onSearch={"Gia tri"}
      label={"Nhan"}
      placeholder={"Nhap..."}
     />
  );
}
```

```ts
export interface TagInputProps {
  /** Danh sách tags hiện tại */
  value: string[];

  /** Callback khi danh sách tags thay đổi */
  onChange: (tags: string[]) => void;

  /** Callback khi user muốn tìm kiếm (Ctrl+Enter hoặc click Search) */
  onSearch: (tags: string[]) => void;

  /** Callback when all tags are cleared */
  onClear?: () => void;

  /** Placeholder khi chưa có tags */
  placeholder?: string;

  /** Placeholder khi đã có tags */
  placeholderWithTags?: string;

  /** Label hiển thị phía trên input */
  label?: string;

  /** Ẩn nút Search */
  hideSearchButton?: boolean;

  /** Ẩn nút Clear All */
  hideClearButton?: boolean;

  /** Custom class cho container */
  className?: string;

  /** Size: 'sm' | 'md' | 'lg' */
  size?: "sm" | "md" | "lg";

  /** Disabled state */
  disabled?: boolean;

  /** Loading state - hiển thị spinner trên nút Search */
  loading?: boolean;

  /** Maximum number of tags allowed */
  maxTags?: number;

  /** i18n labels - no external dependency required */
  labels?: {
    search?: string;
    clearAll?: string;
    placeholder?: string;
    placeholderWithTags?: string;
    moreCount?: string; // e.g. "+{count} more" - use {count} as placeholder
  };

  /** Maximum visible tags before showing "+N more" badge */
  maxVisibleTags?: number;
}
```

## TagInputBase

Props type: `TagInputProps`

```tsx
import { TagInputBase } from "@underverse-ui/underverse";

export function Example() {
  return <TagInputBase />;
}
```

Vi du day du:

```tsx
import React from "react";
import { TagInputBase } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <TagInputBase
      value={value}
      onChange={setValue}
      onSearch={"Gia tri"}
      label={"Nhan"}
      placeholder={"Nhap..."}
     />
  );
}
```

```ts
export interface TagInputProps {
  /** Danh sách tags hiện tại */
  value: string[];

  /** Callback khi danh sách tags thay đổi */
  onChange: (tags: string[]) => void;

  /** Callback khi user muốn tìm kiếm (Ctrl+Enter hoặc click Search) */
  onSearch: (tags: string[]) => void;

  /** Callback when all tags are cleared */
  onClear?: () => void;

  /** Placeholder khi chưa có tags */
  placeholder?: string;

  /** Placeholder khi đã có tags */
  placeholderWithTags?: string;

  /** Label hiển thị phía trên input */
  label?: string;

  /** Ẩn nút Search */
  hideSearchButton?: boolean;

  /** Ẩn nút Clear All */
  hideClearButton?: boolean;

  /** Custom class cho container */
  className?: string;

  /** Size: 'sm' | 'md' | 'lg' */
  size?: "sm" | "md" | "lg";

  /** Disabled state */
  disabled?: boolean;

  /** Loading state - hiển thị spinner trên nút Search */
  loading?: boolean;

  /** Maximum number of tags allowed */
  maxTags?: number;

  /** i18n labels - no external dependency required */
  labels?: {
    search?: string;
    clearAll?: string;
    placeholder?: string;
    placeholderWithTags?: string;
    moreCount?: string; // e.g. "+{count} more" - use {count} as placeholder
  };

  /** Maximum visible tags before showing "+N more" badge */
  maxVisibleTags?: number;
}
```
