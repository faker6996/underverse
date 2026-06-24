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

/**
 * Converts a Unicode emoji string into a lowercase hyphenated hex code point format
 * used by emoji CDNs (e.g. "😀" -> "1f600", "#️⃣" -> "0023-fe0f-20e3").
 */
export function getEmojiUnifiedCode(emoji: string): string {
  const codePoints = [];
  for (let i = 0; i < emoji.length; ) {
    const codePoint = emoji.codePointAt(i);
    if (codePoint === undefined) break;
    let hex = codePoint.toString(16).toLowerCase();
    if (hex.length < 4) {
      hex = hex.padStart(4, "0");
    }
    codePoints.push(hex);
    i += codePoint > 0xffff ? 2 : 1;
  }
  return codePoints.join("-");
}

let globalEmojiBaseUrl = "https://underverse.infiniq.com.vn/emojis";

/**
 * Configure a custom base URL for loading emoji image assets (e.g. `/emojis` for local offline storage).
 * If not set, defaults to jsDelivr CDN.
 */
export function setEmojiBaseUrl(url: string) {
  globalEmojiBaseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Resolves the final image URL for a given unified emoji code.
 */
export function getEmojiImageUrl(unified: string): string {
  return `${globalEmojiBaseUrl}/${unified}.png`;
}

export const EmojiGridButton: React.FC<{
  emoji: string;
  name: string;
  onClick: () => void;
  className?: string;
  active?: boolean;
}> = ({ emoji, name, onClick, className, active = false }) => {
  const [hasError, setHasError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const unified = React.useMemo(() => getEmojiUnifiedCode(emoji), [emoji]);

  const button = (
    <button
      type="button"
      aria-label={formatEmojiName(name)}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
        "bg-transparent hover:bg-primary/10 border border-transparent hover:border-primary/20",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        "scale-100 hover:scale-110 active:scale-95",
        active ? "bg-primary/15 border-primary/30 ring-2 ring-primary/20" : "",
        className,
      )}
    >
      {hasError ? (
        <span className="text-2xl transition-transform duration-300 group-hover:rotate-6">{emoji}</span>
      ) : (
        <img
          src={getEmojiImageUrl(unified)}
          alt={emoji}
          onError={() => setHasError(true)}
          className="h-6.5 w-6.5 object-contain transition-all duration-300 group-hover:rotate-6 group-hover:drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]"
          loading="lazy"
        />
      )}
    </button>
  );

  if (!isHovered) {
    return button;
  }

  return (
    <Tooltip placement="top" content={<span className="text-xs font-medium">{formatEmojiName(name)}</span>}>
      {button}
    </Tooltip>
  );
};
