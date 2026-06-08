import type { Editor, Extension } from "@tiptap/core";

export type UEditorUploadImageForSaveResult = string | ({ url: string } & Record<string, unknown>);

export type UEditorUploadImageForSave = (file: File) => Promise<UEditorUploadImageForSaveResult>;

export type UEditorPrepareContentUploadMeta = Record<string, unknown>;

export type UEditorInlineUploadedItem = {
  index: number;
  url: string;
  file?: File;
  meta?: UEditorPrepareContentUploadMeta;
};

export type UEditorPrepareContentForSaveResult = {
  html: string;
  uploaded: Array<{ url: string; file?: File; meta?: UEditorPrepareContentUploadMeta }>;
  inlineImageUrls: string[];
  inlineUploaded: UEditorInlineUploadedItem[];
  errors: Array<{ index: number; reason: string }>;
};

export type UEditorPrepareContentForSaveOptions = {
  throwOnError?: boolean;
};

export interface UEditorRef {
  editor?: Editor | null;
  prepareContentForSave: (options?: UEditorPrepareContentForSaveOptions) => Promise<UEditorPrepareContentForSaveResult>;
}

export type UEditorFontFamilyOption = {
  label: string;
  value: string;
};

export type UEditorFontSizeOption = {
  label: string;
  value: string;
};

export type UEditorLineHeightOption = {
  label: string;
  value: string;
};

export type UEditorLetterSpacingOption = {
  label: string;
  value: string;
};

/** Public props for the `UEditor` component. */
export interface UEditorProps {
  /** Initial or controlled HTML content for the editor. */
  content?: string;
  /** Called with the current HTML after editor updates. Kept for backward compatibility with `onHtmlChange`. */
  onChange?: (content: string) => void;
  /** Called with the current HTML after editor updates. Prefer this when the consumer stores HTML. */
  onHtmlChange?: (html: string) => void;
  /** Called with the current TipTap JSON document after editor updates. */
  onJsonChange?: (json: object) => void;
  /** Uploads images immediately when they are inserted in `imageInsertMode="upload"`. */
  uploadImage?: (file: File) => Promise<string> | string;
  /** Uploads embedded/base64 images during `prepareContentForSave`; use this for save-time normalization. */
  uploadImageForSave?: UEditorUploadImageForSave;
  /** Maximum number of concurrent save-time image/file uploads. */
  uploadImageConcurrency?: number;
  /** Whether inserted images are kept as base64 in editor state or uploaded immediately. */
  imageInsertMode?: "base64" | "upload";
  maxImageFileSize?: number;
  allowedImageMimeTypes?: string[];
  fallbackToDataUrl?: boolean;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autofocus?: boolean;
  showToolbar?: boolean;
  showBubbleMenu?: boolean;
  showFloatingMenu?: boolean;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  minHeight?: number | string;
  maxHeight?: number | string;
  variant?: "default" | "minimal" | "notion";
  fontFamilies?: UEditorFontFamilyOption[];
  fontSizes?: UEditorFontSizeOption[];
  lineHeights?: UEditorLineHeightOption[];
  letterSpacings?: UEditorLetterSpacingOption[];
  fetchMetadata?: (url: string) => Promise<{ title?: string; description?: string; image?: string; publisher?: string }>;
  /** Uploads file cards immediately after insertion when available. */
  uploadFile?: (file: File) => Promise<string> | string;
  /** Uploads embedded/base64 file cards during `prepareContentForSave`; falls back to `uploadImageForSave` if omitted. */
  uploadFileForSave?: (file: File) => Promise<string | ({ url: string } & Record<string, unknown>)>;
  /** Additional TipTap extensions appended after the built-in UEditor extensions. */
  extraExtensions?: Extension[];
  showMenuBar?: boolean;
  onSave?: () => void;
  onExport?: () => void;
  onSourceCode?: () => void;
  /**
   * Fires when View > Preview or the eye button is clicked.
   * Return false to prevent the built-in preview dialog.
   */
  onPreview?: (html: string) => void | false;
}

export type UEditorVariant = NonNullable<UEditorProps["variant"]>;
