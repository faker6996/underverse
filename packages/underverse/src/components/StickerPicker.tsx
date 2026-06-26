"use client";

import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSmartTranslations } from "../hooks/useSmartTranslations";
import { cn } from "../utils/cn";
import { STICKER_PACKS, Sticker } from "./sticker-data";
import { StickerGridButton, getStickerImageUrl } from "./sticker-ui";
import { Tooltip } from "./Tooltip";

export interface StickerPickerProps {
  onStickerSelect: (sticker: { id: string; name: string; packId: string; url: string }) => void;
  className?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  emptyHint?: string;
  showSearch?: boolean;
  showPackNav?: boolean;
  columns?: number;
  maxHeight?: string;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onStickerSelect,
  className,
  searchPlaceholder,
  emptyText,
  emptyHint,
  showSearch = true,
  showPackNav = true,
  columns = 4,
  maxHeight = "20rem",
}) => {
  const t = useSmartTranslations("UEditor");
  const [search, setSearch] = useState("");
  const [activePackId, setActivePackId] = useState(STICKER_PACKS[0]?.id || "");

  const resolvedSearchPlaceholder = searchPlaceholder ?? t("stickerPicker.searchPlaceholder");
  const resolvedEmptyText = emptyText ?? t("stickerPicker.noResults");
  const resolvedEmptyHint = emptyHint ?? t("stickerPicker.tryDifferentSearch");
  const resolvedColumns = Math.max(1, Math.floor(columns));

  const gridStyle = {
    gridTemplateColumns: `repeat(${resolvedColumns}, minmax(0, 1fr))`,
  } satisfies React.CSSProperties;

  // Filter stickers across all packs when searching
  const filteredResults = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.toLowerCase();
    const results: { sticker: Sticker; packId: string }[] = [];

    STICKER_PACKS.forEach((pack) => {
      pack.stickers.forEach((sticker) => {
        if (sticker.name.toLowerCase().includes(query)) {
          results.push({ sticker, packId: pack.id });
        }
      });
    });

    return results;
  }, [search]);

  const activePack = useMemo(() => {
    return STICKER_PACKS.find((pack) => pack.id === activePackId);
  }, [activePackId]);

  const handleStickerClick = (sticker: Sticker, packId: string) => {
    onStickerSelect({
      id: sticker.id,
      name: sticker.name,
      packId,
      url: getStickerImageUrl(packId, sticker.id),
    });
    setSearch("");
  };

  const renderContent = () => {
    if (search) {
      if (filteredResults.length === 0) {
        return (
          <div className="flex h-full flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="mb-3 text-4xl animate-bounce">🔍</div>
            <div className="text-sm font-semibold text-muted-foreground">{resolvedEmptyText}</div>
            <div className="mt-1 text-xs text-muted-foreground/80">{resolvedEmptyHint}</div>
          </div>
        );
      }

      return (
        <div className="grid gap-2.5 p-1 animate-fade-in" style={gridStyle}>
          {filteredResults.map(({ sticker, packId }) => (
            <StickerGridButton
              key={`${packId}-${sticker.id}`}
              packId={packId}
              stickerId={sticker.id}
              name={sticker.name}
              animation={sticker.animation}
              onClick={() => handleStickerClick(sticker, packId)}
            />
          ))}
        </div>
      );
    }

    if (!activePack) return null;

    return (
      <div className="animate-fade-in">
        <div className="sticky top-0 z-10 bg-card/85 backdrop-blur-md py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90 border-b border-border/5 mb-2.5 flex items-center gap-1.5 rounded-lg select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
          {activePack.name}
        </div>
        <div className="grid gap-2.5 p-1" style={gridStyle}>
          {activePack.stickers.map((sticker) => (
            <StickerGridButton
              key={sticker.id}
              packId={activePack.id}
              stickerId={sticker.id}
              name={sticker.name}
              animation={sticker.animation}
              onClick={() => handleStickerClick(sticker, activePack.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex max-h-128 w-96 flex-col overflow-hidden transition-all duration-300",
        "rounded-3xl border border-border/10 bg-gradient-to-b from-card/98 to-card/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] shadow-primary/2",
        className,
      )}
    >
      {showSearch && (
        <div className="shrink-0 border-b border-border/10 p-3.5 bg-card/10">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder={resolvedSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full rounded-2xl border border-border/10 bg-muted/20 py-2 pl-9.5 pr-9 text-sm transition-all duration-300",
                "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/20",
                "focus:bg-background/90 focus:shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.04)]",
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scrollable list content */}
      <div
        className="shrink overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-muted-foreground/15 hover:scrollbar-thumb-muted-foreground/25 scrollbar-track-transparent transition-all duration-200"
        style={{ height: maxHeight }}
      >
        {renderContent()}
      </div>

      {!search && showPackNav && (
        <div className="flex shrink-0 items-center justify-start gap-3 border-t border-border/10 px-4 py-2.5 backdrop-blur-md bg-muted/5 overflow-x-auto scrollbar-none">
          {STICKER_PACKS.map((pack) => {
            const packThumbUrl = getStickerImageUrl(pack.id, pack.thumbnail);
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setActivePackId(pack.id)}
                className={cn(
                  "rounded-2xl p-1.5 transition-all duration-300 shrink-0",
                  activePackId === pack.id
                    ? "bg-primary/10 text-primary scale-110 shadow-sm shadow-primary/5 ring-1 ring-primary/25"
                    : "text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground hover:scale-105",
                )}
              >
                <Tooltip placement="top" content={<span className="text-xs font-semibold">{pack.name}</span>}>
                  <span className="inline-flex h-8 w-8 items-center justify-center">
                    <img src={packThumbUrl} alt={pack.name} className="h-7 w-7 object-contain" />
                  </span>
                </Tooltip>
              </button>
            );
          })}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sticker-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes sticker-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes sticker-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes sticker-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes sticker-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sticker-pop {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.08) translateY(-4px); }
        }
        .sticker-bounce:hover img, .group:hover.sticker-bounce img {
          animation: sticker-bounce 0.6s ease-in-out infinite !important;
        }
        .sticker-wiggle:hover img, .group:hover.sticker-wiggle img {
          animation: sticker-wiggle 0.5s ease-in-out infinite !important;
        }
        .sticker-pulse:hover img, .group:hover.sticker-pulse img {
          animation: sticker-pulse 0.8s ease-in-out infinite !important;
        }
        .sticker-shake:hover img, .group:hover.sticker-shake img {
          animation: sticker-shake 0.15s ease-in-out infinite !important;
        }
        .sticker-spin:hover img, .group:hover.sticker-spin img {
          animation: sticker-spin 1.2s linear infinite !important;
        }
        .sticker-pop:hover img, .group:hover.sticker-pop img {
          animation: sticker-pop 0.4s ease-out !important;
        }
      `}} />
    </div>
  );
};

export default StickerPicker;
