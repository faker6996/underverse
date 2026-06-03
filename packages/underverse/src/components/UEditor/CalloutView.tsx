"use client";

import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Popover } from "../Popover";
import { EmojiPicker } from "./emoji-picker";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { cn } from "../../utils/cn";

const CALLOUT_COLORS = [
  { name: "Gray", color: "var(--muted)" },
  { name: "Blue", color: "color-mix(in oklch, var(--info) 15%, transparent)" },
  { name: "Green", color: "color-mix(in oklch, var(--success) 15%, transparent)" },
  { name: "Yellow", color: "color-mix(in oklch, var(--warning) 15%, transparent)" },
  { name: "Red", color: "color-mix(in oklch, var(--destructive) 15%, transparent)" },
];

export const CalloutView: React.FC<NodeViewProps> = ({ node, updateAttributes, selected }) => {
  const t = useSmartTranslations("UEditor");
  const currentEmoji = node.attrs.emoji ?? "💡";
  const currentBgColor = node.attrs.backgroundColor ?? "var(--muted)";

  return (
    <NodeViewWrapper
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 my-4 transition-all duration-200 border-border/50",
        selected && "ring-2 ring-primary/45 border-primary/20 shadow-sm"
      )}
      style={{ backgroundColor: currentBgColor }}
    >
      <div className="flex items-center justify-center select-none" contentEditable={false}>
        <Popover
          placement="bottom-start"
          trigger={
            <button
              type="button"
              className="flex items-center justify-center text-2xl h-9 w-9 hover:bg-muted-foreground/10 active:scale-95 rounded-lg transition-all focus:outline-none"
            >
              {currentEmoji}
            </button>
          }
        >
          <div className="flex flex-col gap-3 w-64 max-h-[360px] overflow-y-auto p-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {t("callout.selectEmoji")}
            </div>
            <div className="h-44 overflow-y-auto border border-border/40 rounded-lg">
              <EmojiPicker onSelect={(emoji) => updateAttributes({ emoji })} />
            </div>
            <div className="border-t border-border/50 pt-2 mt-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                {t("callout.backgroundColor")}
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {CALLOUT_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    title={col.name}
                    onClick={() => updateAttributes({ backgroundColor: col.color })}
                    className={cn(
                      "h-6 w-6 rounded-full border transition-all active:scale-90 hover:scale-105",
                      currentBgColor === col.color ? "border-primary ring-2 ring-primary/30" : "border-border/60"
                    )}
                    style={{ backgroundColor: col.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Popover>
      </div>
      <NodeViewContent className="min-w-0 flex-1 outline-none" />
    </NodeViewWrapper>
  );
};
