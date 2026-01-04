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
    { code: "vi", name: "Tieng Viet", flag: "VN" },
    { code: "en", name: "English", flag: "EN" },
  ];

  return (
    <LanguageSwitcher
      locales={locales}
      currentLocale="vi"
      onSwitch={(code) => console.log(code)}
    />
  );
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

  return (
    <LanguageSwitcherHeadless
      locales={locales}
      currentLocale="vi"
      onSwitch={(code) => console.log(code)}
    />
  );
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
