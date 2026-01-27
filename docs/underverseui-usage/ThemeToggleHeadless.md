# ThemeToggleHeadless

Source: `components/ui/ThemeToggleHeadless.tsx`

Exports:
- ThemeToggle
- ThemeToggleHeadless

Note: Usage snippets are minimal; fill required props from the props type below.

## ThemeToggle

Props type: `ThemeToggleHeadlessProps`

```tsx
import { ThemeToggle } from "@underverse-ui/underverse";

export function Example() {
  return <ThemeToggle />;
}
```

Vi du day du:

```tsx
import React from "react";
import { ThemeToggle } from "@underverse-ui/underverse";

export function Example() {
  const [theme, setTheme] = React.useState("system");
  return <ThemeToggle theme={theme} onChange={setTheme} />;
}
```

```ts
export interface ThemeToggleHeadlessProps {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  labels?: {
    heading?: string;
    light?: string;
    dark?: string;
    system?: string;
  };
  className?: string;
}
```

## ThemeToggleHeadless

Props type: `ThemeToggleHeadlessProps`

```tsx
import { ThemeToggleHeadless } from "@underverse-ui/underverse";

export function Example() {
  return <ThemeToggleHeadless />;
}
```

Vi du day du:

```tsx
import React from "react";
import { ThemeToggleHeadless } from "@underverse-ui/underverse";

export function Example() {
  const [theme, setTheme] = React.useState("system");
  return <ThemeToggleHeadless theme={theme} onChange={setTheme} />;
}
```

```ts
export interface ThemeToggleHeadlessProps {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  labels?: {
    heading?: string;
    light?: string;
    dark?: string;
    system?: string;
  };
  className?: string;
}
```
