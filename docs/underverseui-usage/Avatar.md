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

    // Sizes
    <Avatar size="sm" fallback="A" />
    <Avatar size="md" fallback="B" />
    <Avatar size="lg" fallback="C" />
    <Avatar size="xl" fallback="D" />

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

    // Dense chat/message list — default, no Next.js pipeline
    <Avatar src="..." imageStrategy="img" />

    // Large profile header — use Next.js CDN optimization
    <Avatar src="..." size="xl" imageStrategy="next-image" />

    // Above-the-fold hero avatar — eager load, high priority
    <Avatar src="..." imageLoading="eager" imageFetchPriority="high" />
  );
}
```

```ts
type StatusType = "online" | "offline" | "busy" | "away" | "none";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Show status indicator dot (default: true) */
  showStatus?: boolean;
  /** Status type (default: "online") */
  status?: StatusType;
  /** Fade status dot to 50% on hover (default: true) */
  hideStatusOnHover?: boolean;
  onClick?: () => void;
  /**
   * Image rendering strategy (default: "img").
   * - "img": native <img> — stable in dense lists, no Next.js pipeline overhead.
   * - "next-image": SmartImage/next/image — use for large avatars needing CDN optimization.
   */
  imageStrategy?: "img" | "next-image";
  /** Native img `loading` attribute (default: "lazy"). Use "eager" for above-the-fold avatars. */
  imageLoading?: "lazy" | "eager";
  /** Native img `fetchpriority` attribute. Useful for hero/header avatars. */
  imageFetchPriority?: "high" | "low" | "auto";
}
```

## Props

| Prop                | Type                                                  | Default    | Description                                                                     |
| ------------------- | ----------------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `src`               | `string`                                              | -          | Image source URL                                                                |
| `alt`               | `string`                                              | `"avatar"` | Accessible image description                                                    |
| `fallback`          | `string`                                              | `"?"`      | Fallback text when no image; only the first character is displayed, uppercased  |
| `size`              | `"sm" \| "md" \| "lg" \| "xl"`                        | `"md"`     | Avatar size                                                                     |
| `showStatus`        | `boolean`                                             | `true`     | Show status indicator dot                                                       |
| `status`            | `"online" \| "offline" \| "busy" \| "away" \| "none"` | `"online"` | Status type with color                                                          |
| `hideStatusOnHover` | `boolean`                                             | `true`     | Fade status dot to 50% on hover                                                 |
| `imageStrategy`     | `"img" \| "next-image"`                               | `"img"`    | `"img"` for dense lists; `"next-image"` for large avatars needing CDN caching  |
| `imageLoading`      | `"lazy" \| "eager"`                                   | `"lazy"`   | Native `loading` attribute; use `"eager"` for above-the-fold avatars           |
| `imageFetchPriority`| `"high" \| "low" \| "auto"`                           | -          | Native `fetchpriority` attribute; use `"high"` for hero/header avatars         |
| `className`         | `string`                                              | -          | Custom class for wrapper                                                        |
| `onClick`           | `() => void`                                          | -          | Click handler                                                                   |

## Notes

- `fallback` accepts any string but only the **first character** is displayed (uppercased). Pass a full name or initials — either works.
- Default `imageStrategy="img"` avoids `/_next/image` requests on remount, preventing flicker in chat/message lists. Switch to `"next-image"` only when Next.js CDN optimization is actually needed (e.g. large profile headers).
- The component is wrapped in `React.memo` — re-renders are skipped when props are referentially stable.
