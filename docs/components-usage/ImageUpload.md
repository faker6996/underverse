# ImageUpload

Source: `components/ui/ImageUpload.tsx`

Exports:
- ImageUpload

Note: Usage snippets are minimal; fill required props from the props type below.

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
  return (
    <ImageUpload />
  );
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
