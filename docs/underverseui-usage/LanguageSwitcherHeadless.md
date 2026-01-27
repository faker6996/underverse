# LanguageSwitcherHeadless

Source: `components/ui/LanguageSwitcherHeadless.tsx`

Exports:

- LanguageSwitcher
- LanguageSwitcherHeadless

Note: Usage snippets are minimal; fill required props from the props type below.

## LanguageSwitcher

Props type: `LanguageSwitcherHeadlessProps`

```tsx
import { LanguageSwitcher } from "@underverse-ui/underverse";

export function Example() {
  return <LanguageSwitcher />;
}
```

Vi du day du:

```tsx
import React from "react";
import { LanguageSwitcher } from "@underverse-ui/underverse";

export function Example() {
  const locales = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  return <LanguageSwitcher locales={locales} currentLocale="vi" onSwitch={(code) => console.log(code)} />;
}
```

### Với Next.js Router:

```tsx
import { LanguageSwitcher } from "@underverse-ui/underverse";
import { useRouter, usePathname } from "next/navigation";

const locales = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const onSwitch = (code: string) => {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
  };

  return <LanguageSwitcher locales={locales} currentLocale={currentLocale} onSwitch={onSwitch} labels={{ heading: "Language" }} />;
}
```

```ts
export interface LanguageSwitcherHeadlessProps {
  locales: LanguageOption[];
  currentLocale: string;
  onSwitch: (code: string) => void;
  labels?: { heading?: string };
  className?: string;
}
```

## LanguageSwitcherHeadless

Props type: `LanguageSwitcherHeadlessProps`

```tsx
import { LanguageSwitcherHeadless } from "@underverse-ui/underverse";

export function Example() {
  return <LanguageSwitcherHeadless />;
}
```

Vi du day du:

```tsx
import React from "react";
import { LanguageSwitcherHeadless } from "@underverse-ui/underverse";

export function Example() {
  const locales = [
    { code: "vi", name: "Tieng Viet", flag: "VN" },
    { code: "en", name: "English", flag: "EN" },
  ];

  return <LanguageSwitcherHeadless locales={locales} currentLocale="vi" onSwitch={(code) => console.log(code)} />;
}
```

```ts
export interface LanguageSwitcherHeadlessProps {
  locales: LanguageOption[];
  currentLocale: string;
  onSwitch: (code: string) => void;
  labels?: { heading?: string };
  className?: string;
}
```
