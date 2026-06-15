"use client";

import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { cn } from "../../utils/cn";
import { Popover } from "../Popover";
import { Settings } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";

export const FormRadioView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor, selected }) => {
  const t = useSmartTranslations("UEditor");
  const isChecked = !!node.attrs.checked;
  const isEditable = editor.isEditable;
  const groupName = node.attrs.name || "radio-group";

  const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditable) return;
    editor.commands.checkFormRadio(node.attrs.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      handleSelect(e);
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className={cn(
        "inline-flex items-center justify-center align-middle mx-1 select-none",
        isEditable ? "cursor-pointer" : "cursor-default"
      )}
    >
      <span
        role="radio"
        aria-checked={isChecked}
        tabIndex={isEditable ? 0 : -1}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full border bg-background transition-all duration-200 outline-none",
          isChecked ? "border-primary scale-100" : "border-border/70 hover:border-primary/50",
          selected && "ring-2 ring-primary/30 ring-offset-1",
          isEditable && "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-1 focus-visible:border-primary"
        )}
      >
        <span
          className={cn(
            "w-2.5 h-2.5 rounded-full bg-primary transition-all duration-200 ease-out-back",
            isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>

      {isEditable && selected && (
        <span className="inline-flex items-center ml-0.5" contentEditable={false}>
          <Popover
            placement="bottom-start"
            trigger={
              <button
                type="button"
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                title={t("radio.editGroup") || "Edit Group"}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="p-3 w-52 flex flex-col gap-2 bg-card border rounded-xl shadow-lg text-card-foreground">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("radio.groupName") || "Group Name"}
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => updateAttributes({ name: e.target.value })}
                className="w-full text-sm px-2 py-1.5 border border-border/60 rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </Popover>
        </span>
      )}
    </NodeViewWrapper>
  );
};
