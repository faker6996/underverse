# Underverse UI - Components Documentation

## Overview

Underverse UI là thư viện UI components cho React/Next.js với hỗ trợ đa ngôn ngữ.

- **Version:** 0.2.37+
- **Supported Locales:** English (en), Tiếng Việt (vi), 한국어 (ko), 日本語 (ja)
- **License:** MIT

## Quick Links

### 🚀 Getting Started

- [TranslationProvider](./TranslationProvider.md) - i18n context cho Standalone React

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
| [TimePicker](./TimePicker.md)                 | Time picker           | -    |
| [Calendar](./Calendar.md)                     | Full calendar view    | -    |
| [CalendarTimeline](./CalendarTimeline.md)     | Resource timeline     | ✅   |
| [Combobox](./Combobox.md)                     | Searchable select     | -    |
| [MultiCombobox](./MultiCombobox.md)           | Multi-select combobox | -    |
| [CategoryTreeSelect](./CategoryTreeSelect.md) | Tree select           | -    |
| [ColorPicker](./ColorPicker.md)               | Color picker          | -    |

### Feedback & Overlays

| Component                                   | Description                     | i18n |
| ------------------------------------------- | ------------------------------- | ---- |
| [Modal](./Modal.md)                         | Modal dialog (+ Portal support) | -    |
| [Toast](./Toast.md)                         | Toast notifications             | -    |
| [Tooltip](./Tooltip.md)                     | Tooltip                         | -    |
| [Popover](./Popover.md)                     | Popover                         | -    |
| [Sheet](./Sheet.md)                         | Slide-over panels               | -    |
| [Alert](./Alert.md)                         | Alert messages                  | ✅   |
| [GlobalLoading](./GlobalLoading.md)         | Loading indicators              | ✅   |
| [NotificationModal](./NotificationModal.md) | Notification modal              | ✅   |

### Navigation & Structure

| Component                         | Description           | i18n |
| --------------------------------- | --------------------- | ---- |
| [Breadcrumb](./Breadcrumb.md)     | Breadcrumb navigation | -    |
| [Tabs](./Tabs.md)                 | Tab navigation        | -    |
| [DropdownMenu](./DropdownMenu.md) | Dropdown menu         | -    |
| [Pagination](./Pagination.md)     | Pagination controls   | ✅   |
| [Section](./Section.md)           | Section container     | -    |
| [ScrollArea](./ScrollArea.md)     | Scrollable area       | -    |

### Data Display

| Component                   | Description         | i18n |
| --------------------------- | ------------------- | ---- |
| [Table](./Table.md)         | Basic table         | -    |
| [DataTable](./DataTable.md) | Advanced data table | ✅   |
| [List](./List.md)           | List component      | -    |
| [Grid](./Grid.md)           | Grid layout         | -    |
| [Timeline](./Timeline.md)   | Timeline display    | -    |

### Media

| Component                         | Description             | i18n |
| --------------------------------- | ----------------------- | ---- |
| [SmartImage](./SmartImage.md)     | Optimized image         | -    |
| [ImageUpload](./ImageUpload.md)   | Image upload            | ✅   |
| [Carousel](./Carousel.md)         | Image carousel          | -    |
| [FallingIcons](./FallingIcons.md) | Falling icons animation | -    |
| [Watermark](./Watermark.md)       | Watermark overlay       | -    |
| [MusicPlayer](./MusicPlayer.md)   | Music player            | -    |

### Misc & Utilities

| Component                                                 | Description                  |
| --------------------------------------------------------- | ---------------------------- |
| [ClientOnly](./ClientOnly.md)                             | Client-side only render      |
| [Loading](./Loading.md)                                   | Loading spinners             |
| [FloatingContacts](./FloatingContacts.md)                 | Floating contact buttons     |
| [AccessDenied](./AccessDenied.md)                         | Access denied page           |
| [OverlayControls](./OverlayControls.md)                   | Overlay control buttons      |
| [ThemeToggleHeadless](./ThemeToggleHeadless.md)           | Theme toggle (headless)      |
| [LanguageSwitcherHeadless](./LanguageSwitcherHeadless.md) | Language switcher (headless) |

---

## i18n Components

Components với i18n support tự động:

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
import { underverseMessages } from "@underverse-ui/underverse";

// Merge với app messages
const messages = { ...underverseMessages.vi, ...appMessages };

<NextIntlClientProvider locale="vi" messages={messages}>
  {children}
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
