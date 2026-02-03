// components/ui/FileUpload.tsx
"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  Upload,
  X,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Button from "./Button";
import { useToast } from "./Toast";
import { useTranslations } from "@/lib/i18n/translation-adapter";

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType: string, fileName: string) => {
  // Check by MIME type first
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z") || mimeType.includes("tar")) return FileArchive;
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("document")) return FileText;
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheet;
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("json") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.includes("xml")
  )
    return FileCode;

  // Fallback to extension
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
      return FileImage;
    case "mp4":
    case "avi":
    case "mov":
    case "mkv":
    case "webm":
      return FileVideo;
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
      return FileAudio;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return FileArchive;
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
      return FileText;
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "json":
    case "py":
    case "java":
    case "cpp":
    case "c":
      return FileCode;
    default:
      return File;
  }
};

const getFileTypeColor = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "text-pink-500";
  if (mimeType.startsWith("video/")) return "text-purple-500";
  if (mimeType.startsWith("audio/")) return "text-orange-500";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "text-amber-500";
  if (mimeType.includes("pdf")) return "text-red-500";
  if (mimeType.includes("word") || mimeType.includes("document")) return "text-blue-500";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "text-green-500";
  if (mimeType.includes("javascript") || mimeType.includes("json")) return "text-yellow-500";
  return "text-muted-foreground";
};

const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function FileUpload({
  onUpload,
  onRemove,
  onChange,
  uploadHandler,
  maxSize = 50, // Default 50MB
  maxFiles = 10,
  accept,
  multiple = true,
  disabled = false,
  className,
  showFileList = true,
  variant = "default",
  size = "md",
  dragDropText,
  browseText,
  supportedFormatsText,
  showTypeIcons = true,
  allowPreview = true,
  initialFiles = [],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const t = useTranslations("FileUpload");

  // Size configurations
  const sizeConfig = useMemo(
    () => ({
      sm: {
        padding: "p-4",
        iconSize: "w-8 h-8",
        uploadIconSize: "w-10 h-10",
        text: "text-xs",
        gap: "gap-2",
        listItemPadding: "p-2",
        fileIconSize: "w-8 h-8",
      },
      md: {
        padding: "p-6",
        iconSize: "w-10 h-10",
        uploadIconSize: "w-12 h-12",
        text: "text-sm",
        gap: "gap-3",
        listItemPadding: "p-3",
        fileIconSize: "w-10 h-10",
      },
      lg: {
        padding: "p-8",
        iconSize: "w-12 h-12",
        uploadIconSize: "w-14 h-14",
        text: "text-base",
        gap: "gap-4",
        listItemPadding: "p-4",
        fileIconSize: "w-12 h-12",
      },
    }),
    [],
  );

  const currentSize = sizeConfig[size];

  // Handlers
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    async (fileList: File[]) => {
      if (fileList.length === 0) return;

      // Check max files limit
      const remainingSlots = maxFiles - files.length;
      if (remainingSlots <= 0) {
        addToast({
          type: "warning",
          message: t("maxFilesReached") || `Maximum ${maxFiles} files allowed`,
        });
        return;
      }

      const filesToProcess = fileList.slice(0, remainingSlots);

      // Validate and create file entries
      const validFiles: UploadedFile[] = [];

      for (const file of filesToProcess) {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          addToast({
            type: "error",
            message: `"${file.name}" ${t("fileTooLarge") || "exceeds size limit"} (${maxSize}MB)`,
          });
          continue;
        }

        // Create file entry
        const fileEntry: UploadedFile = {
          id: generateFileId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          progress: 0,
          status: uploadHandler ? "pending" : "success",
          formattedSize: formatFileSize(file.size),
        };

        validFiles.push(fileEntry);
      }

      if (validFiles.length === 0) return;

      // Update state
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onChange?.(newFiles);

      // Process uploads if handler provided
      if (uploadHandler) {
        for (const fileEntry of validFiles) {
          // Update to uploading status
          setFiles((prev) => prev.map((f) => (f.id === fileEntry.id ? { ...f, status: "uploading", progress: 10 } : f)));

          try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f) => (f.id === fileEntry.id && f.status === "uploading" ? { ...f, progress: Math.min((f.progress || 0) + 15, 90) } : f)),
              );
            }, 200);

            const result = await uploadHandler(fileEntry.file!);

            clearInterval(progressInterval);

            // Update with result
            setFiles((prev) =>
              prev.map((f) => (f.id === fileEntry.id ? { ...f, ...result, status: "success", progress: 100, id: result.id || f.id } : f)),
            );

            onUpload?.(result);

            addToast({
              type: "success",
              message: `"${fileEntry.name}" ${t("uploadSuccess") || "uploaded successfully"}`,
            });
          } catch (error: any) {
            setFiles((prev) => prev.map((f) => (f.id === fileEntry.id ? { ...f, status: "error", error: error.message || "Upload failed" } : f)));

            addToast({
              type: "error",
              message: `"${fileEntry.name}" ${t("uploadFailed") || "upload failed"}`,
            });
          }
        }
      } else {
        // No upload handler - files are immediately "uploaded" (local only)
        for (const fileEntry of validFiles) {
          onUpload?.(fileEntry);
        }
      }
    },
    [files, maxFiles, maxSize, uploadHandler, onUpload, onChange, addToast, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [disabled, processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      processFiles(selectedFiles);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const handleRemove = useCallback(
    (fileId: string | number) => {
      setFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === fileId);
        // Revoke object URL if exists
        if (fileToRemove?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(fileToRemove.url);
        }
        const newFiles = prev.filter((f) => f.id !== fileId);
        onChange?.(newFiles);
        return newFiles;
      });
      onRemove?.(fileId);
    },
    [onChange, onRemove],
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = useCallback(
    (fileEntry: UploadedFile) => {
      if (!uploadHandler || !fileEntry.file) return;
      processFiles([fileEntry.file]);
      handleRemove(fileEntry.id);
    },
    [uploadHandler, processFiles, handleRemove],
  );

  // Render file list item
  const renderFileItem = (file: UploadedFile) => {
    const IconComponent = showTypeIcons ? getFileIcon(file.type, file.name) : File;
    const iconColor = getFileTypeColor(file.type);
    const isImage = file.type.startsWith("image/") && file.url;

    return (
      <div
        key={file.id}
        className={cn(
          "group relative flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border rounded-xl",
          "transition-all duration-200 hover:bg-card hover:shadow-md hover:border-primary/20",
          file.status === "error" && "border-destructive/50 bg-destructive/5",
          file.status === "uploading" && "border-primary/30",
          currentSize.listItemPadding,
        )}
      >
        {/* File Icon / Preview */}
        <div
          className={cn(
            "shrink-0 rounded-lg overflow-hidden flex items-center justify-center",
            "bg-linear-to-br from-muted/50 to-muted",
            currentSize.fileIconSize,
          )}
        >
          {isImage && allowPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <IconComponent className={cn("w-1/2 h-1/2", iconColor)} />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium truncate", currentSize.text)} title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2">
            <span className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>{file.formattedSize}</span>

            {/* Status indicator */}
            {file.status === "uploading" && (
              <span className="flex items-center gap-1 text-primary text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                {file.progress}%
              </span>
            )}
            {file.status === "success" && (
              <span className="flex items-center gap-1 text-success text-xs">
                <Check className="w-3 h-3" />
              </span>
            )}
            {file.status === "error" && (
              <span className="flex items-center gap-1 text-destructive text-xs">
                <AlertCircle className="w-3 h-3" />
                {file.error}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {file.status === "uploading" && (
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-primary/70 rounded-full transition-all duration-300"
                style={{ width: `${file.progress || 0}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Preview button for images */}
          {isImage && allowPreview && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => window.open(file.url, "_blank")} title="Preview">
              <Eye className="w-4 h-4" />
            </Button>
          )}

          {/* Download button */}
          {file.url && file.status === "success" && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={() => {
                const link = document.createElement("a");
                link.href = file.url!;
                link.download = file.name;
                link.click();
              }}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          {/* Retry button for errors */}
          {file.status === "error" && uploadHandler && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-primary" onClick={() => handleRetry(file)} title="Retry">
              <Upload className="w-4 h-4" />
            </Button>
          )}

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleRemove(file.id)}
            disabled={file.status === "uploading"}
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Variant styles
  const variantStyles = {
    default: cn(
      "border-2 border-dashed rounded-2xl",
      currentSize.padding,
      "text-center transition-all duration-300",
      isDragging && !disabled
        ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
        : "border-border hover:border-primary/50 hover:bg-muted/30",
      disabled && "opacity-50 cursor-not-allowed",
    ),
    compact: cn(
      "border border-dashed rounded-xl p-4",
      "flex items-center gap-4 transition-all duration-200",
      isDragging && !disabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
      disabled && "opacity-50 cursor-not-allowed",
    ),
    minimal: cn(
      "rounded-lg p-3 transition-all duration-200",
      isDragging && !disabled ? "bg-primary/10" : "hover:bg-muted/50",
      disabled && "opacity-50 cursor-not-allowed",
    ),
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={variantStyles[variant]}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={variant === "minimal" ? handleBrowseClick : undefined}
        role={variant === "minimal" ? "button" : undefined}
        tabIndex={variant === "minimal" ? 0 : undefined}
      >
        {variant === "default" && (
          <div className={cn("space-y-4", currentSize.gap)}>
            {/* Upload Icon */}
            <div
              className={cn(
                "mx-auto rounded-full flex items-center justify-center",
                "bg-linear-to-br from-primary/20 to-primary/5",
                "ring-4 ring-primary/10",
                currentSize.uploadIconSize,
              )}
            >
              <Upload className={cn("text-primary transition-transform duration-300", isDragging && "scale-110", currentSize.iconSize)} />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className={cn("text-muted-foreground font-medium", currentSize.text)}>
                {dragDropText || t("dragDropText") || "Drag & drop files here"}
              </p>

              <Button
                type="button"
                variant="outline"
                size={size === "lg" ? "md" : "sm"}
                onClick={handleBrowseClick}
                disabled={disabled}
                className="relative overflow-hidden group/btn"
              >
                <span className="relative z-10">{browseText || t("browseFiles") || "Browse files"}</span>
                <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* Formats info */}
            <p className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>
              {supportedFormatsText || t("supportedFormats") || `Max ${maxSize}MB per file • Up to ${maxFiles} files`}
            </p>
          </div>
        )}

        {variant === "compact" && (
          <>
            <div className={cn("shrink-0 rounded-lg flex items-center justify-center", "bg-primary/10", currentSize.iconSize)}>
              <Upload className={cn("text-primary", size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium truncate", currentSize.text)}>{dragDropText || t("dragDropText") || "Drop files here or"}</p>
              <p className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>
                {supportedFormatsText || `Max ${maxSize}MB • ${maxFiles} files`}
              </p>
            </div>
            <Button type="button" variant="primary" size={size === "lg" ? "md" : "sm"} onClick={handleBrowseClick} disabled={disabled}>
              {browseText || t("browseFiles") || "Browse"}
            </Button>
          </>
        )}

        {variant === "minimal" && (
          <div className="flex items-center gap-2 cursor-pointer">
            <Upload className={cn("text-primary", size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
            <span className={cn("text-primary font-medium", currentSize.text)}>{browseText || t("uploadFiles") || "Upload files"}</span>
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={cn("font-medium text-foreground", currentSize.text)}>
              {t("uploadedFiles") || "Uploaded files"} ({files.length}/{maxFiles})
            </h4>
            {files.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  files.forEach((f) => {
                    if (f.url?.startsWith("blob:")) {
                      URL.revokeObjectURL(f.url);
                    }
                  });
                  setFiles([]);
                  onChange?.([]);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t("clearAll") || "Clear all"}
              </Button>
            )}
          </div>

          <div className="space-y-2">{files.map(renderFileItem)}</div>
        </div>
      )}
    </div>
  );
}

// Named exports for convenience
export { FileUpload };
