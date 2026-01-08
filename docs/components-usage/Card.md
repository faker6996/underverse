# Card

Source: `components/ui/Card.tsx`

Exports:

- Card

Note: Usage snippets are minimal; fill required props from the props type below.

## Card

Props type: `CardProps`

```tsx
import { Card } from "@underverse-ui/underverse";

export function Example() {
  return <Card>Content</Card>;
}
```

Vi du day du:

```tsx
import React from "react";
import { Card } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Card
      title="Thong tin don hang"
      description="Cap nhat lan cuoi: 10:30"
      footer={<div className="text-sm text-muted-foreground">Tong: 1.200.000d</div>}
      hoverable
    >
      <div className="text-sm">Noi dung the hien tai day</div>
    </Card>
  );
}
```

```ts
interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  innerClassName?: string; // class for inner rounded wrapper
  contentClassName?: string; // class for content wrapper (if padding class provided, overrides default)
  noPadding?: boolean; // remove default body padding
}
```
