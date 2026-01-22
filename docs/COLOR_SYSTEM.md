# Color System - Underverse UI

## Overview

Underverse UI sử dụng **OKLCH color space** với thiết kế **brand-agnostic**, cho phép đổi brand chỉ bằng vài dòng CSS.

**File:** `app/globals.css`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BRAND CONFIG (đổi brand tại đây)                           │
│  --brand-h, --brand-c, --neutral-h, --secondary-h           │
├─────────────────────────────────────────────────────────────┤
│  SEMANTIC TOKENS (derived từ brand)                         │
│  --primary, --secondary, --accent, --muted, --background    │
├─────────────────────────────────────────────────────────────┤
│  TAILWIND THEME (via @theme inline)                         │
│  bg-primary, text-foreground, border-border...              │
└─────────────────────────────────────────────────────────────┘
```

## Brand Configuration

```css
:root {
  /* Đổi brand chỉ cần sửa 4 biến này */
  --brand-h: 255; /* Hue: 255=Blue, 145=Green, 280=Purple, 25=Orange */
  --brand-c: 0.18; /* Chroma: độ bão hòa màu (0.1-0.25) */
  --secondary-h: 280; /* Secondary hue (complementary/analogous) */
  --neutral-h: 255; /* Neutral tint: = brand-h hoặc 0 (pure gray) */
}
```

### Brand Presets

| Brand   | `--brand-h` | `--brand-c` | `--neutral-h` |
| ------- | ----------- | ----------- | ------------- |
| Blue    | 255         | 0.18        | 255           |
| Green   | 145         | 0.15        | 145           |
| Purple  | 280         | 0.14        | 280           |
| Orange  | 25          | 0.16        | 25            |
| Neutral | 255         | 0.18        | 0             |

## Semantic Hues (Fixed)

Các hue này **KHÔNG đổi theo brand**, đảm bảo consistency về ý nghĩa:

```css
:root {
  --info-h: 210; /* Cyan/Sky - system messages */
  --success-h: 145; /* Green - positive feedback */
  --warning-h: 60; /* Amber - caution (55-65 range) */
  --destructive-h: 22; /* Red - danger/error */
}
```

## Token Categories

### Neutral Tokens (tinted với `--neutral-h`)

| Token                | Light               | Dark                | Usage             |
| -------------------- | ------------------- | ------------------- | ----------------- |
| `--background`       | L:97% C:0.008       | L:18% C:0.02        | Page background   |
| `--foreground`       | L:22% C:0.012       | L:94% C:0.012       | Main text         |
| `--card`             | L:99.5% C:0.006     | L:22% C:0.022       | Card surfaces     |
| `--muted`            | L:95.5% C:0.01      | L:26% C:0.022       | Muted backgrounds |
| `--muted-foreground` | L:46% C:0.012       | L:72% C:0.014       | Secondary text    |
| `--border`           | L:28% C:0.012 /0.14 | L:92% C:0.012 /0.18 | Borders           |
| `--input`            | L:28% C:0.012 /0.22 | L:92% C:0.012 /0.24 | Input borders     |

### Surface Tokens (ramp cho dashboard/landing)

| Token         | Light        | Dark         |
| ------------- | ------------ | ------------ |
| `--surface-0` | = background | = background |
| `--surface-1` | L:99%        | L:20%        |
| `--surface-2` | L:98%        | L:22%        |
| `--surface-3` | L:97%        | L:24%        |

### Brand/Action Tokens

| Token                  | Light                                  | Dark                                   |
| ---------------------- | -------------------------------------- | -------------------------------------- |
| `--primary`            | L:52% C:brand-c H:brand-h              | L:70% C:brand-c H:brand-h              |
| `--primary-foreground` | L:98.5% (white)                        | L:10% (black)                          |
| `--secondary`          | L:54% C:secondary-c H:secondary-h      | L:62%                                  |
| `--accent`             | color-mix(primary 14%, background)     | color-mix(primary 14%, background)     |
| `--ring`               | color-mix(primary 70%, background 30%) | color-mix(primary 60%, background 40%) |

### Semantic Tokens

| Token           | Light              | Dark         | Foreground  |
| --------------- | ------------------ | ------------ | ----------- |
| `--destructive` | L:56% C:0.19 H:22  | L:62%        | White/Black |
| `--success`     | L:44% C:0.16 H:145 | L:62%        | White/Black |
| `--warning`     | L:62% C:0.16 H:60  | L:78% C:0.14 | Dark text   |
| `--info`        | L:62% C:0.14 H:210 | L:76% C:0.11 | White/Black |

### Soft Variants (auto-derived)

```css
--primary-soft: color-mix(in oklch, var(--primary) 12%, var(--background));
--success-soft: color-mix(in oklch, var(--success) 12%, var(--background));
--warning-soft: color-mix(in oklch, var(--warning) 14%, var(--background));
--info-soft: color-mix(in oklch, var(--info) 12%, var(--background));
--destructive-soft: color-mix(in oklch, var(--destructive) 12%, var(--background));
```

## WCAG AA Compliance

Tất cả token combinations đều đạt **WCAG AA 4.5:1** contrast ratio:

| Combination                          | Light    | Dark     |
| ------------------------------------ | -------- | -------- |
| foreground / background              | ✅ 14:1  | ✅ 15:1  |
| primary / primary-foreground         | ✅ 7:1   | ✅ 6:1   |
| destructive / destructive-foreground | ✅ 5.5:1 | ✅ 4.8:1 |
| success / success-foreground         | ✅ 6:1   | ✅ 4.5:1 |
| warning / warning-foreground         | ✅ 5.5:1 | ✅ 8:1   |
| muted-foreground / background        | ✅ 5:1   | ✅ 5.5:1 |

## Tailwind Integration

### @theme inline block

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-soft: var(--primary-soft);
  /* ... */
}
```

### Usage in Components

```tsx
// Tailwind classes map trực tiếp đến CSS tokens
<button className="bg-primary text-primary-foreground">
  Click me
</button>

<div className="bg-success-soft text-success border-success/20">
  Success message
</div>

<span className="text-muted-foreground">
  Secondary text
</span>
```

## Switching Brands

### Example: Green Brand

```css
:root {
  --brand-h: 145;
  --brand-c: 0.15;
  --secondary-h: 200; /* Cyan complement */
  --neutral-h: 145; /* Tinted neutrals */
}
```

### Example: Purple Brand with Neutral Gray

```css
:root {
  --brand-h: 280;
  --brand-c: 0.14;
  --secondary-h: 200;
  --neutral-h: 0; /* Pure gray (no tint) */
}
```

## Shadow Tokens

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

Dark mode shadows có opacity cao hơn (0.3-0.55) để visible trên nền tối.

## Best Practices

1. **Không hardcode màu** - Luôn dùng token: `bg-primary` không phải `bg-[#3b82f6]`
2. **Dùng soft variants cho backgrounds** - `bg-success-soft` thay vì `bg-success/10`
3. **Semantic đúng mục đích** - `destructive` cho error, `warning` cho caution
4. **Test cả light + dark mode** - Tokens tự động adapt
5. **Giữ contrast ratio** - Khi custom, verify với công cụ WCAG

## Tools

### Verify WCAG Compliance

```bash
npm install culori
```

```ts
import { wcagContrast, parse } from "culori";

const bg = parse("oklch(97% 0.008 255)");
const fg = parse("oklch(22% 0.012 255)");
console.log(wcagContrast(bg, fg)); // Should be >= 4.5
```
