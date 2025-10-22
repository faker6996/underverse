# Underverse UI

Docs: https://underverse-sepia.vercel.app/vi/docs/underverse

**Author:** Tran Van Bach

A comprehensive UI component library for React/Next.js applications, extracted from the main project. Built with Tailwind CSS, `clsx`, and `tailwind-merge`. Some components support `next-intl` (optional).

## Requirements
- Node >= 18
- Peer dependencies: `react`, `react-dom`, `next`, `next-intl`

## Installation
```bash
# Install the package
npm i @underverse-ui/underverse

# Install peer dependencies (if not already in your app)
npm i react react-dom next next-intl
```

## Tailwind CSS Configuration
Components use color variables like `primary`, `secondary`, `destructive`, etc. Make sure your Tailwind theme/tokens include these variables.

## Quick Start

```tsx
import { Button, ToastProvider, useToast } from "@underverse-ui/underverse";

function App() {
  const { addToast } = useToast();
  return (
    <ToastProvider>
      <Button onClick={() => addToast({ type: 'success', message: 'Hello' })}>
        Click me
      </Button>
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

## next-intl Integration (Next.js App Router)

1) Configure plugin and time zone (to avoid `ENVIRONMENT_FALLBACK`):

```ts
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  timeZone: 'Asia/Ho_Chi_Minh' // important for SSR
});

export default withNextIntl({
  // your other Next config
});
```

2) Merge underverse messages with your app messages:

```tsx
// app/layout.tsx (simplified)
import {NextIntlClientProvider, getMessages} from 'next-intl/server';
import {underverseMessages} from '@underverse-ui/underverse';

export default async function RootLayout({children}:{children: React.ReactNode}) {
  const appMessages = await getMessages();
  const locale = 'vi'; // derive from params/headers
  const uv = underverseMessages[locale] || underverseMessages.en;
  const messages = {...uv, ...appMessages}; // app overrides uv if overlaps

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

3) Use components normally. Any built‑in texts (DatePicker/Pagination/DataTable/Alert/ImageUpload…) will use merged messages. You can still override labels via props if desired.

## Message Keys Summary

- `Common`: close, closeAlert, notifications, newNotification, readStatus, openLink, theme, lightTheme, darkTheme, systemTheme, density, compact, normal, comfortable, columns
- `ValidationInput`: required, typeMismatch, pattern, tooShort, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, badInput, invalid
- `Loading`: loadingPage, pleaseWait
- `DatePicker`: placeholder, today, clear
- `Pagination`: navigationLabel, showingResults ({startItem},{endItem},{totalItems}), firstPage, previousPage, previous, nextPage, next, lastPage, pageNumber ({page}), itemsPerPage, search, noOptions
- `OCR.imageUpload`: dragDropText, browseFiles, supportedFormats

## License

MIT

## Author

Tran Van Bach

---

## Headless Components Usage

These variants avoid app-specific contexts and routing so you can wire them to your own state.

### ThemeToggle (headless)

```tsx
import { ThemeToggle } from '@underverse-ui/underverse';
import type { ThemeToggleProps, ThemeMode } from '@underverse-ui/underverse';
import { useState } from 'react';

export default function ExampleThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  return (
    <ThemeToggle
      theme={theme}
      onChange={setTheme}
      // optional labels
      labels={{ heading: 'Theme', light: 'Light', dark: 'Dark', system: 'System' }}
    />
  );
}
```

If you use `next-themes` or a custom context, pass your current theme and the setter to `onChange`.

### LanguageSwitcher (headless)

```tsx
import { LanguageSwitcher } from '@underverse-ui/underverse';
import type { LanguageOption } from '@underverse-ui/underverse';
import { useRouter, usePathname } from 'next/navigation';

const locales: LanguageOption[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

export default function ExampleLanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const onSwitch = (code: string) => {
    // Replace first segment as locale, e.g. /vi/... -> /en/...
    const segs = pathname.split('/');
    segs[1] = code; 
    router.push(segs.join('/'));
  };

  return (
    <LanguageSwitcher
      locales={locales}
      currentLocale={currentLocale}
      onSwitch={onSwitch}
      labels={{ heading: 'Language' }}
    />
  );
}
```
