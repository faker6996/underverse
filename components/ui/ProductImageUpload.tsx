"use client";

import React, { useState, useRef, DragEvent } from "react";
import Image from "next/image";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ProductImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ value, onChange, disabled = false, className }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    const acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!acceptedFormats.includes(file.type)) {
      setError(`Định dạng không hỗ trợ. Chỉ chấp nhận: JPG, PNG, WEBP, GIF`);
      return;
    }

    // Validate file size (10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File quá lớn. Kích thước tối đa: 10MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/product-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (result.success && result.data?.path) {
        onChange(result.data.path);
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Không thể upload ảnh");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {value ? (
        <div className="space-y-4">
          <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden border-2 border-border bg-muted shadow-lg group">
            <Image
              src={value}
              alt="Product image"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button type="button" variant="default" size="sm" onClick={handleClickUpload} disabled={disabled || uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Thay đổi
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={handleRemove} disabled={disabled || uploading}>
                  <X className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <span>Ảnh sản phẩm đã tải lên thành công</span>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "w-full aspect-square max-w-md rounded-2xl border-2 border-dashed transition-all duration-200",
            "bg-linear-to-br from-muted/30 to-muted/10",
            "flex flex-col items-center justify-center cursor-pointer",
            "hover:border-primary/60 hover:bg-primary/5 hover:shadow-lg hover:scale-[1.02]",
            isDragging && "border-primary bg-primary/10 shadow-lg scale-[1.02]",
            (disabled || uploading) && "opacity-50 cursor-not-allowed hover:scale-100",
            !isDragging && !disabled && !uploading && "border-border",
          )}
          onClick={!disabled && !uploading ? handleClickUpload : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors",
                isDragging ? "bg-primary/20" : "bg-primary/10",
              )}
            >
              <Upload className={cn("w-10 h-10 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {uploading ? "Đang tải lên..." : isDragging ? "Thả ảnh vào đây" : "Tải ảnh sản phẩm"}
            </h3>

            <p className="text-sm text-muted-foreground mb-3 max-w-xs">
              {uploading ? "Vui lòng đợi trong giây lát" : "Click để chọn hoặc kéo thả ảnh vào đây"}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <div className="px-3 py-1.5 bg-muted rounded-full">JPG, PNG, WEBP, GIF</div>
              <div className="px-3 py-1.5 bg-muted rounded-full">Tối đa 10MB</div>
            </div>

            {uploading && (
              <div className="mt-4 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[progress_1s_ease-in-out_infinite]" />
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <X className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
