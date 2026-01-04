# CategoryTreeSelect

Source: `components/ui/CategoryTreeSelect.tsx`

Exports:
- CategoryTreeSelect

Note: Usage snippets are minimal; fill required props from the props type below.

## CategoryTreeSelect

Props type: `CategoryTreeSelectProps`

```tsx
import { CategoryTreeSelect } from "@underverse-ui/underverse";

export function Example() {
  return <CategoryTreeSelect />;
}
```

Vi du day du:

```tsx
import React from "react";
import { CategoryTreeSelect } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <CategoryTreeSelect
      value={value}
      onChange={setValue}
      categories={undefined}
      placeholder={"Nhap..."}
     />
  );
}
```

```ts
interface CategoryTreeSelectProps {
  categories: Category[];
  value: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}
```
