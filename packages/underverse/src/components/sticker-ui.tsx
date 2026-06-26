"use client";

import React from "react";
import { cn } from "../utils/cn";
import { Tooltip } from "./Tooltip";

import { STICKER_PACKS } from "./sticker-data";

let globalStickerBaseUrl = "/stickers";

/**
 * Configure a custom base URL for loading sticker image assets.
 * Defaults to `/stickers`.
 */
export function setStickerBaseUrl(url: string) {
  globalStickerBaseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Resolves the final image URL for a given pack and sticker ID.
 */
export function getStickerImageUrl(packId: string, stickerId: string): string {
  const pack = STICKER_PACKS.find((p) => p.id === packId);
  const sticker = pack?.stickers.find((s) => s.id === stickerId);
  const ext = sticker?.ext || "png";
  return `${globalStickerBaseUrl}/${packId}/${stickerId}.${ext}`;
}

export const StickerGridButton: React.FC<{
  packId: string;
  stickerId: string;
  name: string;
  onClick: () => void;
  className?: string;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  animation?: "bounce" | "wiggle" | "spin" | "pulse" | "shake" | "pop";
}> = ({ packId, stickerId, name, onClick, className, active = false, size = "md", animation }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const imageUrl = getStickerImageUrl(packId, stickerId);

  const button = (
    <button
      type="button"
      aria-label={name}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex items-center justify-center rounded-2xl transition-all duration-300",
        "bg-transparent hover:bg-primary/10 border border-transparent hover:border-primary/20",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        "scale-100 hover:scale-105 active:scale-95",
        size === "sm" ? "h-11 w-11 p-1" : size === "lg" ? "h-24 w-24 p-2.5" : "h-20 w-20 p-2",
        active ? "bg-primary/15 border-primary/30 ring-2 ring-primary/20" : "",
        animation ? `sticker-${animation}` : "",
        className,
      )}
    >
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "object-contain transition-all duration-300 group-hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]",
          animation ? "" : "group-hover:rotate-3",
          size === "sm" ? "h-9 w-9" : size === "lg" ? "h-20 w-20" : "h-16 w-16",
        )}
        loading="lazy"
      />
    </button>
  );

  if (!isHovered) {
    return button;
  }

  return (
    <Tooltip placement="top" content={<span className="text-xs font-medium">{name}</span>}>
      {button}
    </Tooltip>
  );
};
