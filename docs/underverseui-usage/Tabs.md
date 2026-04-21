# Tabs

Source: `packages/underverse/src/components/Tab.tsx`

Exports: `Tabs`, `SimpleTabs`, `PillTabs`, `VerticalTabs`

## Ví dụ cơ bản

```tsx
import { Tabs } from "@underverse-ui/underverse";

const tabs = [
  { label: "Tổng quan", value: "overview", content: <div>Thông tin tổng quan</div> },
  { label: "Chi tiết",  value: "detail",   content: <div>Nội dung chi tiết</div> },
];

<Tabs tabs={tabs} variant="underline" size="sm" />
```

## Variants

```tsx
<Tabs tabs={tabs} variant="default" />       // tab bar dạng pill + border-bottom
<Tabs tabs={tabs} variant="pills" />         // floating pill bar
<Tabs tabs={tabs} variant="underline" />     // underline đơn giản
<Tabs tabs={tabs} variant="card" />          // tab dạng card sidebar
<Tabs tabs={tabs} variant="underline-card"/> // underline + card background
```

## Sizes

```tsx
<Tabs tabs={tabs} size="sm" />  // py-1.5 px-3 text-xs
<Tabs tabs={tabs} size="md" />  // py-2.5 px-4 text-sm (default)
<Tabs tabs={tabs} size="lg" />  // py-3 px-6 text-base
```

## Với icon

```tsx
import { Home, User, Settings } from "lucide-react";

const tabs = [
  { value: "home",     label: "Home",     icon: Home,     content: <div>Home</div> },
  { value: "profile",  label: "Profile",  icon: User,     content: <div>Profile</div> },
  { value: "settings", label: "Settings", icon: Settings, content: <div>Settings</div> },
];

<Tabs tabs={tabs} variant="pills" />
```

## Orientation – vertical

```tsx
<Tabs tabs={tabs} orientation="vertical" variant="card" />
```

## Stretch – chia đều tab

```tsx
<Tabs tabs={tabs} stretch />
```

## Open tab mới bằng middle-click / chuột phải

Mặc định, tab thường render trigger dạng link nội bộ theo `#panel-id`, nên:

- middle-click mở tab/cửa sổ mới được
- `Ctrl/Cmd + click` dùng native browser behavior
- chuột trái vẫn chỉ đổi tab tại chỗ

Nếu cần đích tùy chỉnh, truyền `href` để override link mặc định:

```tsx
const tabs = [
  {
    value: "docs",
    label: "Docs",
    href: "/docs/tabs",
    target: "_blank",
    rel: "noreferrer",
    content: <div>Docs tab content</div>,
  },
  { value: "api", label: "API", content: <div>API content</div> },
];

<Tabs tabs={tabs} variant="underline" />
```

## Tab bị disabled

```tsx
const tabs = [
  { value: "a", label: "Active",   content: <div>Active</div> },
  { value: "b", label: "Disabled", content: <div>Disabled</div>, disabled: true },
];

<Tabs tabs={tabs} variant="pills" />
```

## Content panel – tránh nested card

Mặc định, content panel có card styling (border + shadow + background). Khi content bên trong đã có card riêng, dùng các prop sau để bỏ wrapper:

```tsx
// noContentCard: bỏ border/shadow/background của panel
// noContentPadding: bỏ padding mặc định của panel
// contentClassName: thêm class tùy ý lên panel wrapper
<Tabs
  tabs={tabs}
  variant="underline"
  noContentCard
  noContentPadding
  contentClassName="mt-4"
/>
```

## animateContent – fade khi đổi tab

```tsx
// Bật mặc định (animateContent=true). Tắt nếu không muốn animation:
<Tabs tabs={tabs} animateContent={false} />
```

## onTabChange – callback khi đổi tab

```tsx
<Tabs
  tabs={tabs}
  defaultValue="overview"
  onTabChange={(value) => console.log("Active tab:", value)}
/>
```

## Preset components

### SimpleTabs

Shorthand cho `variant="default" size="sm"`:

```tsx
import { SimpleTabs } from "@underverse-ui/underverse";

<SimpleTabs tabs={tabs} />
```

### PillTabs

Shorthand cho `variant="pills"`. Mặc định `contained=true` (max-w-fit):

```tsx
import { PillTabs } from "@underverse-ui/underverse";

<PillTabs tabs={tabs} />
<PillTabs tabs={tabs} contained={false} /> // full width
```

### VerticalTabs

Shorthand cho `orientation="vertical" variant="card"`. Dùng `sidebarWidth` để set chiều rộng sidebar:

```tsx
import { VerticalTabs } from "@underverse-ui/underverse";

<VerticalTabs tabs={tabs} />
<VerticalTabs tabs={tabs} sidebarWidth="w-56" />
```

## Accessibility

| Feature | Status |
|---------|--------|
| `role="tablist"` trên container | ✅ |
| `role="tab"` trên trigger (`button` hoặc `a`) | ✅ |
| `aria-selected` state | ✅ |
| `aria-controls` / `id` liên kết tabpanel | ✅ |
| `focus-visible` ring | ✅ |
| Keyboard: Arrow / Home / End | ✅ |

## API

```ts
interface TabsProps {
  tabs: Array<{
    label: string;
    value: string;
    content: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    href?: string;
    target?: string;
    rel?: string;
  }>;
  defaultValue?: string;
  className?: string;
  /** Class áp lên content panel wrapper */
  contentClassName?: string;
  variant?: "default" | "pills" | "underline" | "card" | "underline-card";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  onTabChange?: (value: string) => void;
  /** Chia đều chiều rộng tab (horizontal). Default: false */
  stretch?: boolean;
  /** Bỏ card styling (border/shadow/bg) của content panel. Default: false */
  noContentCard?: boolean;
  /** Bỏ padding mặc định của content panel. Default: false */
  noContentPadding?: boolean;
  /** Fade animation khi chuyển tab. Default: true */
  animateContent?: boolean;
}
```
