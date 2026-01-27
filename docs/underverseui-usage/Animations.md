# Animation Utilities

Source: `packages/underverse/src/utils/animations.ts`

Exports:

- `shadcnAnimationStyles` - CSS string cho animations
- `useShadCNAnimations` - React hook tự động inject styles
- `injectAnimationStyles` - Function inject styles thủ công
- `getAnimationStyles` - Function lấy CSS string

Note: Các utility này cung cấp ShadCN-compatible animations mà không cần cấu hình Tailwind.

## Installation

```tsx
import { useShadCNAnimations, injectAnimationStyles, getAnimationStyles } from "@underverse-ui/underverse";
```

## useShadCNAnimations (React Hook)

Tự động inject animation styles khi component mount. Recommended cho React apps.

```tsx
import { useShadCNAnimations } from "@underverse-ui/underverse";

function App() {
  // Tự động inject styles khi App mount
  useShadCNAnimations();

  return (
    <div className="animate-fade-in">
      <p>This content fades in!</p>
    </div>
  );
}
```

### Sử dụng trong Layout

```tsx
// app/layout.tsx hoặc App.tsx
import { useShadCNAnimations } from "@underverse-ui/underverse";

export default function RootLayout({ children }) {
  useShadCNAnimations();

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## injectAnimationStyles (Manual)

Inject styles thủ công. Useful cho SSR hoặc non-React environments.

```tsx
import { injectAnimationStyles } from "@underverse-ui/underverse";

// Gọi 1 lần khi app khởi động
injectAnimationStyles();

// Styles sẽ được inject vào <head>
```

### SSR Usage

```tsx
// server.js hoặc _document.tsx
import { getAnimationStyles } from "@underverse-ui/underverse";

const animationCSS = getAnimationStyles();

// Inject vào HTML response
const html = `
  <html>
    <head>
      <style>${animationCSS}</style>
    </head>
    <body>...</body>
  </html>
`;
```

## getAnimationStyles

Lấy CSS string để tự inject hoặc xử lý thêm.

```tsx
import { getAnimationStyles } from "@underverse-ui/underverse";

const css = getAnimationStyles();
console.log(css);
// Output: @keyframes accordion-down { ... } .animate-accordion-down { ... }
```

## Available Animation Classes

### Accordion Animations

| Class                    | Description                |
| ------------------------ | -------------------------- |
| `animate-accordion-down` | Accordion expand (open)    |
| `animate-accordion-up`   | Accordion collapse (close) |

```tsx
<div className="animate-accordion-down">Expanding content</div>
```

### Fade Animations

| Class              | Description      |
| ------------------ | ---------------- |
| `animate-fade-in`  | Fade in (0 → 1)  |
| `animate-fade-out` | Fade out (1 → 0) |

```tsx
<div className="animate-fade-in">Fading in...</div>
```

### Slide Animations

| Class                          | Description       |
| ------------------------------ | ----------------- |
| `animate-slide-in-from-top`    | Slide from top    |
| `animate-slide-in-from-bottom` | Slide from bottom |
| `animate-slide-in-from-left`   | Slide from left   |
| `animate-slide-in-from-right`  | Slide from right  |

```tsx
<div className="animate-slide-in-from-bottom">Sliding up!</div>
```

### Zoom Animations

| Class              | Description           |
| ------------------ | --------------------- |
| `animate-zoom-in`  | Zoom in (95% → 100%)  |
| `animate-zoom-out` | Zoom out (100% → 95%) |

```tsx
<div className="animate-zoom-in">Zooming in!</div>
```

### Utility Animations

| Class                 | Description               |
| --------------------- | ------------------------- |
| `animate-caret-blink` | Blinking cursor animation |

```tsx
<span className="animate-caret-blink">|</span>
```

## Combining with Tailwind

Animations work seamlessly with Tailwind utilities:

```tsx
<div className="animate-fade-in duration-500 ease-out">Slow fade</div>

<div className="animate-slide-in-from-bottom hover:animate-none">
  Slides in, stops on hover
</div>
```

## Custom Animation Duration

Override default duration với Tailwind:

```tsx
// Fast (150ms)
<div className="animate-fade-in duration-150">Fast</div>

// Slow (1000ms)
<div className="animate-fade-in duration-1000">Slow</div>
```

## Animation Keyframes Reference

```css
@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

@keyframes caret-blink {
  0%,
  70%,
  100% {
    opacity: 1;
  }
  20%,
  50% {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slide-in-from-top {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-in-from-bottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-in-from-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slide-in-from-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes zoom-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```
