<p align="center">
  <img src="public/favicon.svg" alt="Underverse UI" width="120" />
</p>

<h1 align="center">Underverse UI</h1>

<p align="center">
  <strong>A premium React/Next.js component library — beautifully crafted, production-ready, and fully typed.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@underverse-ui/underverse"><img src="https://img.shields.io/npm/v/@underverse-ui/underverse?style=flat-square&color=0ea5e9&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@underverse-ui/underverse"><img src="https://img.shields.io/npm/dm/@underverse-ui/underverse?style=flat-square&color=8b5cf6&label=downloads" alt="npm downloads" /></a>
  <img src="https://img.shields.io/badge/next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <a href="/packages/underverse/README.md"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="https://underverse.infiniq.com.vn/vi/docs/underverse">📖 Live Docs</a> •
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-component-catalog">🧩 Components</a> •
  <a href="https://github.com/faker6996/underverse/issues">🐛 Issues</a>
</p>

---

## ✨ Highlights

|     | Feature            | Details                                                                        |
| --- | ------------------ | ------------------------------------------------------------------------------ |
| 🧩  | **78+ Components** | From Button to DataTable, CalendarTimeline, UEditor (Tiptap), Charts, and more |
| 🎨  | **Tailwind CSS 4** | First-class dark mode, CSS custom properties, zero-runtime theme tokens        |
| 🌐  | **i18n Ready**     | `next-intl` powered — English & Vietnamese out of the box                      |
| ♿  | **Accessible**     | ARIA patterns, keyboard navigation, focus management                           |
| 📦  | **Tree-shakeable** | ESM + CJS dual build via `tsup` — import only what you use                     |
| 🧪  | **Well Tested**    | Unit, interaction, and E2E tests (Node test runner + Playwright)               |
| 🤖  | **AI-Friendly**    | Ships `AGENTS.md`, `api-reference.json`, `llms.txt`, and `agent-recipes.json`  |

---

## 📐 Architecture

```
underverse/
├── app/                          # Next.js 16 App Router
│   ├── [locale]/                 # i18n dynamic locale routing
│   │   └── (pages)/              # Page groups (docs, demos, etc.)
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles + Tailwind theme
│   ├── layout.tsx                # Root layout
│   └── robots.ts / sitemap.ts    # SEO utilities
│
├── components/ui/                # 78+ source UI components
│   ├── Button.tsx                # Atomic components
│   ├── DataTable/                # Complex compound components
│   ├── CalendarTimeline/         # Scheduler / timeline view
│   └── UEditor/                  # Rich-text editor (Tiptap-based)
│
├── i18n/                         # next-intl locale config & messages
│   └── locales/{en,vi}.json      # Translation files
│
├── lib/                          # Utilities, constants, helpers
├── hooks/                        # Custom React hooks
├── contexts/                     # React context providers
├── docs/                         # Internal documentation
├── scripts/                      # i18n check, cleanup, CI scripts
│
├── packages/underverse/          # 📦 Publishable npm package
│   ├── src/                      # Package source (re-exports from components/ui)
│   ├── dist/                     # Built output (ESM + CJS + types)
│   ├── locales/                  # Package-level i18n messages
│   ├── tests/                    # Package-level tests
│   └── CHANGELOG.md              # Release history
│
├── Dockerfile                    # Production Docker image
├── Jenkinsfile                   # CI/CD pipeline
└── playwright.config.ts          # E2E test configuration
```

---

## 🧩 Component Catalog

<details>
<summary><strong>View all 78+ components →</strong></summary>

### Core UI

| Component                   | Description                                                                |
| --------------------------- | -------------------------------------------------------------------------- |
| `Button`                    | Variants: default, outline, ghost, destructive, link — with loading states |
| `Badge`                     | Status indicators with color variants                                      |
| `Card`                      | Content container with header/body/footer                                  |
| `Avatar`                    | User avatars with image fallback                                           |
| `Skeleton`                  | Loading placeholder animation                                              |
| `Progress`                  | Determinate / indeterminate progress bars                                  |
| `Loading` / `GlobalLoading` | Spinner & full-page loading overlay                                        |

### Form Controls

| Component                       | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `Input`                         | Text input with label, error states, icons    |
| `Textarea`                      | Multi-line input with auto-resize             |
| `CheckBox`                      | Checkbox with indeterminate state             |
| `RadioGroup`                    | Radio button group                            |
| `Switch`                        | Toggle switch                                 |
| `Slider`                        | Range slider                                  |
| `Combobox` / `MultiCombobox`    | Searchable select with single/multi selection |
| `CategoryTreeSelect`            | Hierarchical tree select                      |
| `DatePicker` / `DateTimePicker` | Date & date-time picker                       |
| `MonthYearPicker`               | Month/year only picker                        |
| `TimePicker`                    | Time picker                                   |
| `Calendar`                      | Standalone calendar component                 |
| `ColorPicker`                   | Color selection input                         |
| `TagInput`                      | Multi-tag input field                         |
| `EmojiPicker`                   | Emoji selection widget                        |
| `ImageUpload` / `FileUpload`    | Drag-and-drop file/image upload               |
| `Form` / `label`                | Form wrapper (react-hook-form integration)    |

### Data Display

| Component          | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `Table`            | Basic table                                                                 |
| `DataTable`        | Feature-rich data table with sorting, filtering, pagination, sticky headers |
| `List`             | Ordered/unordered list                                                      |
| `Pagination`       | Page navigation                                                             |
| `Timeline`         | Vertical timeline events                                                    |
| `CalendarTimeline` | Horizontal scheduler / Gantt-style timeline                                 |
| `Breadcrumb`       | Navigation breadcrumb trail                                                 |

### Overlays & Feedback

| Component           | Description                              |
| ------------------- | ---------------------------------------- |
| `Modal`             | Dialog with backdrop                     |
| `Sheet`             | Side sliding panel                       |
| `Popover`           | Contextual floating content              |
| `Tooltip`           | Hover/focus tooltip                      |
| `DropdownMenu`      | Contextual menu                          |
| `Toast`             | Notification toasts with `ToastProvider` |
| `Alert`             | Inline alert messages                    |
| `NotificationModal` | Confirmation/notification dialog         |

### Layout & Navigation

| Component           | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `Section`           | Semantic layout section with spacing/container options |
| `Grid`              | CSS grid layout helper                                 |
| `Tab`               | Tab navigation                                         |
| `ScrollArea`        | Custom scrollable area                                 |
| `OverlayScrollArea` | OverlayScrollbars-powered scroll area                  |
| `Carousel`          | Image/content carousel                                 |

### Special

| Component              | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `UEditor`              | Rich-text editor powered by Tiptap — tables, code blocks, images, etc. |
| `SmartImage`           | Next.js Image with lazy loading & blur placeholder                     |
| `ThemeToggle`          | Light / dark / system theme switcher                                   |
| `LanguageSwitcher`     | Locale switcher UI                                                     |
| `MusicPlayer`          | Background music player                                                |
| `FloatingContacts`     | Floating social contact buttons                                        |
| `FallingIcons`         | Decorative falling icon animation                                      |
| `Watermark`            | Page watermark overlay                                                 |
| `ColorThemeCustomizer` | Live theme color customizer                                            |
| `AccessDenied`         | 403 access denied page                                                 |
| `ClientOnly`           | SSR-safe client-only wrapper                                           |

</details>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone & Install

```bash
git clone https://github.com/faker6996/underverse.git
cd underverse
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
# ➜ http://localhost:3000
# ➜ Docs: http://localhost:3000/docs/underverse
```

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 📦 Install as a Package

Use Underverse UI in **any** Next.js project:

```bash
npm i @underverse-ui/underverse
```

```tsx
import { Button, ToastProvider, useToast } from "@underverse-ui/underverse";

export default function App() {
  const { addToast } = useToast();
  return (
    <ToastProvider>
      <Button onClick={() => addToast({ type: "success", message: "Saved!" })}>Save</Button>
    </ToastProvider>
  );
}
```

### Headless Components

Some components ship as **headless** — they render the UI but leave state management to you:

```tsx
// Theme Toggle (headless)
import { ThemeToggle } from "@underverse-ui/underverse";
import { useState } from "react";

export function MyThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  return <ThemeToggle theme={theme} onChange={setTheme} />;
}
```

```tsx
// Language Switcher (headless)
import { LanguageSwitcher } from "@underverse-ui/underverse";
import { useRouter, usePathname } from "next/navigation";

export function MyLangSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <LanguageSwitcher
      locales={[
        { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
        { code: "en", name: "English", flag: "🇺🇸" },
      ]}
      currentLocale={currentLocale}
      onSwitch={(code) => {
        const segs = pathname.split("/");
        segs[1] = code;
        router.push(segs.join("/"));
      }}
    />
  );
}
```

---

## 🌐 Internationalization (i18n)

Powered by [`next-intl`](https://next-intl-docs.vercel.app/) with English and Vietnamese built-in.

The package ships its own i18n messages — merge them into your app:

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { underverseMessages } from "@underverse-ui/underverse";

export default async function Layout({ children, params }) {
  const locale = (await params).locale;
  const appMessages = await getMessages();
  const uv = underverseMessages[locale] || underverseMessages.en;

  return (
    <NextIntlClientProvider locale={locale} messages={{ ...uv, ...appMessages }}>
      {children}
    </NextIntlClientProvider>
  );
}
```

**Config files:**

- `i18n.config.ts` — default locale & supported locales
- `i18n/routing.ts` — route strategy & locale detection
- `i18n/locales/{en,vi}.json` — translation messages

---

## 🛠 Scripts Reference

### Development

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Start dev server (with Node inspector) |
| `npm run dev_v2`        | Start dev server with Turbopack        |
| `npm run build`         | Build production bundle                |
| `npm run start`         | Start production server                |
| `npm run lint`          | Run ESLint                             |
| `npm run typecheck`     | Type-check main app                    |
| `npm run typecheck:app` | Type-check app-specific config         |

### Testing

| Command                          | Description                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| `npm run check`                  | Run **all** type-checks, boundary checks, locale checks, and tests |
| `npm run test:e2e`               | Playwright end-to-end tests                                        |
| `npm run test:e2e:headed`        | E2E tests in headed browser                                        |
| `npm run test:ueditor`           | UEditor unit tests                                                 |
| `npm run test:data-table`        | DataTable unit tests                                               |
| `npm run test:calendar-timeline` | CalendarTimeline unit tests                                        |
| `npm run test:underverse-smoke`  | Package smoke tests (public API + component rendering)             |

### i18n Utilities

| Command                      | Description                        |
| ---------------------------- | ---------------------------------- |
| `npm run i18n:check`         | Check for missing translation keys |
| `npm run i18n:check-locales` | Validate locale file structure     |
| `npm run i18n:dedupe`        | Remove duplicate keys              |
| `npm run i18n:remove-unused` | Remove unused translation keys     |

### Package Publishing

| Command                            | Description                    |
| ---------------------------------- | ------------------------------ |
| `npm run dev:underverse`           | Watch-build the package (tsup) |
| `npm run release:underverse`       | Release patch version          |
| `npm run release:underverse:minor` | Release minor version          |
| `npm run release:underverse:major` | Release major version          |
| `npm run release:underverse:beta`  | Release beta version           |

### Docker

| Command                     | Description               |
| --------------------------- | ------------------------- |
| `npm run docker:local:up`   | Start local Docker stack  |
| `npm run docker:local:down` | Stop local Docker stack   |
| `npm run docker:up`         | Start production Docker   |
| `npm run docker:restart`    | Restart production Docker |

### Code Quality

| Command                            | Description                             |
| ---------------------------------- | --------------------------------------- |
| `npm run check:package-boundaries` | Verify package boundary rules           |
| `npm run cleanup:console`          | Remove stray `console.log` statements   |
| `npm run fix:tailwind`             | Fix Tailwind arbitrary value formatting |

---

## 🏗 Tech Stack

| Layer             | Technology                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| **Framework**     | [Next.js 16](https://nextjs.org/) (App Router)                         |
| **UI**            | [React 19](https://react.dev/)                                         |
| **Language**      | [TypeScript 5](https://www.typescriptlang.org/)                        |
| **Styling**       | [Tailwind CSS 4](https://tailwindcss.com/) + `clsx` + `tailwind-merge` |
| **Variants**      | [class-variance-authority](https://cva.style/)                         |
| **Icons**         | [Lucide React](https://lucide.dev/)                                    |
| **Rich Text**     | [Tiptap 3](https://tiptap.dev/) (ProseMirror-based)                    |
| **Forms**         | [React Hook Form](https://react-hook-form.com/)                        |
| **i18n**          | [next-intl](https://next-intl-docs.vercel.app/)                        |
| **Scrolling**     | [OverlayScrollbars](https://kingsora.github.io/OverlayScrollbars/)     |
| **Package Build** | [tsup](https://tsup.egoist.dev/)                                       |
| **Testing**       | Node test runner + [Playwright](https://playwright.dev/)               |
| **CI/CD**         | Jenkins + Docker                                                       |

---

## 🤖 AI & Agent Support

The published package includes metadata for AI coding assistants:

| File                 | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `AGENTS.md`          | Coding guidelines, patterns, and conventions  |
| `api-reference.json` | Machine-readable API surface (auto-generated) |
| `llms.txt`           | LLM-friendly package summary                  |
| `agent-recipes.json` | Common integration recipes for AI agents      |

---

## 📄 Additional Docs

- [`packages/underverse/README.md`](/packages/underverse/README.md) — Detailed package documentation
- [`packages/underverse/PUBLISHING.md`](/packages/underverse/PUBLISHING.md) — Publishing workflow
- [`packages/underverse/CHANGELOG.md`](/packages/underverse/CHANGELOG.md) — Release history
- [`docs/COLOR_SYSTEM.md`](/docs/COLOR_SYSTEM.md) — Color system & theming guide
- [`docs/underverseui-usage/`](/docs/underverseui-usage/) — Per-component usage guides

---

## 📜 License

| Scope                           | License                              |
| ------------------------------- | ------------------------------------ |
| **App code**                    | Private — All rights reserved        |
| **`@underverse-ui/underverse`** | [MIT](packages/underverse/README.md) |

---

<p align="center">
  Made with 💜 by <a href="https://github.com/faker6996">Tran Van Bach</a>
</p>
