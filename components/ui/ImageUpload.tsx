// components/ui/ImageUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Button from "./Button";
import { useToast } from "./Toast";
import { useTranslations } from "@/lib/i18n/translation-adapter";

// Upload interface for basic setup
interface UploadedImage {
  id: number;
  path: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  formattedSize?: string;
}

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

export default function ImageUpload({
  onUpload,
  onRemove,
  maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760") / (1024 * 1024), // Convert bytes to MB
  accept = "image/*",
  multiple = false,
  disabled = false,
  className,
  showPreview = true,
  previewSize = "md",
  dragDropText,
  browseText,
  supportedFormatsText,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const t = useTranslations("OCR.imageUpload");

  const previewSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Validate files
      const validFiles = files.filter((file) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          addToast({
            type: "error",
            message: `File "${file.name}" is too large. Max size: ${maxSize}MB`,
          });
          return false;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          addToast({
            type: "error",
            message: `File "${file.name}" is not a valid image`,
          });
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);

      try {
        // Upload files one by one
        for (const file of validFiles) {
          const formData = new FormData();
          formData.append("file", file);

          // const response = await callApi<UploadedImage>(API_ROUTES.UPLOAD.IMAGE, HTTP_METHOD_ENUM.POST, formData);
          const response = {
            id: Date.now(),
            path: "",
            url: URL.createObjectURL(file),
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            width: 0,
            height: 0,
            formattedSize: `${(file.size / 1024).toFixed(1)} KB`,
          };

          const newImage: UploadedImage = {
            id: response.id,
            path: response.path,
            url: response.url,
            originalName: response.originalName,
            size: response.size,
            mimeType: response.mimeType,
            width: response.width,
            height: response.height,
            formattedSize: response.formattedSize,
          };

          setUploadedImages((prev) => [...prev, newImage]);
          onUpload?.(newImage);

          addToast({
            type: "success",
            message: `"${file.name}" uploaded successfully`,
          });
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        addToast({
          type: "error",
          message: error.message || "Upload failed",
        });
      } finally {
        setUploading(false);
      }
    },
    [maxSize, addToast, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [disabled, handleFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);

      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const handleRemoveImage = (imageId: string | number) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== Number(imageId)));
    onRemove?.(String(imageId));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl md:rounded-3xl p-8 text-center transition-all duration-200",
          isDragging && !disabled ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-2xl md:rounded-3xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">{dragDropText || t("dragDropText")}</p>

            <Button type="button" variant="outline" size="sm" onClick={handleBrowseClick} disabled={disabled || uploading}>
              {browseText || t("browseFiles")}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">{supportedFormatsText || t("supportedFormats")}</p>
        </div>

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

      {/* Preview Area */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Images</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group bg-card border border-border rounded-2xl md:rounded-3xl p-3">
                {/* Remove Button */}
                <Button
                  variant="danger"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleRemoveImage(image.id)}
                >
                  <X className="w-3 h-3" />
                </Button>

                {/* Image Preview */}
                <div className={cn("mx-auto mb-2 overflow-hidden rounded-lg", previewSizes[previewSize])}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to file icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>

                {/* Image Info */}
                <div className="space-y-1">
                  <p className="text-xs font-medium truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">{image.formattedSize}</p>
                  {image.width && image.height && (
                    <p className="text-xs text-muted-foreground">
                      {image.width} × {image.height}
                    </p>
                  )}
                </div>

                {/* Success Indicator */}
                <div className="absolute top-1 left-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-success-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
