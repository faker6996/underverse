# Underverse UI - Components Documentation

## Overview

Underverse UI là thư viện UI components cho React/Next.js với hỗ trợ đa ngôn ngữ.

- **Version:** 0.2.37+
- **Supported Locales:** English (en), Tiếng Việt (vi), 한국어 (ko), 日本語 (ja)
- **License:** MIT

## Quick Links

### 🚀 Getting Started

- [TranslationProvider](./TranslationProvider.md) - i18n context cho Standalone React
- [GlobalI18nConfig](./GlobalI18n.md) - Override toàn bộ label tiếng Anh hardcoded (50+ key)

### 🎨 Design System

- [Color System](../COLOR_SYSTEM.md) - OKLCH tokens, brand configuration, WCAG compliance

### 📦 Utilities

- [DateUtils](./DateUtils.md) - Date formatting với locale support
- [Animations](./Animations.md) - ShadCN-compatible animations

---

## Components by Category

### Core Components

| Component                 | Description          |
| ------------------------- | -------------------- |
| [Button](./Button.md)     | Nút bấm đa năng      |
| [Badge](./Badge.md)       | Badge / Tag hiển thị |
| [Card](./Card.md)         | Card container       |
| [Avatar](./Avatar.md)     | Hiển thị avatar      |
| [Skeleton](./Skeleton.md) | Loading placeholder  |
| [Progress](./Progress.md) | Progress bar         |

### Form Inputs

| Component                     | Description                             |
| ----------------------------- | --------------------------------------- |
| [Input](./Input.md)           | Text input (+ Password, Number, Search) |
| [Textarea](./Textarea.md)     | Multi-line text input                   |
| [Checkbox](./Checkbox.md)     | Checkbox                                |
| [Switch](./Switch.md)         | Toggle switch                           |
| [Label](./Label.md)           | Form label                              |
| [TagInput](./TagInput.md)     | Tag/chip input                          |
| [RadioGroup](./RadioGroup.md) | Radio button group                      |
| [Slider](./Slider.md)         | Range slider                            |

### Pickers

| Component                                     | Description           | i18n |
| --------------------------------------------- | --------------------- | ---- |
| [DatePicker](./DatePicker.md)                 | Date picker           | ✅   |
| [TimePicker](./TimePicker.md)                 | Time picker           | ✅ᵍ  |
| [Calendar](./Calendar.md)                     | Full calendar view    | -    |
| [CalendarTimeline](./CalendarTimeline.md)     | Resource timeline     | ✅   |
| [Combobox](./Combobox.md)                     | Searchable select     | ✅ᵍ  |
| [MultiCombobox](./MultiCombobox.md)           | Multi-select combobox | ✅ᵍ  |
| [CategoryTreeSelect](./CategoryTreeSelect.md) | Tree select           | ✅ᵍ  |
| [ColorPicker](./ColorPicker.md)               | Color picker          | ✅ᵍ  |
| [MonthYearPicker](./MonthYearPicker.md)       | Month/Year picker     | ✅ᵍ  |

### Feedback & Overlays

| Component                                   | Description                     | i18n |
| ------------------------------------------- | ------------------------------- | ---- |
| [Modal](./Modal.md)                         | Modal dialog (+ Portal support) | ✅ᵍ  |
| [Toast](./Toast.md)                         | Toast notifications             | ✅ᵍ  |
| [Tooltip](./Tooltip.md)                     | Tooltip                         | -    |
| [Popover](./Popover.md)                     | Popover                         | -    |
| [Sheet](./Sheet.md)                         | Slide-over panels               | ✅ᵍ  |
| [Alert](./Alert.md)                         | Alert messages                  | ✅   |
| [GlobalLoading](./GlobalLoading.md)         | Loading indicators              | ✅ᵍ  |
| [NotificationModal](./NotificationModal.md) | Notification modal              | ✅   |

### Navigation & Structure

| Component                         | Description           | i18n |
| --------------------------------- | --------------------- | ---- |
| [Breadcrumb](./Breadcrumb.md)     | Breadcrumb navigation | ✅ᵍ  |
| [Tabs](./Tabs.md)                 | Tab navigation        | -    |
| [DropdownMenu](./DropdownMenu.md) | Dropdown menu         | -    |
| [Pagination](./Pagination.md)     | Pagination controls   | ✅   |
| [Section](./Section.md)           | Section container     | -    |
| [ScrollArea](./ScrollArea.md)     | Scrollable area       | -    |
| [OverlayScrollArea](./OverlayScrollArea.md) | Overlay scrollbar wrapper | -    |

### Data Display

| Component                   | Description         | i18n |
| --------------------------- | ------------------- | ---- |
| [Table](./Table.md)         | Basic table         | -    |
| [DataTable](./DataTable.md) | Advanced data table | ✅   |
| [List](./List.md)           | List component      | -    |
| [Grid](./Grid.md)           | Grid layout         | -    |
| [Timeline](./Timeline.md)   | Timeline display    | -    |
| [Slider](./Slider.md)       | Range slider        | ✅ᵍ  |
| [Progress](./Progress.md)   | Progress / Battery  | ✅ᵍ  |

### Media

| Component                         | Description             | i18n |
| --------------------------------- | ----------------------- | ---- |
| [SmartImage](./SmartImage.md)     | Optimized image         | -    |
| [ImageUpload](./ImageUpload.md)   | Image upload            | ✅   |
| [FileUpload](./FileUpload.md)     | File upload             | ✅ᵍ  |
| [Carousel](./Carousel.md)         | Image carousel          | ✅ᵍ  |
| [FallingIcons](./FallingIcons.md) | Falling icons animation | -    |
| [Watermark](./Watermark.md)       | Watermark overlay       | -    |
| [MusicPlayer](./MusicPlayer.md)   | Music player            | -    |
| [UEditor](./UEditor.md)          | Rich text editor       | ✅   |

### Misc & Utilities

| Component                                                 | Description                  |
| --------------------------------------------------------- | ---------------------------- |
| [ClientOnly](./ClientOnly.md)                             | Client-side only render      |
| [Loading](./Loading.md)                                   | Loading spinners             |
| [AccessDenied](./AccessDenied.md)                         | Access denied page           |
| [OverlayControls](./OverlayControls.md)                   | Overlay control buttons      |
| [ThemeToggleHeadless](./ThemeToggleHeadless.md)           | Theme toggle (headless)      |
| [LanguageSwitcherHeadless](./LanguageSwitcherHeadless.md) | Language switcher (headless) |

---

## i18n

### GlobalI18nConfig (✅ᵍ) — label override toàn cục

Tất cả component đánh dấu **✅ᵍ** đều đọc từ `GlobalI18nConfig` — truyền một lần qua `i18n` prop trên provider, áp dụng cho toàn app:

```tsx
<NextIntlAdapter i18n={{ searchPlaceholder: "Tìm kiếm...", noResults: "Không có kết quả" }}>
  ...
</NextIntlAdapter>

// hoặc Standalone React:
<TranslationProvider locale="vi" i18n={{ searchPlaceholder: "Tìm kiếm..." }}>
  ...
</TranslationProvider>
```

→ [Xem đầy đủ 50+ key và ví dụ tiếng Việt](./GlobalI18n.md)

### TranslationProvider / NextIntlAdapter (✅) — namespace-based

Components với i18n namespace tự động (đọc từ locale files):

| Component         | Namespace         | Keys                                    |
| ----------------- | ----------------- | --------------------------------------- |
| Alert             | `Common`          | closeAlert                              |
| DataTable         | `Common`          | columns, density, compact, normal, etc. |
| DatePicker        | `DatePicker`      | placeholder, today, clear               |
| Form              | `Form`            | submitButton, cancelButton, etc.        |
| GlobalLoading     | `Loading`         | loadingPage, pleaseWait                 |
| ImageUpload       | `OCR.imageUpload` | dragDropText, browseFiles, etc.         |
| Input             | `ValidationInput` | required, typeMismatch, etc.            |
| NotificationModal | `Common`          | close                                   |
| Pagination        | `Pagination`      | firstPage, previous, next, etc.         |
| ThemeToggle       | `Common`          | theme, lightTheme, darkTheme, etc.      |

---

## Usage Patterns

### Overlay Scrollbar (Opt-in)

Underverse dùng mô hình opt-in cho OverlayScrollbars:

- Không quét DOM global.
- Không auto mount provider mặc định.
- Bật theo từng component qua `useOverlayScrollbar`.

Ví dụ:

```tsx
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarProvider, ScrollArea } from "@underverse-ui/underverse";

function App() {
  return (
    <OverlayScrollbarProvider theme="os-theme-underverse">
      <ScrollArea className="h-56 rounded-xl border border-border" useOverlayScrollbar>
        ...
      </ScrollArea>
    </OverlayScrollbarProvider>
  );
}
```

### Standalone React (Vite, CRA)

```tsx
import { TranslationProvider, Button, DatePicker } from "@underverse-ui/underverse";

function App() {
  return (
    <TranslationProvider locale="ko">
      <DatePicker onChange={(date) => console.log(date)} />
      <Button>클릭</Button>
    </TranslationProvider>
  );
}
```

### Next.js với next-intl

```tsx
import { NextIntlAdapter, underverseMessages } from "@underverse-ui/underverse";

// Merge với app messages
const messages = { ...underverseMessages.vi, ...appMessages };

<NextIntlClientProvider locale="vi" messages={messages}>
  <NextIntlAdapter>{children}</NextIntlAdapter>
</NextIntlClientProvider>;
```

---

## Changelog

### v0.2.37

- Added Korean (ko) and Japanese (ja) locale support
- Added DateUtils with locale-aware formatting
- Added Animation utilities (useShadCNAnimations)
- Modal now supports portal components (DatePicker, Popover, DropdownMenu)
- TranslationProvider for standalone React usage
