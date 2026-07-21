"use client";

import React from "react";

const LazyBaseEmojiPicker = React.lazy(async () => {
  const { EmojiPicker } = await import("../EmojiPicker");
  return { default: EmojiPicker };
});

/** Public props for the `EmojiPicker` component. */
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <React.Suspense fallback={<div className="h-44 animate-pulse rounded-lg bg-muted/30" />}>
      <LazyBaseEmojiPicker onEmojiSelect={onSelect} chrome="embedded" />
    </React.Suspense>
  );
};
