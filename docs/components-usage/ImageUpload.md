# ImageUpload

Source: `components/ui/ImageUpload.tsx`

Exports:

- ImageUpload

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja) cho drag & drop text.

## i18n Support

| Locale | Drag & Drop Text                | Browse Files   |
| ------ | ------------------------------- | -------------- |
| `en`   | Drag and drop images here       | Browse files   |
| `vi`   | Kéo thả hình ảnh vào đây        | Chọn tệp       |
| `ko`   | 여기에 이미지를 끌어다 놓으세요 | 파일 찾아보기  |
| `ja`   | ここに画像をドラッグ＆ドロップ  | ファイルを参照 |

## ImageUpload

Props type: `ImageUploadProps`

```tsx
import { ImageUpload } from "@underverse-ui/underverse";

export function Example() {
  return <ImageUpload />;
}
```

Vi du day du:

```tsx
import React from "react";
import { ImageUpload } from "@underverse-ui/underverse";

export function Example() {
  return <ImageUpload />;
}
```

```ts
interface ImageUploadProps {
  onUpload?: (image: UploadedImage) => void;
  onRemove?: (imageId: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  previewSize?: "sm" | "md" | "lg";
  dragDropText?: string;
  browseText?: string;
  supportedFormatsText?: string;
}
```
