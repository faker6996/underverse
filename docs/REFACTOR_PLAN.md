# Kế Hoạch Refactor UI Library để Hỗ Trợ React & Next.js

## Mục tiêu

Refactor thư viện UI components để có thể sử dụng được với:

- ✅ Next.js App Router
- ✅ Next.js Pages Router
- ✅ React (Vite, CRA, etc.)

---

## Phân Tích Hiện Trạng

### Dependencies cần xử lý

| Package        | Vấn đề                     | Giải pháp                                     |
| -------------- | -------------------------- | --------------------------------------------- |
| `next-intl`    | Chỉ dùng được với Next.js  | Tạo translation context riêng hoặc dùng props |
| `"use client"` | Cú pháp Next.js App Router | Giữ lại, React sẽ ignore                      |
| `@/lib/...`    | Path alias của Next.js     | Cấu hình bundler để resolve                   |

### Components sử dụng `next-intl` (11 files)

- [ ] `Alert.tsx` - `useTranslations("Common")`
- [ ] `DataTable.tsx` - `useTranslations("Common")`
- [ ] `DatePicker.tsx` - `useTranslations("DatePicker")`, `useLocale()`
- [ ] `Form.tsx` - `useTranslations("Form")`
- [ ] `GlobalLoading.tsx` - `useTranslations("Loading")`
- [ ] `ImageUpload.tsx` - `useTranslations("OCR.imageUpload")`
- [ ] `Input.tsx` - `useTranslations("ValidationInput")`
- [ ] `LanguageSwitcher.tsx` - `useTranslations("Common")`
- [ ] `NotificationModal.tsx` - `useTranslations("Common")`
- [ ] `Pagination.tsx` - `useTranslations("Pagination")`
- [ ] `ThemeToggle.tsx` - `useTranslations("Common")`

---

## Kế Hoạch Triển Khai

### Phase 1: Thiết lập cấu trúc package (1-2 ngày)

- [x] **1.1** Tạo folder `packages/underverse/` với cấu trúc chuẩn ✅ (đã có sẵn)
- [x] **1.2** Thiết lập `tsconfig.json` cho package ✅ (đã có sẵn)
- [x] **1.3** Cấu hình bundler (tsup) ✅
- [x] **1.4** Tạo `package.json` với exports map ✅ (đã có sẵn)
- [x] **1.5** Setup build scripts ✅

### Phase 2: Tạo Translation Provider (1 ngày)

- [x] **2.1** Tạo `TranslationContext` để thay thế `next-intl` ✅
- [x] **2.2** Tạo hook `useUnderverseTranslations` riêng cho thư viện ✅
- [x] **2.3** Tạo default translations (vi, en) ✅ (đã có sẵn)
- [x] **2.4** Cho phép user override translations ✅
- [x] **2.5** Tạo utility `cn()` local cho package ✅

### Phase 3: Refactor Components (3-5 ngày)

- [x] **3.1** Tạo translation adapter (`lib/i18n/translation-adapter.tsx`) ✅
- [x] **3.2** Cập nhật 11 components để sử dụng translation adapter:
  - [x] `Alert.tsx` ✅
  - [x] `DataTable.tsx` ✅
  - [x] `DatePicker.tsx` ✅
  - [x] `Form.tsx` ✅
  - [x] `GlobalLoading.tsx` ✅
  - [x] `ImageUpload.tsx` ✅
  - [x] `Input.tsx` ✅
  - [x] `LanguageSwitcher.tsx` ✅
  - [x] `NotificationModal.tsx` ✅
  - [x] `Pagination.tsx` ✅
  - [x] `ThemeToggle.tsx` ✅
- [x] **3.3** Thêm interpolation support cho translations ✅
- [x] **3.4** Tạo barrel exports (`index.ts`) ✅
- [x] **3.5** Build thành công cả package và project chính ✅

### Phase 4: Utilities & Helpers (1 ngày)

- [x] **4.1** Tạo `cn()` utility local cho package ✅
- [x] **4.2** Tạo animation helpers (`useShadCNAnimations`, `injectAnimationStyles`, `getAnimationStyles`) ✅
- [x] **4.3** Tạo date utilities với locale support ✅
  - `formatDate`, `formatDateShort`, `formatTime`, `formatDateTime`
  - `formatTimeAgo`, `formatDateSmart`
  - `isToday`, `isYesterday`, `getDayOfWeek`
  - `formatDateForInput`, `formatDateTimeForInput`
- [x] **4.4** Export tất cả utilities từ package ✅

### Phase 5: Testing & Documentation (2-3 ngày)

- [ ] **5.1** Tạo Storybook cho components
- [ ] **5.2** Test với React (Vite) project
- [ ] **5.3** Test với Next.js project
- [ ] **5.4** Viết README.md cho package
- [ ] **5.5** Tạo docs cho từng component

### Phase 6: Publish (1 ngày)

- [ ] **6.1** Setup npm account / organization
- [ ] **6.2** Cấu hình CI/CD cho publish
- [ ] **6.3** Publish beta version
- [ ] **6.4** Test install từ npm
- [ ] **6.5** Publish stable version

---

## Chi Tiết Kỹ Thuật

### Cấu trúc Package mới

```
packages/underverse-ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── DatePicker/
│   │   │   ├── DatePicker.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── contexts/
│   │   └── TranslationContext.tsx
│   ├── hooks/
│   │   ├── useTranslations.ts
│   │   └── useToast.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── date.ts
│   ├── locales/
│   │   ├── en.json
│   │   └── vi.json
│   └── index.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### Package.json

```json
{
  "name": "@underverse/ui",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0"
  }
}
```

### TranslationContext Example

```tsx
// contexts/TranslationContext.tsx
import * as React from "react";
import enLocale from "../locales/en.json";
import viLocale from "../locales/vi.json";

type Locale = "en" | "vi";
type Translations = Record<string, Record<string, string>>;

interface TranslationContextType {
  locale: Locale;
  t: (namespace: string, key: string) => string;
}

const defaultTranslations: Record<Locale, Translations> = {
  en: enLocale,
  vi: viLocale,
};

const TranslationContext = React.createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: React.ReactNode;
  locale?: Locale;
  translations?: Translations;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children, locale = "en", translations }) => {
  const t = React.useCallback(
    (namespace: string, key: string) => {
      const mergedTranslations = {
        ...defaultTranslations[locale],
        ...translations,
      };
      return mergedTranslations[namespace]?.[key] || key;
    },
    [locale, translations]
  );

  return <TranslationContext.Provider value={{ locale, t }}>{children}</TranslationContext.Provider>;
};

export const useTranslations = (namespace: string) => {
  const context = React.useContext(TranslationContext);

  // Fallback for when provider is not available
  if (!context) {
    return (key: string) => key;
  }

  return (key: string) => context.t(namespace, key);
};

export const useLocale = () => {
  const context = React.useContext(TranslationContext);
  return context?.locale || "en";
};
```

### Component Refactor Example (DatePicker)

```tsx
// BEFORE (dùng next-intl)
import { useTranslations, useLocale } from "next-intl";

export const DatePicker = ({ ... }) => {
  const t = useTranslations("DatePicker");
  const locale = useLocale();

  return (
    <Button>{t("clear")}</Button>
  );
};

// AFTER (dùng internal context + props override)
import { useTranslations, useLocale } from "../contexts/TranslationContext";

export interface DatePickerProps {
  // ... existing props
  labels?: {
    clear?: string;
    today?: string;
    placeholder?: string;
  };
}

export const DatePicker = ({ labels, ... }: DatePickerProps) => {
  const t = useTranslations("DatePicker");
  const locale = useLocale();

  return (
    <Button>{labels?.clear || t("clear")}</Button>
  );
};
```

---

## Sử Dụng Sau Khi Refactor

### React (Vite/CRA)

```tsx
import { TranslationProvider, DatePicker, Button } from "@underverse/ui";
import "@underverse/ui/styles.css";

function App() {
  return (
    <TranslationProvider locale="vi">
      <DatePicker onChange={(date) => console.log(date)} />
      <Button>Click me</Button>
    </TranslationProvider>
  );
}
```

### Next.js (có thể dùng next-intl adapter)

```tsx
// Tạo adapter để dùng next-intl
import { NextIntlAdapter } from "@underverse/ui/adapters/next-intl";
import { useTranslations } from "next-intl";

function App() {
  return (
    <NextIntlAdapter>
      <DatePicker onChange={(date) => console.log(date)} />
    </NextIntlAdapter>
  );
}
```

---

## Tiến Độ

| Phase                | Status          | Ngày bắt đầu | Ngày hoàn thành |
| -------------------- | --------------- | ------------ | --------------- |
| Phase 1: Setup       | ✅ Hoàn thành   | 05/01/2026   | 05/01/2026      |
| Phase 2: Translation | ✅ Hoàn thành   | 05/01/2026   | 05/01/2026      |
| Phase 3: Refactor    | ✅ Hoàn thành   | 05/01/2026   | 05/01/2026      |
| Phase 4: Utilities   | ✅ Hoàn thành   | 05/01/2026   | 05/01/2026      |
| Phase 5: Testing     | ⏳ Chưa bắt đầu | -            | -               |
| Phase 6: Publish     | ⏳ Chưa bắt đầu | -            | -               |

---

## Notes

- Giữ backward compatibility với project hiện tại
- Có thể dùng monorepo (turborepo/pnpm workspace) để develop song song
- CSS có thể dùng Tailwind hoặc export CSS variables
