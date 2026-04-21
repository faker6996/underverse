"use client";

import React from "react";
import { EmojiPicker as BaseEmojiPicker } from "../EmojiPicker";

/** Public props for the `EmojiPicker` component. */
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return <BaseEmojiPicker onEmojiSelect={onSelect} chrome="embedded" />;
};
