# CategoryTreeSelect

Source: `packages/underverse/src/components/CategoryTreeSelect.tsx`

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

### Required Validation

```tsx
<form>
  <CategoryTreeSelect
    categories={categories}
    value={selected}
    onChange={setSelected}
    label="Categories"
    required
  />
  <button type="submit">Submit</button>
</form>
```

When `required` is enabled, the custom trigger participates in form validation like `Input`, switches to the destructive state if the parent form validates while nothing is selected, and clears the local required error once a valid selection is made.

### Single-select mode

```tsx
const [selected, setSelected] = useState<number | null>(null);

<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} singleSelect />;
```

### Leaf-only select

```tsx
const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);

<CategoryTreeSelect
  categories={categories}
  value={selectedLeaf}
  onChange={setSelectedLeaf}
  singleSelect
  leafOnlySelect
  defaultExpanded
/>;
```

When `leafOnlySelect` is enabled, nodes that have children are not selectable. Clicking them will only expand or collapse the subtree.

### Inline mode (always visible, no dropdown)

```tsx
<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} singleSelect inline defaultExpanded />
```

**Note:** In inline mode with `singleSelect`, radio buttons are automatically hidden for a cleaner navigation experience.

### Expand đến node cụ thể

```tsx
<CategoryTreeSelect
  categories={categories}
  inline
  expandToId={42}
/>
```

`expandToId` sẽ mở ancestor path cần thiết để node đó nhìn thấy ngay từ đầu. Nếu node đó là parent node, chính node đó cũng sẽ được đánh dấu expanded.

### Expand sẵn nhiều nhánh cụ thể

```tsx
<CategoryTreeSelect
  categories={categories}
  inline
  defaultExpandedIds={[1, 6, 13]}
/>
```

`defaultExpandedIds` hữu ích khi chỉ muốn mở vài branch nhất định thay vì `defaultExpanded` mở toàn bộ parent nodes.

### Controlled expanded state

```tsx
const [expandedIds, setExpandedIds] = useState<number[]>([1, 6]);

<CategoryTreeSelect
  categories={categories}
  inline
  expandedIds={expandedIds}
  onExpandedChange={setExpandedIds}
/>
```

Khi truyền `expandedIds`, component chuyển sang controlled mode cho expand/collapse. Lúc đó `defaultExpanded`, `defaultExpandedIds`, và `expandToId` chỉ còn ý nghĩa cho các trường hợp uncontrolled khác.

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
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "filled";
  allowClear?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean; // Shows required semantics + error state on form validation
  viewOnly?: boolean; // Read-only tree
  defaultExpanded?: boolean; // Expand all nodes by default
  defaultExpandedIds?: number[]; // Expand specific branch ids by default
  expandToId?: number | null; // Expand ancestor path so this node is visible by default
  expandedIds?: number[]; // Controlled expanded branch ids
  onExpandedChange?: (expandedIds: number[]) => void; // Controlled expand/collapse callback
  enableSearch?: boolean; // Show search input (default: categories.length > 10)
  inline?: boolean; // Always visible, no dropdown
  leafOnlySelect?: boolean; // Only leaf nodes can be selected
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
