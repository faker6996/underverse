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
  return <CategoryTreeSelect categories={[]} />;
}
```

Ví dụ đầy đủ (Select mode với i18n):

```tsx
import React from "react";
import { useTranslations } from "next-intl";
import { CategoryTreeSelect } from "@underverse-ui/underverse";

export function Example() {
  const t = useTranslations("common");
  const [value, setValue] = React.useState<number[]>([]);
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Phones", parent_id: 1 },
    { id: 3, name: "Laptops", parent_id: 1 },
    { id: 4, name: "Home" },
    { id: 5, name: "Kitchen", parent_id: 4 },
  ];

  // i18n labels
  const labels = {
    emptyText: t("categoryTree.empty"),
    selectedText: (count: number) => t("categoryTree.selected", { count }),
  };

  return <CategoryTreeSelect categories={categories} value={value} onChange={setValue} placeholder={t("categoryTree.placeholder")} labels={labels} />;
}
```

Ví dụ View Only mode:

```tsx
import { CategoryTreeSelect } from "@underverse-ui/underverse";

export function TreeViewExample() {
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Phones", parent_id: 1 },
    { id: 3, name: "Laptops", parent_id: 1 },
    { id: 4, name: "Home" },
    { id: 5, name: "Kitchen", parent_id: 4 },
  ];

  // Read-only tree view
  return <CategoryTreeSelect categories={categories} viewOnly />;

  // With all nodes expanded by default
  return <CategoryTreeSelect categories={categories} viewOnly defaultExpanded />;
}
```

## i18n Labels

Component hỗ trợ i18n thông qua prop `labels`:

```tsx
const labels = {
  emptyText: "Không có danh mục nào", // Text khi không có data
  selectedText: (count) => `Đã chọn ${count}`, // Text hiển thị số lượng đã chọn
};

<CategoryTreeSelect categories={categories} labels={labels} />;
```

```ts
interface CategoryTreeSelectLabels {
  /** Text shown when no categories available */
  emptyText?: string;
  /** Text shown when categories are selected, receives count as parameter */
  selectedText?: (count: number) => string;
}

interface CategoryTreeSelectProps {
  categories: Category[];
  value?: number[];
  onChange?: (selectedIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** When true, renders as a read-only tree view without select functionality */
  viewOnly?: boolean;
  /** Default expanded state for all nodes in viewOnly mode */
  defaultExpanded?: boolean;
  /** i18n labels for localization */
  labels?: CategoryTreeSelectLabels;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}
```
