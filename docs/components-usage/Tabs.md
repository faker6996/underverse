# Tabs

Source: `components/ui/Tab.tsx`

Exports:
- Tabs
- SimpleTabs
- PillTabs
- VerticalTabs

Note: Usage snippets are minimal; fill required props from the props type below.

## Tabs

Props type: `TabsProps`

```tsx
import { Tabs } from "@underverse-ui/underverse";

export function Example() {
  return <Tabs />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Tabs } from "@underverse-ui/underverse";

export function Example() {
  const tabs = [
    { label: "Tong quan", value: "overview", content: <div>Thong tin tong quan</div> },
    { label: "Chi tiet", value: "detail", content: <div>Noi dung chi tiet</div> },
  ];

  return <Tabs tabs={tabs} variant="underline" size="sm" />;
}
```

```ts
interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
  variant?: "default" | "pills" | "underline" | "card" | "underline-card";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  onTabChange?: (value: string) => void;
  stretch?: boolean; // evenly distribute tabs (horizontal)
}
```

## SimpleTabs

Props type: `SimpleTabsProps`

```tsx
import { SimpleTabs } from "@underverse-ui/underverse";

export function Example() {
  return <SimpleTabs />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SimpleTabs } from "@underverse-ui/underverse";

export function Example() {
  const tabs = [
    { label: "Tab 1", value: "tab-1", content: <div>Tab 1</div> },
    { label: "Tab 2", value: "tab-2", content: <div>Tab 2</div> },
  ];

  return <SimpleTabs tabs={tabs} />;
}
```

```ts
// Additional Tab components for specific use cases
interface SimpleTabsProps {
  tabs: Array<{
    label: string;
    value: string;
    content: React.ReactNode;
  }>;
  defaultValue?: string;
  className?: string;
}
```

## PillTabs

Props type: `PillTabsProps`

```tsx
import { PillTabs } from "@underverse-ui/underverse";

export function Example() {
  return <PillTabs />;
}
```

Vi du day du:

```tsx
import React from "react";
import { PillTabs } from "@underverse-ui/underverse";

export function Example() {
  const tabs = [
    { label: "Ngay", value: "day", content: <div>Lich ngay</div> },
    { label: "Tuan", value: "week", content: <div>Lich tuan</div> },
  ];

  return <PillTabs tabs={tabs} />;
}
```

```ts
interface PillTabsProps extends TabsProps {
  contained?: boolean;
}
```

## VerticalTabs

Props type: `VerticalTabsProps`

```tsx
import { VerticalTabs } from "@underverse-ui/underverse";

export function Example() {
  return <VerticalTabs />;
}
```

Vi du day du:

```tsx
import React from "react";
import { VerticalTabs } from "@underverse-ui/underverse";

export function Example() {
  const tabs = [
    { label: "Ho so", value: "profile", content: <div>Thong tin ho so</div> },
    { label: "Bao mat", value: "security", content: <div>Thiet lap bao mat</div> },
  ];

  return <VerticalTabs tabs={tabs} />;
}
```

```ts
interface VerticalTabsProps extends TabsProps {
  sidebarWidth?: string;
}
```
