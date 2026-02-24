"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Search, X, Smile, Leaf, Utensils, Dumbbell, Lightbulb, Hash, Flag } from "lucide-react";
import { EMOJI_LIST, type EmojiCategory } from "./emojis";

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose?: () => void;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "smileys_people": Smile,
    "animals_nature": Leaf,
    "food_drink": Utensils,
    "activity": Dumbbell,
    "objects": Lightbulb,
    "symbols": Hash,
    "flags": Flag,
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState(EMOJI_LIST[0]?.id || "");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const isUserScrolling = useRef(false);

    const filteredCategories = useMemo(() => {
        if (!search.trim()) return EMOJI_LIST;

        const query = search.toLowerCase();
        return EMOJI_LIST.map((category) => ({
            ...category,
            emojis: category.emojis.filter(
                (emoji) =>
                    emoji.name.toLowerCase().includes(query) ||
                    emoji.emoji.includes(search)
            ),
        })).filter((category) => category.emojis.length > 0);
    }, [search]);

    const handleEmojiClick = (emoji: string) => {
        onSelect(emoji);
        setSearch("");
    };

    // Handle scroll to update active category
    useEffect(() => {
        if (search) return; // Don't update during search

        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (!isUserScrolling.current) return;

            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;

            // Find which category is most visible
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
    }, [search, activeCategory]);

    // Handle category click to scroll to category
    const handleCategoryClick = (categoryId: string) => {
        const element = categoryRefs.current[categoryId];
        if (!element || !scrollContainerRef.current) return;

        isUserScrolling.current = false;
        setActiveCategory(categoryId);

        element.scrollIntoView({ behavior: "smooth", block: "start" });

        // Re-enable user scrolling detection after animation
        setTimeout(() => {
            isUserScrolling.current = true;
        }, 500);
    };

    // Enable user scrolling on mount
    useEffect(() => {
        isUserScrolling.current = true;
    }, []);

    return (
        <div className="w-96 bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-128">
            {/* Header with Search */}
            <div className="p-3 border-b bg-muted/30 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm biểu tượng cảm xúc"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn(
                            "w-full pl-9 pr-9 py-2 rounded-lg",
                            "bg-background border border-border",
                            "text-sm placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Emoji Grid - Messenger Style */}
            <div
                ref={scrollContainerRef}
                data-os-scrollbar
                className="overflow-y-auto px-3 py-2 shrink"
                style={{ height: "20rem" }}
            >
                {search ? (
                    // Search Results
                    filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <div key={category.id} className="mb-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-card py-1">
                                    {category.name}
                                </div>
                                <div className="grid grid-cols-9 gap-1">
                                    {category.emojis.map((emoji) => (
                                        <button
                                            key={emoji.name}
                                            onClick={() => handleEmojiClick(emoji.emoji)}
                                            className={cn(
                                                "w-9 h-9 flex items-center justify-center rounded-lg",
                                                "text-2xl hover:bg-accent transition-colors",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            )}
                                            title={emoji.name.replace(/_/g, " ")}
                                        >
                                            {emoji.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <div className="text-sm font-medium text-muted-foreground">Không tìm thấy emoji</div>
                            <div className="text-xs text-muted-foreground mt-1">Thử từ khóa khác</div>
                        </div>
                    )
                ) : (
                    // All Categories - Messenger Style
                    <div className="space-y-4">
                        {EMOJI_LIST.map((category) => (
                            <div
                                key={category.id}
                                ref={(el) => { categoryRefs.current[category.id] = el; }}
                            >
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-card py-1 z-10">
                                    {category.name}
                                </div>
                                <div className="grid grid-cols-9 gap-1">
                                    {category.emojis.map((emoji) => (
                                        <button
                                            key={emoji.name}
                                            onClick={() => handleEmojiClick(emoji.emoji)}
                                            className={cn(
                                                "w-9 h-9 flex items-center justify-center rounded-lg",
                                                "text-2xl hover:bg-accent transition-colors",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            )}
                                            title={emoji.name.replace(/_/g, " ")}
                                        >
                                            {emoji.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Navigation - Bottom */}
            {!search && (
                <div className="flex items-center justify-around px-2 py-2 border-t bg-muted/30 shrink-0">
                    {EMOJI_LIST.map((category) => {
                        const IconComponent = CATEGORY_ICONS[category.id] || Smile;
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    activeCategory === category.id
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                                title={category.name}
                            >
                                <IconComponent className="w-5 h-5" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
