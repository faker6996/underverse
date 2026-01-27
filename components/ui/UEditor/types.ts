export interface UEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onHtmlChange?: (html: string) => void;
  onJsonChange?: (json: object) => void;
  uploadImage?: (file: File) => Promise<string> | string;
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
