"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type UEditorColorOption = { name: string; color: string; cssClass?: string };

export const useEditorColors = () => {
  const t = useTranslations("UEditor");

  const textColors = useMemo<UEditorColorOption[]>(
    () => [
      { name: t("colors.default"), color: "inherit", cssClass: "text-foreground" },
      { name: t("colors.muted"), color: "var(--muted-foreground)", cssClass: "text-muted-foreground" },
      { name: t("colors.primary"), color: "var(--primary)", cssClass: "text-primary" },
      { name: t("colors.secondary"), color: "var(--secondary)", cssClass: "text-secondary" },
      { name: t("colors.success"), color: "var(--success)", cssClass: "text-success" },
      { name: t("colors.warning"), color: "var(--warning)", cssClass: "text-warning" },
      { name: t("colors.destructive"), color: "var(--destructive)", cssClass: "text-destructive" },
      { name: t("colors.info"), color: "var(--info)", cssClass: "text-info" },
    ],
    [t],
  );

  const highlightColors = useMemo<UEditorColorOption[]>(
    () => [
      { name: t("colors.default"), color: "", cssClass: "" },
      { name: t("colors.muted"), color: "var(--muted)", cssClass: "bg-muted" },
      { name: t("colors.primary"), color: "color-mix(in oklch, var(--primary) 20%, transparent)", cssClass: "bg-primary/20" },
      { name: t("colors.secondary"), color: "color-mix(in oklch, var(--secondary) 20%, transparent)", cssClass: "bg-secondary/20" },
      { name: t("colors.success"), color: "color-mix(in oklch, var(--success) 20%, transparent)", cssClass: "bg-success/20" },
      { name: t("colors.warning"), color: "color-mix(in oklch, var(--warning) 20%, transparent)", cssClass: "bg-warning/20" },
      { name: t("colors.destructive"), color: "color-mix(in oklch, var(--destructive) 20%, transparent)", cssClass: "bg-destructive/20" },
      { name: t("colors.info"), color: "color-mix(in oklch, var(--info) 20%, transparent)", cssClass: "bg-info/20" },
      { name: t("colors.accent"), color: "var(--accent)", cssClass: "bg-accent" },
    ],
    [t],
  );

  return { textColors, highlightColors };
};

export const EditorColorPalette = ({
  colors,
  currentColor,
  onSelect,
  label,
}: {
  colors: UEditorColorOption[];
  currentColor: string;
  onSelect: (color: string) => void;
  label: string;
}) => (
  <div className="p-2">
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">{label}</span>
    <div className="grid grid-cols-4 gap-1.5 mt-2">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(c.color)}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all hover:scale-105",
            currentColor === c.color ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50",
          )}
          style={{ backgroundColor: c.color || "transparent" }}
          title={c.name}
        >
          {c.color === "" && <X className="w-4 h-4 text-muted-foreground" />}
          {c.color === "inherit" && <span className="text-xs font-medium">A</span>}
        </button>
      ))}
    </div>
  </div>
);

