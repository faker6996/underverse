"use client";

import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import React, { forwardRef, useImperativeHandle } from "react";
import type { Editor } from "@tiptap/core";
import type { SuggestionProps } from "@tiptap/suggestion";
import { Smile } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { EmojiGridButton, formatEmojiCountLabel } from "../emoji-ui";
import { destroyTippyInstance, getFirstTippyInstance, hideTippyInstance, tippy, type TippyInstance } from "./tippy-interop";
import { EMOJI_LIST } from "./emojis";

type EmojiItem = {
    emoji: string;
    name: string;
};

type EmojiListProps = {
    items: EmojiItem[];
    command: (item: EmojiItem) => void;
};

type EmojiListRef = {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

function useResettingIndex(resetToken: unknown) {
    const [state, setState] = React.useState<{ resetToken: unknown; index: number }>({ resetToken, index: 0 });
    const selectedIndex = Object.is(state.resetToken, resetToken) ? state.index : 0;

    const setSelectedIndex = React.useCallback((nextIndex: React.SetStateAction<number>) => {
        setState((prev) => {
            const prevIndex = Object.is(prev.resetToken, resetToken) ? prev.index : 0;
            return {
                resetToken,
                index: typeof nextIndex === "function" ? (nextIndex as (value: number) => number)(prevIndex) : nextIndex,
            };
        });
    }, [resetToken]);

    return [selectedIndex, setSelectedIndex] as const;
}

const EmojiList = forwardRef<EmojiListRef, EmojiListProps>((props, ref) => {
    const t = useSmartTranslations("UEditor");
    const [selectedIndex, setSelectedIndex] = useResettingIndex(props.items);
    const showingCountLabel = formatEmojiCountLabel(t("emojiSuggestion.showingCount"), 64, props.items.length);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev + 1) % props.items.length);
                return true;
            }
            if (event.key === "ArrowLeft") {
                setSelectedIndex((prev) => Math.max(0, prev - 8));
                return true;
            }
            if (event.key === "ArrowRight") {
                setSelectedIndex((prev) => Math.min(props.items.length - 1, prev + 8));
                return true;
            }
            if (event.key === "Enter") {
                const item = props.items[selectedIndex];
                if (item) {
                    props.command(item);
                }
                return true;
            }
            return false;
        },
    }));

    if (props.items.length === 0) {
        return (
            <div className="w-80 p-4 text-center text-sm text-muted-foreground bg-card border border-border/50 rounded-2xl shadow-lg">
                {t("emojiSuggestion.noResults")}
            </div>
        );
    }

    return (
        <div className="w-80 max-h-80 overflow-y-auto bg-card border border-border/50 rounded-2xl shadow-lg">
            <div className="px-3 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("emojiSuggestion.title")}</span>
                </div>
            </div>
            <div className="p-3">
                <div className="grid grid-cols-8 gap-1">
                    {props.items.slice(0, 64).map((item, index) => (
                        <EmojiGridButton
                            key={item.name}
                            emoji={item.emoji}
                            name={item.name}
                            onClick={() => props.command(item)}
                            active={selectedIndex === index}
                            className="text-xl"
                        />
                    ))}
                </div>
                {props.items.length > 64 && (
                    <div className="mt-2 text-xs text-center text-muted-foreground">
                        {showingCountLabel}
                    </div>
                )}
            </div>
        </div>
    );
});

EmojiList.displayName = "EmojiList";

const getEmojiSuggestionItems = ({ query }: { query: string }): EmojiItem[] => {
    const allEmojis = EMOJI_LIST.flatMap((category) => category.emojis);

    if (!query.trim()) {
        // Return popular emojis when no query
        return allEmojis.slice(0, 64);
    }

    const searchQuery = query.toLowerCase();
    return allEmojis.filter(
        (emoji) =>
            emoji.name.toLowerCase().includes(searchQuery) ||
            emoji.emoji.includes(query)
    );
};

export const EmojiSuggestion = Extension.create({
    name: "emojiSuggestion",

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                char: ":",
                pluginKey: new PluginKey("emojiSuggestion"),
                command: ({ editor, range, props }: { editor: Editor; range: any; props: any }) => {
                    editor.chain().focus().deleteRange(range).insertContent(props.emoji).run();
                },
                items: getEmojiSuggestionItems,
                render: () => {
                    let component: ReactRenderer<EmojiListRef, EmojiListProps> | undefined;
                    let popup: TippyInstance[] | undefined;

                    return {
                        onStart: (props: SuggestionProps<EmojiItem>) => {
                            component = new ReactRenderer(EmojiList, {
                                props,
                                editor: props.editor,
                            });

                            if (!props.clientRect) {
                                return;
                            }

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect as () => DOMRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: "manual",
                                placement: "bottom-start",
                            });
                        },
                        onUpdate(props: SuggestionProps<EmojiItem>) {
                            component?.updateProps(props);

                            if (!props.clientRect) {
                                return;
                            }

                            popup?.[0]?.setProps({
                                getReferenceClientRect: props.clientRect as () => DOMRect,
                            });
                        },
                        onKeyDown(props: { event: KeyboardEvent }) {
                            const popupInstance = getFirstTippyInstance(popup);
                            if (props.event.key === "Escape") {
                                hideTippyInstance(popupInstance);
                                return true;
                            }

                            return component?.ref?.onKeyDown(props) ?? false;
                        },
                        onExit() {
                            destroyTippyInstance(getFirstTippyInstance(popup));
                            component?.destroy();
                        },
                    };
                },
            }),
        ];
    },
});
