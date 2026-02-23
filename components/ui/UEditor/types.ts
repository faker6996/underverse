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
  prepareContentForSave: (options?: UEditorPrepareContentForSaveOptions) => Promise<UEditorPrepareContentForSaveResult>;
}

export interface UEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onHtmlChange?: (html: string) => void;
  onJsonChange?: (json: object) => void;
  uploadImage?: (file: File) => Promise<string> | string;
  uploadImageForSave?: UEditorUploadImageForSave;
  imageInsertMode?: "base64" | "upload";
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
}

export type UEditorVariant = NonNullable<UEditorProps["variant"]>;
