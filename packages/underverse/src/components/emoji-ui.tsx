"use client";

import React from "react";
import { cn } from "../utils/cn";
import { Tooltip } from "./Tooltip";

export function formatEmojiName(name: string) {
  return name.replaceAll("_", " ");
}

export function formatEmojiCountLabel(template: string, shown: number, total: number) {
  return template
    .replace("{shown}", String(shown))
    .replace("{total}", String(total));
}

export const EmojiGridButton: React.FC<{
  emoji: string;
  name: string;
  onClick: () => void;
  className?: string;
  active?: boolean;
}> = ({ emoji, name, onClick, className, active = false }) => {
  return (
    <Tooltip placement="top" content={<span className="text-xs font-medium">{formatEmojiName(name)}</span>}>
      <button
        type="button"
        aria-label={formatEmojiName(name)}
        onClick={onClick}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          active ? "bg-primary/10 ring-2 ring-primary/30" : "hover:bg-accent",
          className,
        )}
      >
        {emoji}
      </button>
    </Tooltip>
  );
};
