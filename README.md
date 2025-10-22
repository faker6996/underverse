# Underverse UI (Next.js Playground)

This repository hosts a Next.js app that showcases and develops Underverse UI — a reusable component library extracted from this codebase. The app provides live examples and docs for all components, while the package in `packages/underverse` compiles and publishes the library to npm as `@underverse-ui/underverse`.

The default homepage (`app/page.tsx`) renders the Underverse guide at `app/docs/underverse/page.tsx` with interactive examples for Button, Badge, Modal, Tabs, Tooltip, Popover, Sheet, Switch, Slider, RadioGroup, ScrollArea, Table/DataTable, Progress, Skeleton, Carousel, DropdownMenu, Combobox/MultiCombobox, Section, SmartImage, CategoryTreeSelect, Input, Textarea, DatePicker, Pagination, ImageUpload, Alert, NotificationModal, Loading/GlobalLoading, ClientOnly, AccessDenied, and more.

## Features

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4, `clsx`, `tailwind-merge`
- i18n with `next-intl` (English/Vietnamese ready; KO/JA enums scaffolded)
- Underverse UI package with typed exports and local examples
- DataTable, DatePicker, Pagination, Alert, ImageUpload with i18n-ready messages
- Release scripts to publish `@underverse-ui/underverse`

## Project Structure

```
app/
  docs/underverse/           # Docs page and live examples
  page.tsx                   # Renders the Underverse guide by default
components/ui/               # Source UI components used by the app & package
i18n/                        # next-intl routing & locale message files
lib/                         # utilities, constants, helpers
packages/underverse/         # Publishable UI package (tsup build)
```

Key files to explore:
- `app/docs/underverse/page.tsx` – examples and usage docs in the app
- `components/ui/*` – the actual component source
- `packages/underverse/src/index.ts` – public package exports and messages
- `i18n/locales/{en,vi}.json` – app-level messages used in examples
- `i18n.config.ts`, `i18n/routing.ts` – locale settings

## Getting Started

Requirements: Node 18+

1) Install dependencies

```bash
npm install
```

2) Run the app

```bash
npm run dev
# App: http://localhost:3000
# Docs: http://localhost:3000/docs/underverse
```

3) Build and start (production)

```bash
npm run build
npm run start
```

## Using Underverse UI in Your App

Install from npm:

```bash
npm i @underverse-ui/underverse
npm i react react-dom next next-intl
```

Basic usage:

```tsx
import { Button, ToastProvider, useToast } from '@underverse-ui/underverse';

export default function Example() {
  const { addToast } = useToast();
  return (
    <ToastProvider>
      <Button onClick={() => addToast({ type: 'success', message: 'Saved' })}>
        Save
      </Button>
    </ToastProvider>
  );
}
```

Alternatively, you can import components locally from `components/ui/*` while developing inside this repo.

### Headless components from the package
- `ThemeToggle` (headless): UI only, you provide `theme` and `onChange`.
- `LanguageSwitcher` (headless): UI only, you provide `locales`, `currentLocale`, `onSwitch`.

Quick examples:

```tsx
import { ThemeToggle } from '@underverse-ui/underverse';
import { useState } from 'react';

export function MyThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'|'system'>('system');
  return <ThemeToggle theme={theme} onChange={setTheme} />;
}
```

```tsx
import { LanguageSwitcher } from '@underverse-ui/underverse';
import { useRouter, usePathname } from 'next/navigation';

export function MyLangSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const locales = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
  const onSwitch = (code: string) => {
    const segs = pathname.split('/');
    segs[1] = code;
    router.push(segs.join('/'));
  };
  return <LanguageSwitcher locales={locales} currentLocale={currentLocale} onSwitch={onSwitch} />;
}
```

## i18n (next-intl)

- The app demonstrates `next-intl` with English and Vietnamese. Message keys for common UI (Pagination, DatePicker, DataTable, Alert, ImageUpload, etc.) are included.
- The package also ships messages you can merge into your app:

```tsx
import {NextIntlClientProvider, getMessages} from 'next-intl/server';
import {underverseMessages} from '@underverse-ui/underverse';

const locale = 'en'; // derive from params/headers
const appMessages = await getMessages();
const uv = underverseMessages[locale] || underverseMessages.en;
const messages = {...uv, ...appMessages};

return (
  <NextIntlClientProvider locale={locale} messages={messages}>
    {children}
  </NextIntlClientProvider>
);
```

Configuration references:
- `i18n.config.ts` – default locales
- `i18n/routing.ts` – route strategy and detection

## Scripts

```bash
npm run dev                 # Next.js dev server
npm run dev_v2              # Dev with Turbopack
npm run build               # Build production
npm run start               # Start production server

# i18n utilities
npm run i18n:check          # Check missing keys
npm run i18n:check-locales  # Validate locale structure
npm run i18n:dedupe         # Remove duplicate keys
npm run i18n:remove-unused  # Remove unused keys

# Package (Underverse)
npm run dev:underverse      # Watch build package (tsup)
npm run release:underverse  # Release patch (default)
npm run release:underverse:minor
npm run release:underverse:major
npm run release:underverse:beta
```

For package publishing details, see `packages/underverse/PUBLISHING.md` and `packages/underverse/README.md`.

## Tech Notes

- Tailwind CSS 4 is used; ensure your app theme tokens align with Underverse component variants and color roles (primary, secondary, destructive, etc.).
- `next.config.ts` includes WASM-friendly headers and image patterns used by the demo.
- The UI package excludes app-coupled components (e.g., anything requiring custom APIs/sockets); see `packages/underverse/src/index.ts` for the exact public surface.

## Status

- Active development: extracting, stabilizing, and documenting UI components.
- Current package version: see `packages/underverse/package.json`.

## License

- App code: private (all rights reserved).
- Underverse package: MIT (see `packages/underverse/README.md`).
