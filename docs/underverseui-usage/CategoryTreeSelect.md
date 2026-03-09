# CategoryTreeSelect

Source: `components/ui/CategoryTreeSelect.tsx`

Exports:

- CategoryTreeSelect

## Usage

### With Custom Icons

```tsx
import { CategoryTreeSelect } from "@underverse-ui/underverse";
import { Smartphone, Laptop, Home } from "lucide-react";

const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Phones", parent_id: 1, icon: <Smartphone className="w-4 h-4" /> },
  { id: 3, name: "Laptops", parent_id: 1, icon: <Laptop className="w-4 h-4" /> },
];

<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} />;
```

### Multi-select (default)

```tsx
import { CategoryTreeSelect } from "@underverse-ui/underverse";

const [selected, setSelected] = useState<number[]>([]);

<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} placeholder="Select categories" />;
```

### Combobox-like trigger

```tsx
<CategoryTreeSelect
  categories={categories}
  value={selected}
  onChange={setSelected}
  label="Categories"
  helperText="Choose one or more categories"
  placeholder="Select categories"
  size="md"
  variant="default"
  allowClear
/>
```

### Single-select mode

```tsx
const [selected, setSelected] = useState<number | null>(null);

<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} singleSelect />;
```

### Inline mode (always visible, no dropdown)

```tsx
<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} singleSelect inline defaultExpanded />
```

**Note:** In inline mode with `singleSelect`, radio buttons are automatically hidden for a cleaner navigation experience.

### With onNodeClick (for navigation)

```tsx
<CategoryTreeSelect
  categories={departments}
  value={selectedId}
  onChange={setSelectedId}
  singleSelect
  inline
  onNodeClick={(node) => router.push(`/departments/${node.id}`)}
/>
```

### View Only (read-only tree)

```tsx
<CategoryTreeSelect categories={categories} viewOnly defaultExpanded />
```

## i18n Labels

```tsx
const labels = {
  emptyText: t("categoryTree.empty"),
  selectedText: (count) => t("categoryTree.selected", { count }),
};

<CategoryTreeSelect categories={categories} labels={labels} />;
```

## Props

```ts
interface CategoryTreeSelectProps {
  categories: Category[];

  // Multi-select mode (default)
  value?: number[];
  onChange?: (selectedIds: number[]) => void;

  // OR Single-select mode
  singleSelect?: boolean;
  value?: number | null; // when singleSelect=true
  onChange?: (id: number | null) => void; // when singleSelect=true

  placeholder?: string;
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "filled";
  allowClear?: boolean;
  error?: string;
  helperText?: string;
  viewOnly?: boolean; // Read-only tree
  defaultExpanded?: boolean; // Expand all nodes by default
  enableSearch?: boolean; // Show search input (default: categories.length > 10)
  inline?: boolean; // Always visible, no dropdown
  onNodeClick?: (node: Category) => void; // Click callback
  labels?: CategoryTreeSelectLabels;
  className?: string;
  /** Enable OverlayScrollbars for dropdown tree viewport. Default: false */
  useOverlayScrollbar?: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  icon?: React.ReactNode; // Optional custom icon
}

interface CategoryTreeSelectLabels {
  emptyText?: string;
  selectedText?: (count: number) => string;
  searchPlaceholder?: string;
  noResultsText?: string;
}
```
