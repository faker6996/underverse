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
  return <SmartImage />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SmartImage } from "@underverse-ui/underverse";

export function Example() {
  return <SmartImage src={"Gia tri"} alt={"Gia tri"} />;
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
   * Rounded corners; defaults to `rounded-lg` to match project style.
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
  fit?: Fit;
  /** Control object position, e.g. 'center', 'top', 'left', '50% 50%'. */
  objectPosition?: React.CSSProperties["objectPosition"];
  /** Optional fallback src if original fails. */
  fallbackSrc?: string;
  /** ClassName for the inner Image component */
  imageClassName?: string;
}
```
