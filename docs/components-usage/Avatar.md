# Avatar

Source: `components/ui/Avatar.tsx`

Exports:
- Avatar

Note: Usage snippets are minimal; fill required props from the props type below.

## Avatar

Props type: `AvatarProps`

```tsx
import { Avatar } from "@underverse-ui/underverse";

export function Example() {
  return <Avatar />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Avatar } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Avatar
      src={"Gia tri"}
      alt={"Gia tri"}
      size={"md"}
     />
  );
}
```

```ts
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void; // 👈 thêm onClick rõ ràng
}
```
