# FileUpload

Source: `components/ui/FileUpload.tsx`

Exports:

- FileUpload
- FileUploadProps
- UploadedFile

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja).

## i18n Support

| Locale | Drag & Drop Text                   | Browse Files   |
| ------ | ---------------------------------- | -------------- |
| `en`   | Drag & drop files here             | Browse files   |
| `vi`   | Kéo & thả tệp vào đây              | Chọn tệp       |
| `ko`   | 여기에 파일을 드래그 앤 드롭하세요 | 파일 선택      |
| `ja`   | ここにファイルをドラッグ＆ドロップ | ファイルを選択 |

## FileUpload

Props type: `FileUploadProps`

```tsx
import { FileUpload } from "@underverse-ui/underverse";

export function Example() {
  return <FileUpload />;
}
```

### Full Example

```tsx
import React from "react";
import { FileUpload, UploadedFile } from "@underverse-ui/underverse";

export function Example() {
  const handleUpload = (file: UploadedFile) => {
    console.log("Uploaded:", file);
  };

  return <FileUpload maxSize={5} multiple={true} onUpload={handleUpload} accept="image/*,.pdf" />;
}
```

### Props

```ts
export interface FileUploadProps {
  /** Callback when a file is uploaded */
  onUpload?: (file: UploadedFile) => void;
  /** Callback when a file is removed */
  onRemove?: (fileId: string | number) => void;
  /** Callback when files change */
  onChange?: (files: UploadedFile[]) => void;
  /** Custom upload handler - if provided, handles actual upload */
  uploadHandler?: (file: File) => Promise<UploadedFile>;
  /** Maximum file size in MB */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Accepted file types (e.g., ".pdf,.doc" or "image/*,application/pdf") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Show file list */
  showFileList?: boolean;
  /** Layout variant */
  variant?: "default" | "compact" | "minimal";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom drag/drop text */
  dragDropText?: string;
  /** Custom browse button text */
  browseText?: string;
  /** Custom supported formats text */
  supportedFormatsText?: string;
  /** Show file type icons */
  showTypeIcons?: boolean;
  /** Allow file preview (for images) */
  allowPreview?: boolean;
  /** Initial files */
  initialFiles?: UploadedFile[];
}
```

```ts
export interface UploadedFile {
  id: string | number;
  file?: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  formattedSize?: string;
}
```
