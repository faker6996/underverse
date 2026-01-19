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

Ví dụ đầy đủ:

```tsx
import React from "react";
import { Avatar } from "@underverse-ui/underverse";

export function Example() {
  return (
    // Basic with image
    <Avatar src="https://example.com/avatar.jpg" alt="User" />

    // With status indicator (default: online, shown)
    <Avatar src="..." showStatus status="online" />
    <Avatar src="..." showStatus status="busy" />
    <Avatar src="..." showStatus status="away" />
    <Avatar src="..." showStatus status="offline" />

    // Status always visible (no fade on hover)
    <Avatar src="..." showStatus hideStatusOnHover={false} />

    // Without status dot
    <Avatar src="..." showStatus={false} />

    // Interactive
    <Avatar src="..." onClick={() => console.log("clicked")} />
  );
}
```

```ts
type StatusType = "online" | "offline" | "busy" | "away" | "none";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  /** Show status indicator dot (default: true) */
  showStatus?: boolean;
  /** Status type (default: "online") */
  status?: StatusType;
  /** Fade status dot to 50% on hover (default: true) */
  hideStatusOnHover?: boolean;
  onClick?: () => void;
}
```

## Props

| Prop                | Type                                                  | Default    | Description                     |
| ------------------- | ----------------------------------------------------- | ---------- | ------------------------------- |
| `src`               | `string`                                              | -          | Image source URL                |
| `alt`               | `string`                                              | `"avatar"` | Accessible image description    |
| `fallback`          | `string`                                              | `"?"`      | Fallback letters when no image  |
| `size`              | `"sm" \| "md" \| "lg"`                                | `"md"`     | Avatar size                     |
| `showStatus`        | `boolean`                                             | `true`     | Show status indicator dot       |
| `status`            | `"online" \| "offline" \| "busy" \| "away" \| "none"` | `"online"` | Status type with color          |
| `hideStatusOnHover` | `boolean`                                             | `true`     | Fade status dot to 50% on hover |
| `className`         | `string`                                              | -          | Custom class for wrapper        |
| `onClick`           | `() => void`                                          | -          | Click handler                   |
