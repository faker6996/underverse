"use client";

import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

export const FormCheckboxView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor, selected }) => {
  const isChecked = !!node.attrs.checked;
  const isCircle = node.attrs.variant === "circle";
  const isEditable = editor.isEditable;

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    updateAttributes({ checked: !isChecked });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      handleToggle(e);
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className={cn(
        "inline-flex items-center justify-center align-middle mx-1",
        isEditable ? "cursor-pointer select-none" : "cursor-default"
      )}
    >
      <span
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={isEditable ? 0 : -1}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center justify-center w-5 h-5 border text-primary-foreground transition-all duration-200 outline-none",
          isCircle ? "rounded-full" : "rounded-md",
          isChecked
            ? "bg-primary border-primary scale-100"
            : "bg-background border-border/70 hover:border-primary/50",
          selected && "ring-2 ring-primary/30 ring-offset-1",
          isEditable && "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-1 focus-visible:border-primary"
        )}
      >
        <span
          className={cn(
            "transition-transform duration-200 ease-out-back",
            isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        >
          <Check className="w-3.5 h-3.5 stroke-[3px]" />
        </span>
      </span>
    </NodeViewWrapper>
  );
};
