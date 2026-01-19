# List

Source: `components/ui/List.tsx`

Exports:

- List
- ListItem

Note: List items now have **no default padding**. You must provide padding via `itemClassName` on `List` or `contentClassName` on `ListItem`.

## List

Props type: `ListProps`

```tsx
import { List } from "@underverse-ui/underverse";

export function Example() {
  // Add padding via itemClassName
  return <List itemClassName="p-4" />;
}
```

Ví dụ đầy đủ:

```tsx
import React from "react";
import { List, ListItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    // Custom padding using itemClassName
    <List variant="card" divided itemClassName="px-4 py-3">
      <ListItem label="Don hang #1024" description="Dang xu ly" />
      <ListItem label="Don hang #1025" description="Da giao" />
    </List>
  );
}
```

```ts
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  as?: "ul" | "ol" | "div";
  ordered?: boolean;
  variant?: Variant;
  size?: Size;
  divided?: boolean;
  inset?: boolean; // inner padding around items
  hoverable?: boolean;
  /** Show loading skeleton */
  loading?: boolean;
  /** Number of skeleton items to show */
  loadingCount?: number;
  /** Show empty state when no children */
  emptyText?: string;
  /** Make items more compact */
  dense?: boolean;
  /** Class name customization for all list items padding */
  itemClassName?: string;
}
```

## ListItem

Props type: `ListItemProps`

```tsx
import { ListItem } from "@underverse-ui/underverse";

export function Example() {
  return <ListItem contentClassName="p-4" />;
}
```

Ví dụ đầy đủ:

```tsx
import React from "react";
import { List, ListItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <List itemClassName="p-4">
      <ListItem label="Thanh toan" description="Da xac nhan" />
      {/* Override padding for specific item */}
      <ListItem label="Special Item" contentClassName="p-8 bg-muted" />
    </List>
  );
}
```

```ts
export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  as?: "li" | "div" | "a" | "button";
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  /** Show avatar on the left */
  avatar?: string | React.ReactNode;
  /** Show badge/tag */
  badge?: React.ReactNode;
  /** Badge color variant */
  badgeVariant?: "default" | "success" | "warning" | "error" | "info";
  /** Action button on hover */
  action?: React.ReactNode;
  /** Make item collapsible */
  collapsible?: boolean;
  /** Expanded state for collapsible */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Content to show when expanded */
  expandContent?: React.ReactNode;
  /** Custom class for inner content container (use for padding) */
  contentClassName?: string;
}
```
