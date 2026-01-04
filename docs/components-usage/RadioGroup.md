# RadioGroup

Source: `components/ui/RadioGroup.tsx`

Exports:
- RadioGroup
- RadioGroupItem

Note: Usage snippets are minimal; fill required props from the props type below.

## RadioGroup

Props type: `RadioGroupProps`

```tsx
import { RadioGroup } from "@underverse-ui/underverse";

export function Example() {
  return (
    <RadioGroup>
      Content
    </RadioGroup>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { RadioGroup, RadioGroupItem } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("basic");
  return (
    <RadioGroup value={value} onValueChange={setValue} orientation="vertical">
      <RadioGroupItem value="basic" label="Goi co ban" />
      <RadioGroupItem value="pro" label="Goi nang cao" />
    </RadioGroup>
  );
}
```

```ts
interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "button";
  className?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}
```

## RadioGroupItem

Props type: `RadioGroupItemProps`

```tsx
import { RadioGroupItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <RadioGroupItem>
      Content
    </RadioGroupItem>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { RadioGroup, RadioGroupItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <RadioGroup defaultValue="standard">
      <RadioGroupItem value="standard" label="Tieu chuan" />
    </RadioGroup>
  );
}
```

```ts
interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}
```
