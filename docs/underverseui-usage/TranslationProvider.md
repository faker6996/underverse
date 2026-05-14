# TranslationProvider

Source: `packages/underverse/src/contexts/TranslationContext.tsx`

Exports:

- TranslationProvider
- useUnderverseTranslations
- useUnderverseLocale

Note: Đây là context cho i18n trong Standalone React (không cần next-intl).

## TranslationProvider

Props type: `TranslationProviderProps`

```tsx
import { TranslationProvider } from "@underverse-ui/underverse";

export function App() {
  return (
    <TranslationProvider locale="vi">
      <YourApp />
    </TranslationProvider>
  );
}
```

### Ví dụ đầy đủ với custom translations:

```tsx
import React from "react";
import { TranslationProvider, DatePicker, Button } from "@underverse-ui/underverse";

export function App() {
  return (
    <TranslationProvider
      locale="ko"
      translations={{
        Common: {
          close: "닫기 (custom)",
        },
        DatePicker: {
          placeholder: "날짜 선택 (custom)",
        },
      }}
    >
      <DatePicker onChange={(date) => console.log(date)} />
      <Button>한국어 버튼</Button>
    </TranslationProvider>
  );
}
```

### Props

```ts
export type Locale = "en" | "vi" | "ko" | "ja";

export type Translations = Record<string, Record<string, string>>;

export interface TranslationProviderProps {
  children: React.ReactNode;
  locale?: Locale;
  translations?: Translations;
  /** Override built-in English labels across all components. See GlobalI18nConfig. */
  i18n?: GlobalI18nConfig;
}
```

> **Xem thêm:** [`GlobalI18nConfig`](./GlobalI18n.md) — danh sách đầy đủ các key có thể override và ví dụ tiếng Việt.

### Supported Locales

| Locale | Language   | Flag |
| ------ | ---------- | ---- |
| `en`   | English    | 🇺🇸   |
| `vi`   | Tiếng Việt | 🇻🇳   |
| `ko`   | 한국어     | 🇰🇷   |
| `ja`   | 日本語     | 🇯🇵   |

## useUnderverseTranslations

Hook để lấy translation function.

```tsx
import { useUnderverseTranslations } from "@underverse-ui/underverse";

function MyComponent() {
  const t = useUnderverseTranslations("Common");

  return <button>{t("close")}</button>;
}
```

## useUnderverseLocale

Hook để lấy locale hiện tại.

```tsx
import { useUnderverseLocale } from "@underverse-ui/underverse";

function MyComponent() {
  const locale = useUnderverseLocale();

  return <span>Current locale: {locale}</span>;
}
```

## Sử dụng với Next.js (next-intl)

Nếu bạn đang dùng Next.js với `next-intl`, không cần `TranslationProvider`, nhưng nên bọc app bằng `NextIntlAdapter` để Underverse đọc đúng locale/messages từ `next-intl`. Truyền thêm `i18n` để override các label hardcoded tiếng Anh:

```tsx
// app/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { NextIntlAdapter, underverseMessages } from "@underverse-ui/underverse";
import type { GlobalI18nConfig } from "@underverse-ui/underverse";

const i18n: GlobalI18nConfig = {
  searchPlaceholder: "Tìm kiếm...",
  selectPlaceholder: "Chọn...",
  noResults: "Không có kết quả",
  clearAll: "Xóa tất cả",
  selectedCount: (n) => `Đã chọn ${n}`,
  moreCount: (n) => `+${n} khác`,
  // ... xem GlobalI18nConfig để biết đầy đủ các key
};

export default async function RootLayout({ children, params }) {
  const locale = params.locale || "vi";
  const appMessages = await getMessages();
  const uvMessages = underverseMessages[locale] || underverseMessages.en;

  return (
    <NextIntlClientProvider locale={locale} messages={{ ...uvMessages, ...appMessages }}>
      <NextIntlAdapter i18n={i18n}>{children}</NextIntlAdapter>
    </NextIntlClientProvider>
  );
}
```

> **Xem thêm:** [`GlobalI18nConfig`](./GlobalI18n.md) — danh sách đầy đủ 50+ key.

## Available Message Keys

### Common

- `close`, `closeAlert`, `notifications`, `newNotification`
- `readStatus`, `openLink`, `theme`, `lightTheme`, `darkTheme`, `systemTheme`
- `density`, `compact`, `normal`, `comfortable`, `columns`

### ValidationInput

- `required`, `typeMismatch`, `pattern`, `tooShort`, `tooLong`
- `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `invalid`

### Loading

- `loadingPage`, `pleaseWait`

### DatePicker

- `placeholder`, `today`, `clear`

### Pagination

- `navigationLabel`, `showingResults`, `firstPage`, `previousPage`, `previous`
- `nextPage`, `next`, `lastPage`, `pageNumber`, `itemsPerPage`, `search`, `noOptions`

### Form

- `submitButton`, `cancelButton`, `resetButton`, `saving`, `saveSuccess`, `saveError`

### OCR.imageUpload

- `dragDropText`, `browseFiles`, `supportedFormats`
