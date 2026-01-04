# Carousel

Source: `components/ui/Carousel.tsx`

Exports:
- Carousel

Note: Usage snippets are minimal; fill required props from the props type below.

## Carousel

Props type: `CarouselProps`

```tsx
import { Carousel } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Carousel>
      Content
    </Carousel>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Carousel } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Carousel>
      Noi dung
    </Carousel>
  );
}
```

```ts
interface CarouselProps {
  children: React.ReactNode[];
  autoScroll?: boolean;
  autoScrollInterval?: number;
  animation?: AnimationVariant;
  orientation?: Orientation;
  showArrows?: boolean;
  showDots?: boolean;
  showProgress?: boolean;
  showThumbnails?: boolean;
  loop?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  className?: string;
  containerClassName?: string;
  slideClassName?: string;
  onSlideChange?: (index: number) => void;
  thumbnailRenderer?: (child: React.ReactNode, index: number) => React.ReactNode;
  ariaLabel?: string;
}
```
