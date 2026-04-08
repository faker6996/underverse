# OverlayScrollArea

Source: `components/ui/OverlayScrollArea.tsx`

Exports:

- OverlayScrollArea

`OverlayScrollArea` là wrapper chuyên dụng cho vùng cuộn nặng cần OverlayScrollbars.

## Usage

```tsx
import { OverlayScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return (
    <OverlayScrollArea className="h-64 rounded-2xl border" viewportClassName="p-4" enabled>
      {/* long content */}
    </OverlayScrollArea>
  );
}
```

## Props

```ts
export interface OverlayScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  viewportProps?: React.HTMLAttributes<HTMLDivElement>;
  enabled?: boolean;
  overflowHidden?: boolean;
  overlayScrollbarOptions?: {
    theme?: string;
    visibility?: "visible" | "hidden" | "auto";
    autoHide?: "never" | "scroll" | "leave" | "move";
    autoHideDelay?: number;
    dragScroll?: boolean;
    clickScroll?: boolean;
    exclude?: string;
  };
}
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Class cho container ngoài |
| `viewportClassName` | `string` | - | Class cho viewport cuộn |
| `viewportProps` | `HTMLAttributes<HTMLDivElement>` | - | Props gắn trực tiếp vào viewport |
| `enabled` | `boolean` | `true` | Bật/tắt OverlayScrollbars cho viewport |
| `overflowHidden` | `boolean` | `true` | Clip overflow của outer wrapper; tắt nếu cần cho shadow/focus ring tràn ra ngoài |
| `overlayScrollbarOptions` | `object` | - | Override options kế thừa từ `OverlayScrollbarProvider` |

## Notes

- Component chỉ init scrollbar trên viewport nội bộ của chính nó.
- Không init lên `html/body` và không đụng portal/dialog/toaster tree.
- Outer wrapper chỉ lo boundary và clipping; viewport bên trong mới là chỗ scroll thật.
- `viewportProps.className` vẫn được merge sau `viewportClassName`, nên nó có quyền override khi cần.
