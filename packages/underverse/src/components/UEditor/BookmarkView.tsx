"use client";

import React, { useEffect, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ExternalLink, Globe } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { cn } from "../../utils/cn";

export const BookmarkView: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, editor }) => {
  const t = useSmartTranslations("UEditor");
  const { url, title, description, image, publisher } = node.attrs;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have a title, we don't need to fetch metadata again.
    if (title) return;

    let active = true;

    const safeUpdateAttributes = (attrs: Record<string, any>) => {
      Promise.resolve().then(() => {
        if (active && editor && !editor.isDestroyed) {
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
        const hostname = new URL(url).hostname;
        safeUpdateAttributes({
          title: hostname || url,
          description: t("bookmark.clickToOpenNewTab"),
          publisher: hostname,
        });
      } catch {
        safeUpdateAttributes({
          title: url,
          description: t("bookmark.clickToOpenLink"),
          publisher: "",
        });
      }
      return;
    }

    setLoading(true);
    setError(false);

    fetchMetadata(url)
      .then((meta: any) => {
        if (!active) return;
        safeUpdateAttributes({
          title: meta.title || new URL(url).hostname || url,
          description: meta.description || t("bookmark.noDescription"),
          image: meta.image || "",
          publisher: meta.publisher || new URL(url).hostname || "",
        });
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
        // Fallback title / publisher on error
        try {
          const hostname = new URL(url).hostname;
          safeUpdateAttributes({
            title: hostname || url,
            description: t("bookmark.failedToLoad"),
            publisher: hostname,
          });
        } catch {
          safeUpdateAttributes({
            title: url,
            description: t("bookmark.clickToOpenLink"),
            publisher: "",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [url, title, editor, updateAttributes, t]);

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const displayPublisher = publisher || (() => {
    try {
      return new URL(url).hostname;
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
        <div className="flex flex-col sm:flex-row items-stretch justify-between min-h-[100px]">
          <div className="flex-1 p-4 flex flex-col justify-between gap-1 min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 truncate">
                <Globe className="h-3 w-3 flex-shrink-0" />
                {displayPublisher}
              </span>
              <h4 className="text-sm font-semibold text-foreground line-clamp-1 break-all">
                {title || url}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
            <span className="text-[11px] text-primary/80 font-mono mt-2 truncate flex items-center gap-1">
              {url}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </span>
          </div>

          {image && (
            <div className="relative w-full sm:w-44 h-32 sm:h-auto flex-shrink-0 bg-muted overflow-hidden border-t sm:border-t-0 sm:border-l border-border/50">
              <img
                src={image}
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
