"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { Editor } from "@tiptap/core";
import { cn } from "@/lib/utils/cn";

export const CharacterCountDisplay = ({ editor, maxCharacters }: { editor: Editor; maxCharacters?: number }) => {
  const t = useTranslations("UEditor");

  const storage = editor.storage as unknown as {
    characterCount?: { characters?: () => number; words?: () => number };
  };

  const characterCount = storage.characterCount?.characters?.() ?? 0;
  const wordCount = storage.characterCount?.words?.() ?? 0;
  const percentage = maxCharacters ? Math.round((characterCount / maxCharacters) * 100) : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground border-t bg-muted/20">
      <span>
        {wordCount} {t("words")}
      </span>
      <span>
        {characterCount} {t("characters")}
      </span>
      {maxCharacters && (
        <span className={cn(percentage > 90 && "text-destructive", percentage > 100 && "font-bold")}>
          {characterCount}/{maxCharacters}
        </span>
      )}
    </div>
  );
};

