"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Smile, Leaf, Utensils, Dumbbell, Lightbulb, Hash, Flag } from "lucide-react";
import { useSmartTranslations } from "../hooks/useSmartTranslations";
import { cn } from "../utils/cn";
import { EmojiGridButton } from "./emoji-ui";
import { Tooltip } from "./Tooltip";
import { EMOJI_LIST } from "./UEditor/emojis";

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
    >
      <div className="sticky top-0 z-10 bg-card py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category.name}</div>
      <div className="grid gap-1" style={gridStyle}>
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
        <div key={category.id} className="mb-4">
          {renderEmojiCategory(category)}
        </div>
      ))
    ) : (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-2 text-4xl">🔍</div>
        <div className="text-sm font-medium text-muted-foreground">{resolvedEmptyText}</div>
        <div className="mt-1 text-xs text-muted-foreground">{resolvedEmptyHint}</div>
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
        "flex max-h-128 w-96 flex-col overflow-hidden",
        isEmbedded ? "bg-transparent" : "rounded-2xl border border-border bg-card shadow-xl",
        className,
      )}
    >
      {showSearch && (
        <div className={cn("shrink-0 border-b p-3", isEmbedded ? "bg-transparent" : "bg-muted/30")}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={resolvedSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full rounded-full border border-border bg-background py-2 pl-9 pr-9 text-sm",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={scrollContainerRef} className="shrink overflow-y-auto px-3 py-2" style={{ height: maxHeight }}>
        {search ? searchResultContent : <div className="space-y-4">{EMOJI_LIST.map((category) => renderEmojiCategory(category, true))}</div>}
      </div>

      {!search && showCategoryNav && (
        <div className={cn("flex shrink-0 items-center justify-around border-t px-2 py-2", isEmbedded ? "bg-transparent" : "bg-muted/30")}>
          {EMOJI_LIST.map((category) => {
            const IconComponent = CATEGORY_ICONS[category.id] || Smile;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  activeCategory === category.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Tooltip placement="top" content={<span className="text-xs font-medium">{category.name}</span>}>
                  <span className="inline-flex">
                    <IconComponent className="h-5 w-5" />
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
