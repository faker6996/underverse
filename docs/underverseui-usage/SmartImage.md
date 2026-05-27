# SmartImage

Source: `components/ui/SmartImage.tsx`

Exports:

- SmartImage

Note: Usage snippets are minimal; fill required props from the props type below.

## SmartImage

Props type: `SmartImageProps`

```tsx
import { SmartImage } from "@underverse-ui/underverse";

export function Example() {
  return <SmartImage src="https://example.com/image.jpg" alt="Example" />;
}
```

Ví dụ đầy đủ:

```tsx
import React from "react";
import { SmartImage } from "@underverse-ui/underverse";

export function Example() {
  return (
    // Fill layout with aspect ratio (default)
    <SmartImage src="https://example.com/image.jpg" alt="Product" ratioClass="aspect-square" />

    // Fixed dimensions
    <SmartImage src="/images/photo.jpg" alt="Photo" fill={false} width={400} height={300} />

    // Custom rounded corners
    <SmartImage src="..." alt="..." roundedClass="rounded-full" />

    // Contain fit instead of cover
    <SmartImage src="..." alt="..." fit="contain" />

    // With fade-in transition (opt-in, default is off)
    <SmartImage src="..." alt="..." transition />

    // Skip Next.js CDN optimizer (e.g. for already-optimized or external images)
    <SmartImage src="..." alt="..." unoptimized />

    // Priority load for above-the-fold images
    <SmartImage src="..." alt="..." priority />
  );
}
```

```ts
interface SmartImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  /**
   * Aspect ratio utility class, e.g. `aspect-square`, `aspect-4/3`.
   * If provided with `fill`, the wrapper enforces the ratio.
   */
  ratioClass?: string;
  /**
   * Rounded corners; defaults to `rounded-2xl md:rounded-3xl`.
   */
  roundedClass?: string;
  /**
   * When true, uses fill layout; otherwise width/height if provided.
   */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fit?: "cover" | "contain";
  /** Control object position, e.g. 'center', 'top', 'left', '50% 50%'. */
  objectPosition?: React.CSSProperties["objectPosition"];
  /** Optional fallback src if original fails. */
  fallbackSrc?: string;
  /** ClassName applied to the inner Image element. */
  imageClassName?: string;
  /** Enable fade-in transition on the image. Default false. */
  transition?: boolean;
  /** Pass through next/image `unoptimized`. Skips CDN optimizer. */
  unoptimized?: boolean;
}
```

## Props

| Prop             | Type                              | Default                            | Description                                              |
| ---------------- | --------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `src`            | `string \| null \| undefined`     | -                                  | Image source URL                                         |
| `alt`            | `string`                          | -                                  | Accessible image description (required)                  |
| `fill`           | `boolean`                         | `true`                             | Use fill layout; set `false` with `width`/`height`       |
| `width`          | `number`                          | -                                  | Fixed width (used when `fill={false}`)                   |
| `height`         | `number`                          | -                                  | Fixed height (used when `fill={false}`)                  |
| `ratioClass`     | `string`                          | -                                  | Aspect ratio class, e.g. `aspect-square`, `aspect-4/3`  |
| `roundedClass`   | `string`                          | `"rounded-2xl md:rounded-3xl"`     | Border radius class                                      |
| `fit`            | `"cover" \| "contain"`            | `"cover"`                          | CSS object-fit                                           |
| `objectPosition` | `string`                          | -                                  | CSS object-position                                      |
| `sizes`          | `string`                          | `"(max-width: 768px) 100vw, 33vw"` | Responsive sizes hint for next/image                     |
| `priority`       | `boolean`                         | `false`                            | Preload image (above-the-fold)                           |
| `quality`        | `number`                          | `80`                               | Next.js image quality (1–100)                            |
| `fallbackSrc`    | `string`                          | SVG placeholder                    | Fallback shown on load error                             |
| `imageClassName` | `string`                          | -                                  | Extra class applied directly to the `<Image>` element    |
| `transition`     | `boolean`                         | `false`                            | Enable `transition-opacity duration-300` on the image    |
| `unoptimized`    | `boolean`                         | -                                  | Skip Next.js CDN optimizer; passed through to next/image |
| `className`      | `string`                          | -                                  | Class for the wrapper div                                |

## Notes

- **Transition is opt-in** (`transition={false}` by default). The previous hardcoded `transition-all duration-300` made image reloads and repaints visually obvious; use `transition` only when a deliberate fade-in effect is desired.
- **Error recovery**: failed URLs are cached in a module-level `Set` so the same broken URL is never retried within the same page session. Local `.jpg` assets automatically fall back to `.png`.
- `normalize` is stable via `useCallback([fallbackSrc])` — the `useEffect` that syncs `src` changes uses a functional update to avoid redundant state writes when the normalized value hasn't changed.
