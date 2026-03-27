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
  const slides = [
    { id: 1, img: "https://picsum.photos/seed/car-hero-1/1400/900", title: "Aurora Ridge" },
    { id: 2, img: "https://picsum.photos/seed/car-hero-2/1400/900", title: "Neon District" },
    { id: 3, img: "https://picsum.photos/seed/car-hero-3/1400/900", title: "Midnight Coast" },
  ];

  return (
    <Carousel showProgress autoScrollInterval={4200}>
      {slides.map((item) => (
        <div key={item.id} className="relative h-72 overflow-hidden rounded-2xl">
          <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
        </div>
      ))}
    </Carousel>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Carousel } from "@underverse-ui/underverse";

export function Example() {
  const slides = [
    { id: 1, img: "https://picsum.photos/seed/coverflow-1/1200/800", title: "Aurora Ridge" },
    { id: 2, img: "https://picsum.photos/seed/coverflow-2/1200/800", title: "Neon District" },
    { id: 3, img: "https://picsum.photos/seed/coverflow-3/1200/800", title: "Desert Bloom" },
    { id: 4, img: "https://picsum.photos/seed/coverflow-4/1200/800", title: "Midnight Coast" },
  ];

  return (
    <Carousel
      animation="coverflow"
      autoScroll
      autoScrollInterval={3200}
      showProgress
      effectOptions={{
        mainScale: 1.08,
        sideScale: 0.84,
        sideOffset: 24,
        sideOpacity: 0.88,
        farOpacity: 0.52,
        blur: 1.2,
        rotate: 22,
      }}
    >
      {slides.map((item) => (
        <div key={item.id} className="relative h-72 overflow-hidden rounded-2xl">
          <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
        </div>
      ))}
    </Carousel>
  );
}
```

```ts
interface CarouselProps {
  children: React.ReactNode;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  animation?: "slide" | "fade" | "scale" | "coverflow" | "stack";
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
  effectPreset?: "cinematic" | "gallery" | "poster" | "minimal";
  effectOptions?: CarouselEffectOptions;
}

interface CarouselEffectOptions {
  mainScale?: number;
  sideScale?: number;
  farScale?: number;
  sideOpacity?: number;
  farOpacity?: number;
  sideOffset?: number;
  rotate?: number;
  depthStep?: number;
  blur?: number;
  stackOffset?: number;
  stackLift?: number;
}
```

Notes:
- `coverflow`: 1 slide chính ở giữa, 2 slide phụ nhỏ hơn hai bên phía sau.
- `stack`: 1 slide chính ở trước, các slide còn lại xếp lớp phía sau.
- Khi dùng `coverflow` hoặc `stack`, component sẽ tự hoạt động như single-slide carousel.
- `coverflow` hỗ trợ `autoScroll` như carousel thường.
- `effectPreset="cinematic"`: đậm chiều sâu hơn, ảnh chính nổi hơn.
- `effectPreset="gallery"`: nhẹ hơn, thiên về editorial/gallery.
- `effectPreset="poster"`: tương phản mạnh hơn, hợp hero/showcase đậm.
- `effectPreset="minimal"`: gần mặt phẳng hơn, tinh giản và sạch.
- Có thể tune trực tiếp bằng `effectOptions`, ví dụ:
- Nếu ảnh phụ đang mờ quá, tăng `sideOpacity` / `farOpacity` và giảm `blur`.
- Với `coverflow`, có thể click trực tiếp vào slide phụ để nhảy nó lên làm slide chính.
- Có thể tune trực tiếp bằng `effectOptions`, ví dụ:

```tsx
<Carousel
  animation="coverflow"
  effectPreset="cinematic"
  effectOptions={{
    mainScale: 1.08,
    sideScale: 0.84,
    sideOffset: 24,
    sideOpacity: 0.88,
    farOpacity: 0.52,
    blur: 1.2,
  }}
>
  {slides}
</Carousel>
```
