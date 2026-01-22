# Underverse UI

Docs: https://underverse.infiniq.com.vn/vi/docs/underverse

**Author:** Tran Van Bach

A comprehensive UI component library for React/Next.js applications, extracted from the main project. Built with Tailwind CSS, `clsx`, and `tailwind-merge`.

## ✨ Features

- 🎨 **60+ UI Components** - Buttons, Modals, DatePicker, DataTable, and more
- 🌐 **Multi-language Support** - Built-in translations for English, Vietnamese, Korean, Japanese
- ⚡ **Tree-shakeable** - Import only what you need
- 🔌 **Flexible i18n** - Works with `next-intl` or standalone React
- 🎯 **TypeScript First** - Full type definitions included
- 🌙 **Dark Mode Ready** - Supports light/dark themes via CSS variables

## Supported Locales

| Locale | Language   | Flag |
| ------ | ---------- | ---- |
| `en`   | English    | 🇺🇸   |
| `vi`   | Tiếng Việt | 🇻🇳   |
| `ko`   | 한국어     | 🇰🇷   |
| `ja`   | 日本語     | 🇯🇵   |

## Requirements

- Node >= 18
- Peer dependencies: `react`, `react-dom`
- Optional: `next`, `next-intl` (for Next.js projects)

## Installation

```bash
# Install the package
npm i @underverse-ui/underverse

# For Next.js projects (with next-intl)
npm i react react-dom next next-intl

# For standalone React projects (Vite, CRA, etc.)
npm i react react-dom
```

## Tailwind CSS Configuration

Components use color variables like `primary`, `secondary`, `destructive`, etc. Make sure your Tailwind theme/tokens include these variables.

---

## ⚡ Performance Optimization

### Optimize Package Imports (Next.js)

For best performance, add `optimizePackageImports` to your Next.js config:

```js
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@underverse-ui/underverse"],
  },
};
```

This provides:

- ✅ 15-70% faster dev boot
- ✅ 28% faster builds
- ✅ 40% faster cold starts
- ✅ Automatic tree-shaking for barrel imports

### Dynamic Imports for Heavy Components

For pages that conditionally show DataTable or DatePicker:

```tsx
import dynamic from "next/dynamic";

const DataTable = dynamic(() => import("@underverse-ui/underverse").then((m) => m.DataTable), { ssr: false, loading: () => <Skeleton /> });
```

### Web Interface Guidelines Compliant

All components follow [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines):

- ✅ `focus-visible` ring (not `:focus`)
- ✅ Label `htmlFor` attribute
- ✅ ARIA attributes for accessibility
- ✅ `overscroll-behavior: contain` for modals
- ✅ Proper ellipsis (`…`) typography
- ✅ Locale-aware date formatting with `Intl.DateTimeFormat`

---

## � Entry Points

Package được chia thành 2 entry points để tối ưu cho Server Components:

### Main Entry (Server-safe)

```tsx
// dist/index.js - Các components không phụ thuộc react-hook-form
// Có thể sử dụng trong cả Server Components và Client Components
import { Button, Skeleton, DatePicker, DataTable } from "@underverse-ui/underverse";
```

### Form Entry (Client-only)

```tsx
// dist/form.js - Form components (phụ thuộc react-hook-form)
// Chỉ sử dụng trong Client Components ("use client")
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@underverse-ui/underverse/form";
```

**Lưu ý:** Form components yêu cầu `react-hook-form` và `@hookform/resolvers` nên chỉ hoạt động ở client-side.

---

## �🚀 Quick Start

### Standalone React (Vite, CRA, etc.)

```tsx
import { TranslationProvider, Button, DatePicker, ToastProvider, useToast } from "@underverse-ui/underverse";

function App() {
  return (
    <TranslationProvider locale="vi">
      <ToastProvider>
        <MyComponent />
      </ToastProvider>
    </TranslationProvider>
  );
}

function MyComponent() {
  const { addToast } = useToast();

  return (
    <div>
      <DatePicker onChange={(date) => console.log(date)} />
      <Button onClick={() => addToast({ type: "success", message: "Hello!" })}>Click me</Button>
    </div>
  );
}
```

### Next.js (with next-intl)

```tsx
import { Button, ToastProvider, useToast } from "@underverse-ui/underverse";

function App() {
  const { addToast } = useToast();
  return (
    <ToastProvider>
      <Button onClick={() => addToast({ type: "success", message: "Hello" })}>Click me</Button>
    </ToastProvider>
  );
}
```

## Exported Components

### Core Components

- **Buttons:** `Button`
- **Display:** `Badge`, `Card`, `Avatar`, `Skeleton`, `Progress`
- **Form Inputs:** `Input`, `Textarea`, `Checkbox`, `Switch`, `Label`

### Feedback & Overlays

- `Modal`, `ToastProvider`, `useToast`, `Tooltip`, `Popover`, `Sheet` (includes `Drawer`, `SlideOver`, `BottomSheet`, `SidebarSheet`), `Alert`, `GlobalLoading` (includes `PageLoading`, `InlineLoading`, `ButtonLoading`)

### Form Controls & Pickers

- `RadioGroup`, `Slider`, `DatePicker`, `Combobox`, `MultiCombobox`, `CategoryTreeSelect`

### Navigation & Structure

- `Breadcrumb`, `Tabs` (includes `SimpleTabs`, `PillTabs`, `VerticalTabs`), `DropdownMenu`, `Pagination`, `Section`, `ScrollArea`

### Data Display

- `Table`, `DataTable`

### Media Components

- `SmartImage`, `ImageUpload`, `Carousel`

### Utilities

- `ClientOnly`, `Loading`, `NotificationModal`, `FloatingContacts`, `AccessDenied`
- Headless controls: `ThemeToggle`, `LanguageSwitcher`
- Utility functions: `cn`, `DateUtils`, style constants

## Important Notes

- Library is i18n‑agnostic: components have sensible English defaults and accept text via props.
- If your app uses `next-intl`, you can merge our ready‑made messages to localize built‑in texts.
- `NotificationBell` is not exported (depends on project‑specific API/socket implementations).

---

## 📦 Date Utilities

The package includes standalone date utilities with locale support (no Next.js required):

```tsx
import { DateUtils } from "@underverse-ui/underverse";

// Format dates with locale
DateUtils.formatDate(new Date(), "ko"); // "2026년 1월 5일"
DateUtils.formatDate(new Date(), "ja"); // "2026年1月5日"
DateUtils.formatDate(new Date(), "vi"); // "05/01/2026"
DateUtils.formatDate(new Date(), "en"); // "January 5, 2026"

// Relative time formatting
DateUtils.formatTimeAgo(new Date(Date.now() - 3600000), "ko"); // "1시간 전"
DateUtils.formatTimeAgo(new Date(Date.now() - 3600000), "ja"); // "1時間前"

// Smart date formatting (Today, Yesterday, or full date)
DateUtils.formatDateSmart(new Date(), "ja"); // "今日 14:30"

// Utility checks
DateUtils.isToday(new Date()); // true
DateUtils.isYesterday(new Date(Date.now() - 86400000)); // true

// Get day of week
DateUtils.getDayOfWeek(new Date(), "ko"); // "일요일"
DateUtils.getDayOfWeek(new Date(), "ja"); // "日曜日"

// Form input formatting
DateUtils.formatDateForInput(new Date()); // "2026-01-05"
DateUtils.formatDateTimeForInput(new Date()); // "2026-01-05T14:30"
```

### Available Date Functions

| Function                        | Description                         |
| ------------------------------- | ----------------------------------- |
| `formatDate(date, locale)`      | Full date format                    |
| `formatDateShort(date, locale)` | Short date format                   |
| `formatTime(date, locale)`      | Time only (HH:mm)                   |
| `formatDateTime(date, locale)`  | Date + time                         |
| `formatTimeAgo(date, locale)`   | Relative time (e.g., "2 hours ago") |
| `formatDateSmart(date, locale)` | Today/Yesterday/Full date           |
| `isToday(date)`                 | Check if date is today              |
| `isYesterday(date)`             | Check if date is yesterday          |
| `getDayOfWeek(date, locale)`    | Get localized day name              |
| `formatDateForInput(date)`      | YYYY-MM-DD format                   |
| `formatDateTimeForInput(date)`  | YYYY-MM-DDTHH:mm format             |

---

## 🎨 Animation Utilities

The package includes ShadCN-compatible animation utilities:

```tsx
import { useShadCNAnimations, injectAnimationStyles, getAnimationStyles } from "@underverse-ui/underverse";

// React hook - automatically injects styles on mount
function MyComponent() {
  useShadCNAnimations();
  return <div className="animate-accordion-down">Content</div>;
}

// Manual injection (for non-React usage)
injectAnimationStyles();

// Get CSS string for custom injection
const cssString = getAnimationStyles();
```

### Available Animations

| Class                          | Description                  |
| ------------------------------ | ---------------------------- |
| `animate-accordion-down`       | Accordion expand animation   |
| `animate-accordion-up`         | Accordion collapse animation |
| `animate-caret-blink`          | Blinking caret cursor        |
| `animate-fade-in`              | Fade in effect               |
| `animate-fade-out`             | Fade out effect              |
| `animate-slide-in-from-top`    | Slide in from top            |
| `animate-slide-in-from-bottom` | Slide in from bottom         |
| `animate-slide-in-from-left`   | Slide in from left           |
| `animate-slide-in-from-right`  | Slide in from right          |
| `animate-zoom-in`              | Zoom in effect               |
| `animate-zoom-out`             | Zoom out effect              |

---

## next-intl Integration (Next.js App Router)

1. Configure plugin and time zone (to avoid `ENVIRONMENT_FALLBACK`):

```ts
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  timeZone: "Asia/Ho_Chi_Minh", // important for SSR
});

export default withNextIntl({
  // your other Next config
});
```

2. Merge underverse messages with your app messages:

```tsx
// app/layout.tsx (simplified)
import { NextIntlClientProvider, getMessages } from "next-intl/server";
import { underverseMessages } from "@underverse-ui/underverse";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const appMessages = await getMessages();
  const locale = "vi"; // derive from params/headers
  const uv = underverseMessages[locale] || underverseMessages.en;
  const messages = { ...uv, ...appMessages }; // app overrides uv if overlaps

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

3. Use components normally. Any built‑in texts (DatePicker/Pagination/DataTable/Alert/ImageUpload…) will use merged messages. You can still override labels via props if desired.

---

## 🌐 TranslationProvider API

For standalone React apps (without next-intl):

```tsx
import { TranslationProvider } from "@underverse-ui/underverse";

function App() {
  return (
    <TranslationProvider
      locale="ko" // "en" | "vi" | "ko" | "ja"
      translations={{
        // Optional: override default translations
        Common: {
          close: "닫기 (custom)",
        },
      }}
    >
      {children}
    </TranslationProvider>
  );
}
```

### TranslationProvider Props

| Prop           | Type                           | Default     | Description                  |
| -------------- | ------------------------------ | ----------- | ---------------------------- |
| `locale`       | `"en" \| "vi" \| "ko" \| "ja"` | `"en"`      | Active locale                |
| `translations` | `Translations`                 | `undefined` | Custom translation overrides |
| `children`     | `ReactNode`                    | -           | Child components             |

---

## Message Keys Summary

- `Common`: close, closeAlert, notifications, newNotification, readStatus, openLink, theme, lightTheme, darkTheme, systemTheme, density, compact, normal, comfortable, columns
- `ValidationInput`: required, typeMismatch, pattern, tooShort, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, badInput, invalid
- `Loading`: loadingPage, pleaseWait
- `DatePicker`: placeholder, today, clear
- `Pagination`: navigationLabel, showingResults ({startItem},{endItem},{totalItems}), firstPage, previousPage, previous, nextPage, next, lastPage, pageNumber ({page}), itemsPerPage, search, noOptions
- `OCR.imageUpload`: dragDropText, browseFiles, supportedFormats

---

## 📋 Exported Components

### Core Components

- **Buttons:** `Button`
- **Display:** `Badge`, `Card`, `Avatar`, `Skeleton`, `Progress`
- **Form Inputs:** `Input`, `PasswordInput`, `NumberInput`, `SearchInput`, `Textarea`, `Checkbox`, `Switch`, `Label`, `TagInput`

### Feedback & Overlays

- `Modal`, `ToastProvider`, `useToast`, `Tooltip`, `Popover`
- `Sheet` (includes `Drawer`, `SlideOver`, `BottomSheet`, `SidebarSheet`)
- `Alert`, `GlobalLoading` (includes `PageLoading`, `InlineLoading`, `ButtonLoading`)

### Form Controls & Pickers

- `RadioGroup`, `Slider`, `DatePicker`, `DateRangePicker`, `TimePicker`, `Calendar`
- `Combobox`, `MultiCombobox`, `CategoryTreeSelect`, `ColorPicker`

### Navigation & Structure

- `Breadcrumb`, `Tabs` (includes `SimpleTabs`, `PillTabs`, `VerticalTabs`)
- `DropdownMenu`, `Pagination`, `SimplePagination`, `CompactPagination`
- `Section`, `ScrollArea`

### Data Display

- `Table`, `DataTable`, `List`, `Grid`, `Timeline`

### Media Components

- `SmartImage`, `ImageUpload`, `Carousel`, `FallingIcons`, `Watermark`

### Utilities

- `ClientOnly`, `Loading`, `NotificationModal`, `FloatingContacts`, `AccessDenied`
- `ThemeToggle`, `LanguageSwitcher` (headless)
- `cn`, `DateUtils`, `useShadCNAnimations`

---

## License

MIT

## Author

Tran Van Bach

---

## Headless Components Usage

These variants avoid app-specific contexts and routing so you can wire them to your own state.

### ThemeToggle (headless)

```tsx
import { ThemeToggle } from "@underverse-ui/underverse";
import type { ThemeToggleProps, ThemeMode } from "@underverse-ui/underverse";
import { useState } from "react";

export default function ExampleThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  return (
    <ThemeToggle
      theme={theme}
      onChange={setTheme}
      // optional labels
      labels={{ heading: "Theme", light: "Light", dark: "Dark", system: "System" }}
    />
  );
}
```

If you use `next-themes` or a custom context, pass your current theme and the setter to `onChange`.

### LanguageSwitcher (headless)

```tsx
import { LanguageSwitcher } from "@underverse-ui/underverse";
import type { LanguageOption } from "@underverse-ui/underverse";
import { useRouter, usePathname } from "next/navigation";

const locales: LanguageOption[] = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export default function ExampleLanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const onSwitch = (code: string) => {
    // Replace first segment as locale, e.g. /vi/... -> /en/...
    const segs = pathname.split("/");
    segs[1] = code;
    router.push(segs.join("/"));
  };

  return <LanguageSwitcher locales={locales} currentLocale={currentLocale} onSwitch={onSwitch} labels={{ heading: "Language" }} />;
}
```

---

## 📁 Full Export Reference

```tsx
// Core Components
import {
  Button,
  Badge,
  Card,
  Avatar,
  Skeleton,
  Progress,
  Input,
  PasswordInput,
  NumberInput,
  SearchInput,
  Textarea,
  Checkbox,
  Switch,
  Label,
  TagInput,
} from "@underverse-ui/underverse";

// Overlays
import {
  Modal,
  ToastProvider,
  useToast,
  Tooltip,
  Popover,
  Sheet,
  Drawer,
  SlideOver,
  BottomSheet,
  SidebarSheet,
  Alert,
  GlobalLoading,
  PageLoading,
  InlineLoading,
  ButtonLoading,
} from "@underverse-ui/underverse";

// Pickers
import {
  DatePicker,
  DateRangePicker,
  TimePicker,
  Calendar,
  Combobox,
  MultiCombobox,
  CategoryTreeSelect,
  ColorPicker,
  RadioGroup,
  Slider,
} from "@underverse-ui/underverse";

// Navigation
import {
  Breadcrumb,
  Tabs,
  SimpleTabs,
  PillTabs,
  VerticalTabs,
  DropdownMenu,
  Pagination,
  SimplePagination,
  CompactPagination,
  Section,
  ScrollArea,
} from "@underverse-ui/underverse";

// Data Display
import { Table, DataTable, List, Grid, Timeline, Watermark } from "@underverse-ui/underverse";

// Media
import { SmartImage, ImageUpload, Carousel, FallingIcons } from "@underverse-ui/underverse";

// Utilities
import {
  cn,
  DateUtils,
  useShadCNAnimations,
  injectAnimationStyles,
  ClientOnly,
  Loading,
  NotificationModal,
  FloatingContacts,
  AccessDenied,
  ThemeToggle,
  LanguageSwitcher,
} from "@underverse-ui/underverse";

// i18n
import {
  TranslationProvider,
  useUnderverseTranslations,
  useUnderverseLocale,
  underverseMessages,
  getUnderverseMessages,
} from "@underverse-ui/underverse";

// Types
import type {
  ButtonProps,
  InputProps,
  DatePickerProps,
  ComboboxProps,
  PaginationProps,
  DataTableColumn,
  Locale,
  Translations,
} from "@underverse-ui/underverse";
```

---

## 🧪 Testing

### Test with React (Vite)

```bash
# Create new Vite project
npm create vite@latest my-test-app -- --template react-ts
cd my-test-app

# Install underverse
npm i @underverse-ui/underverse

# Add Tailwind CSS
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Test with Next.js

```bash
# Create new Next.js project
npx create-next-app@latest my-test-app --typescript --tailwind
cd my-test-app

# Install underverse
npm i @underverse-ui/underverse next-intl
```
