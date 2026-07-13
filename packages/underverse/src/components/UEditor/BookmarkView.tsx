"use client";

import React, { useEffect, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { AlertCircle, ExternalLink, Globe, RefreshCw } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { cn } from "../../utils/cn";
import { sanitizeUEditorUrl } from "./url-safety";

export const BookmarkView: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, editor }) => {
  const t = useSmartTranslations("UEditor");
  const { url, title, description, image, publisher } = node.attrs;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const lastFetchKeyRef = React.useRef("");
  const fetchRequestIdRef = React.useRef(0);
  const safeUrl = sanitizeUEditorUrl(String(url ?? ""), "link");
  const safeImage = sanitizeUEditorUrl(String(image ?? ""), "image");
  const clickToOpenNewTabMessage = t("bookmark.clickToOpenNewTab");
  const clickToOpenLinkMessage = t("bookmark.clickToOpenLink");
  const noDescriptionMessage = t("bookmark.noDescription");

  useEffect(() => {
    // If we already have a title, we don't need to fetch metadata again unless the user explicitly retries.
    if (title && retryToken === 0) return;
    if (!safeUrl) return;
    const fetchKey = `${safeUrl}\u0000${retryToken}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;

    const requestId = fetchRequestIdRef.current + 1;
    fetchRequestIdRef.current = requestId;
    let active = true;

    const safeUpdateAttributes = (attrs: Record<string, unknown>) => {
      Promise.resolve().then(() => {
        if (active && fetchRequestIdRef.current === requestId && editor && !editor.isDestroyed) {
          updateAttributes(attrs);
        }
      });
    };

    // Look for fetchMetadata option in the extension
    const extension = editor.extensionManager.extensions.find((e) => e.name === "bookmark");
    const fetchMetadata = extension?.options?.fetchMetadata;

    if (!fetchMetadata) {
      // Fallback if no fetchMetadata is provided
      try {
        const hostname = new URL(safeUrl).hostname;
        safeUpdateAttributes({
          title: hostname || safeUrl,
          description: clickToOpenNewTabMessage,
          publisher: hostname,
        });
      } catch {
        safeUpdateAttributes({
          title: safeUrl,
          description: clickToOpenLinkMessage,
          publisher: "",
        });
      }
      return () => {
        active = false;
      };
    }

    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
      setError(false);
    });

    fetchMetadata(safeUrl)
      .then((meta: { title?: string; description?: string; image?: string; publisher?: string }) => {
        if (!active || fetchRequestIdRef.current !== requestId) return;
        const hostname = (() => {
          try {
            return new URL(safeUrl).hostname;
          } catch {
            return "";
          }
        })();
        safeUpdateAttributes({
          title: meta.title || hostname || safeUrl,
          description: meta.description || noDescriptionMessage,
          image: meta.image ? sanitizeUEditorUrl(meta.image, "image") : "",
          publisher: meta.publisher || hostname,
        });
        setLoading(false);
      })
      .catch(() => {
        if (!active || fetchRequestIdRef.current !== requestId) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    safeUrl,
    title,
    editor,
    updateAttributes,
    retryToken,
    clickToOpenNewTabMessage,
    clickToOpenLinkMessage,
    noDescriptionMessage,
  ]);

  const openLink = () => {
    if (safeUrl) window.open(safeUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenLink = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openLink();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    openLink();
  };

  const handleRetryPreview = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setRetryToken((value) => value + 1);
  };

  const displayPublisher = publisher || (() => {
    try {
      return safeUrl ? new URL(safeUrl).hostname : "";
    } catch {
      return "";
    }
  })();

  return (
    <NodeViewWrapper
      className={cn(
        "my-4 block overflow-hidden rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-all duration-200 cursor-pointer select-none",
        selected && "ring-2 ring-primary/45 border-primary/20 shadow-sm"
      )}
      onClick={handleOpenLink}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={safeUrl ? 0 : -1}
      aria-disabled={!safeUrl}
    >
      {loading ? (
        <div className="flex items-center justify-between p-4 gap-4 animate-pulse">
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-1/3 bg-muted-foreground/20 rounded" />
            <div className="h-5 w-3/4 bg-muted-foreground/20 rounded" />
            <div className="h-4 w-5/6 bg-muted-foreground/20 rounded" />
          </div>
          <div className="h-20 w-32 bg-muted-foreground/20 rounded-lg flex-shrink-0" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch justify-between min-h-25">
          <div className="flex-1 p-4 flex flex-col justify-between gap-1 min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 truncate">
                <Globe className="h-3 w-3 flex-shrink-0" />
                {displayPublisher}
              </span>
              <h4 className="text-sm font-semibold text-foreground line-clamp-1 break-all">
                {title || safeUrl || String(url ?? "")}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
            <span className="text-[11px] text-primary/80 font-mono mt-2 truncate flex items-center gap-1">
              {safeUrl || String(url ?? "")}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </span>
            {error && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-destructive">
                <span className="inline-flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t("bookmark.previewFailed")}
                </span>
                <button
                  type="button"
                  onClick={handleRetryPreview}
                  className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-0.5 font-medium hover:bg-destructive/10"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t("bookmark.retryPreview")}
                </button>
              </div>
            )}
          </div>

          {safeImage && (
            <div className="relative w-full sm:w-44 h-32 sm:h-auto flex-shrink-0 bg-muted overflow-hidden border-t sm:border-t-0 sm:border-l border-border/50">
              <img
                src={safeImage}
                alt={title || "Link preview image"}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};
