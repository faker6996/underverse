"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Smile, Leaf, Utensils, Dumbbell, Lightbulb, Hash, Flag } from "lucide-react";
import { useSmartTranslations } from "../hooks/useSmartTranslations";
import { cn } from "../utils/cn";
import { EmojiGridButton } from "./emoji-ui";
import { Tooltip } from "./Tooltip";
import { EMOJI_LIST } from "./UEditor/emojis";

/** Public props for the `EmojiPicker` component. */
export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  emptyHint?: string;
  showSearch?: boolean;
  showCategoryNav?: boolean;
  columns?: number;
  maxHeight?: string;
  chrome?: "standalone" | "embedded";
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  smileys_people: Smile,
  animals_nature: Leaf,
  food_drink: Utensils,
  activity: Dumbbell,
  objects: Lightbulb,
  symbols: Hash,
  flags: Flag,
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  className,
  searchPlaceholder,
  emptyText,
  emptyHint,
  showSearch = true,
  showCategoryNav = true,
  columns = 9,
  maxHeight = "20rem",
  chrome = "standalone",
}) => {
  const t = useSmartTranslations("UEditor");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(EMOJI_LIST[0]?.id || "");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isUserScrolling = useRef(false);
  
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("emojiPicker.searchPlaceholder");
  const resolvedEmptyText = emptyText ?? t("emojiPicker.noResults");
  const resolvedEmptyHint = emptyHint ?? t("emojiPicker.tryDifferentSearch");
  const resolvedColumns = Math.max(1, Math.floor(columns));
  const isEmbedded = chrome === "embedded";
  
  const gridStyle = {
    gridTemplateColumns: `repeat(${resolvedColumns}, minmax(0, 1fr))`,
  } satisfies React.CSSProperties;

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return EMOJI_LIST;

    const query = search.toLowerCase();
    return EMOJI_LIST.map((category) => ({
      ...category,
      emojis: category.emojis.filter((emoji) => emoji.name.toLowerCase().includes(query) || emoji.emoji.includes(search)),
    })).filter((category) => category.emojis.length > 0);
  }, [search]);

  useEffect(() => {
    if (search) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!isUserScrolling.current) return;

      let maxVisibility = 0;
      let mostVisibleCategory = EMOJI_LIST[0]?.id || "";

      EMOJI_LIST.forEach((category) => {
        const element = categoryRefs.current[category.id];
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, containerRect.top);
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > maxVisibility) {
          maxVisibility = visibleHeight;
          mostVisibleCategory = category.id;
        }
      });

      if (mostVisibleCategory !== activeCategory) {
        setActiveCategory(mostVisibleCategory);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeCategory, search]);

  useEffect(() => {
    isUserScrolling.current = true;
  }, []);

  const renderEmojiCategory = (category: (typeof EMOJI_LIST)[number], assignRef = false) => (
    <div
      key={category.id}
      ref={
        assignRef
          ? (el) => {
              categoryRefs.current[category.id] = el;
            }
          : undefined
      }
      className="scroll-mt-3 mb-2"
    >
      <div className="sticky top-0 z-10 bg-card/85 backdrop-blur-md py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90 border-b border-border/5 mb-2 flex items-center gap-1.5 rounded-lg select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
        {category.name}
      </div>
      <div className="grid gap-1.5 p-1" style={gridStyle}>
        {category.emojis.map((emoji) => (
          <EmojiGridButton
            key={emoji.name}
            emoji={emoji.emoji}
            name={emoji.name}
            onClick={() => handleEmojiClick(emoji.emoji)}
            className="text-2xl"
          />
        ))}
      </div>
    </div>
  );

  const searchResultContent =
    filteredCategories.length > 0 ? (
      filteredCategories.map((category) => (
        <div key={category.id} className="mb-4 animate-fade-in">
          {renderEmojiCategory(category)}
        </div>
      ))
    ) : (
      <div className="flex h-full flex-col items-center justify-center text-center py-12 animate-fade-in">
        <div className="mb-3 text-4xl animate-bounce">🔍</div>
        <div className="text-sm font-semibold text-muted-foreground">{resolvedEmptyText}</div>
        <div className="mt-1 text-xs text-muted-foreground/80">{resolvedEmptyHint}</div>
      </div>
    );

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setSearch("");
  };

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (!element || !scrollContainerRef.current) return;

    isUserScrolling.current = false;
    setActiveCategory(categoryId);
    element.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      isUserScrolling.current = true;
    }, 500);
  };

  return (
    <div
      className={cn(
        "flex max-h-128 w-96 flex-col overflow-hidden transition-all duration-300",
        isEmbedded
          ? "bg-transparent"
          : "rounded-3xl border border-border/10 bg-gradient-to-b from-card/98 to-card/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] shadow-primary/2",
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

      {/* Styled custom scrollbar container */}
      <div 
        ref={scrollContainerRef} 
        className="shrink overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-muted-foreground/15 hover:scrollbar-thumb-muted-foreground/25 scrollbar-track-transparent transition-all duration-200" 
        style={{ height: maxHeight }}
      >
        {search ? searchResultContent : <div className="space-y-3">{EMOJI_LIST.map((category) => renderEmojiCategory(category, true))}</div>}
      </div>

      {!search && showCategoryNav && (
        <div className={cn("flex shrink-0 items-center justify-around border-t border-border/10 px-3 py-2 backdrop-blur-md bg-muted/5")}>
          {EMOJI_LIST.map((category) => {
            const IconComponent = CATEGORY_ICONS[category.id] || Smile;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "rounded-2xl p-2.5 transition-all duration-300",
                  activeCategory === category.id
                    ? "bg-primary/10 text-primary scale-115 shadow-sm shadow-primary/5"
                    : "text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground hover:scale-105",
                )}
              >
                <Tooltip placement="top" content={<span className="text-xs font-semibold">{category.name}</span>}>
                  <span className="inline-flex">
                    <IconComponent className="h-4 w-4" />
                  </span>
                </Tooltip>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
