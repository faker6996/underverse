"use client";

import React, { useEffect, useState, useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Download, File as LucideFile, FileText, Image, Music, RefreshCw, Video } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { cn } from "../../utils/cn";
import { sanitizeUEditorUrl } from "./url-safety";

function formatBytes(bytes: number, decimals = 1) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  const mime = String(type || "").toLowerCase();
  if (mime.includes("pdf")) return FileText;
  if (mime.startsWith("image/")) return Image;
  if (mime.startsWith("audio/")) return Music;
  if (mime.startsWith("video/")) return Video;
  return LucideFile;
}

function dataURLtoFile(dataurl: string, filename: string, mimeType?: string): File | null {
  try {
    const arr = dataurl.split(",");
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : (mimeType || "application/octet-stream");

    const base64Data = arr[arr.length - 1].replace(/\s+/g, "");
    let bytes: Uint8Array;
    if (typeof Buffer !== "undefined") {
      bytes = new Uint8Array(Buffer.from(base64Data, "base64"));
    } else {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    }
    return new File([bytes as unknown as BlobPart], filename, { type: mime });
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Upload failed";
}

export const FileCardView: React.FC<NodeViewProps> = ({ node, selected, editor, updateAttributes }) => {
  const t = useSmartTranslations("UEditor");
  const { src, fileName, fileSize, fileType } = node.attrs;
  const FileIcon = getFileIcon(fileType);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const uploadAttemptedRef = useRef(false);
  const lastUploadSrcRef = useRef("");
  const uploadRequestIdRef = useRef(0);
  const safeSrc = sanitizeUEditorUrl(String(src ?? ""), "file");
  const extension = editor?.extensionManager?.extensions?.find((item) => item.name === "fileCard");
  const uploadFn = extension?.options?.upload as ((file: File) => Promise<string> | string) | undefined;

  useEffect(() => {
    if (lastUploadSrcRef.current !== safeSrc) {
      lastUploadSrcRef.current = safeSrc;
      uploadAttemptedRef.current = false;
    }

    if (!safeSrc || !safeSrc.startsWith("data:") || !uploadFn) {
      return;
    }

    if (uploadAttemptedRef.current || !updateAttributes) {
      return;
    }

    uploadAttemptedRef.current = true;
    setUploadError(null);
    const requestId = uploadRequestIdRef.current + 1;
    uploadRequestIdRef.current = requestId;
    let active = true;

    const runUpload = async () => {
      try {
        const file = dataURLtoFile(safeSrc, fileName || "file", fileType);
        if (!file) {
          throw new Error("Failed to parse file data");
        }

        const resolvedUrl = await uploadFn(file);
        const nextSrc = sanitizeUEditorUrl(String(resolvedUrl ?? ""), "file");
        if (!nextSrc) throw new Error("Upload handler returned an unsafe URL");

        Promise.resolve().then(() => {
          if (active && uploadRequestIdRef.current === requestId && editor && !editor.isDestroyed) {
            updateAttributes({ src: nextSrc });
          }
        });
      } catch (error: unknown) {
        if (!active || uploadRequestIdRef.current !== requestId) return;
        setUploadError(getErrorMessage(error));
        uploadAttemptedRef.current = false;
      }
    };

    void runUpload();

    return () => {
      active = false;
    };
  }, [safeSrc, fileName, fileType, editor, updateAttributes, uploadFn, retryToken]);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!safeSrc) return;

    const link = document.createElement("a");
    link.href = safeSrc;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasInlineUpload = safeSrc.startsWith("data:") && Boolean(uploadFn);
  const handleRetryUpload = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    uploadAttemptedRef.current = false;
    setUploadError(null);
    setRetryToken((value) => value + 1);
  };

  return (
    <NodeViewWrapper
      className={cn(
        "my-4 flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 hover:bg-muted/15 transition-all duration-200 cursor-pointer select-none",
        selected && "ring-2 ring-primary/45 border-primary/20 shadow-sm"
      )}
      onClick={handleDownload}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
          <FileIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate break-all">
            {fileName || t("fileCard.unnamed")}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            {fileSize ? <span>{formatBytes(fileSize)}</span> : null}
            {hasInlineUpload && (
              <span className={cn(
                "font-medium truncate max-w-50",
                uploadError ? "text-destructive" : "text-primary animate-pulse"
              )}>
                {uploadError ? `${t("fileCard.uploadFailed") || "Tải lên thất bại"}: ${uploadError}` : t("fileCard.uploading")}
              </span>
            )}
            {hasInlineUpload && uploadError && (
              <button
                type="button"
                onClick={handleRetryUpload}
                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-1.5 py-0.5 text-[11px] font-medium text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="h-3 w-3" />
                {t("fileCard.retryUpload")}
              </button>
            )}
          </div>
        </div>
      </div>

      {safeSrc && (
        <button
          type="button"
          onClick={handleDownload}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all focus:outline-none"
        >
          <Download className="h-4 w-4" />
        </button>
      )}
    </NodeViewWrapper>
  );
};
