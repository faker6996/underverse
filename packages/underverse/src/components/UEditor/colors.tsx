"use client";

import React, { useMemo, useRef } from "react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { Check, Highlighter, Palette, Paintbrush } from "lucide-react";
import { cn } from "../../utils/cn";
import { Tooltip } from "../Tooltip";

export type UEditorColorOption = { name: string; color: string; cssClass?: string; automatic?: boolean };

export const TextColorIcon = ({ color }: { color?: string }) => {
  const underlineColor = color && color !== "inherit" ? color : "currentColor";

  return (
    <span className="relative flex h-5 w-5 items-center justify-center leading-none">
      <span className="text-[15px] font-semibold leading-none">A</span>
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: underlineColor }}
      />
    </span>
  );
};

export const HighlightColorIcon = ({ color }: { color?: string }) => {
  const underlineColor = color || "currentColor";

  return (
    <span className="relative flex h-5 w-5 items-center justify-center leading-none">
      <Highlighter className="h-4 w-4" />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: underlineColor }}
      />
    </span>
  );
};

export const CellBgColorIcon = ({ color }: { color?: string }) => {
  const underlineColor = color && color !== "inherit" ? color : "currentColor";

  return (
    <span className="relative flex h-5 w-5 items-center justify-center leading-none">
      <Paintbrush className="h-4 w-4" />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: underlineColor }}
      />
    </span>
  );
};

const EDITOR_COLOR_SWATCHES = [
  "#000000",
  "#3f3f46",
  "#713f12",
  "#14532d",
  "#164e63",
  "#1e3a8a",
  "#3730a3",
  "#404040",
  "#b91c1c",
  "#c2410c",
  "#a16207",
  "#15803d",
  "#0f766e",
  "#2563eb",
  "#4f46e5",
  "#737373",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#7c3aed",
  "#a3a3a3",
  "#f43f5e",
  "#f59e0b",
  "#facc15",
  "#00e676",
  "#22d3ee",
  "#06b6d4",
  "#be185d",
  "#bdbdbd",
  "#f9a8d4",
  "#fecaca",
  "#fde68a",
  "#bbf7d0",
  "#a7f3d0",
  "#bae6fd",
  "#c4b5fd",
  "#f5f5f5",
];

const HIGHLIGHT_COLOR_SWATCHES = [
  "#fef08a",
  "#fde68a",
  "#fed7aa",
  "#fecaca",
  "#fbcfe8",
  "#e9d5ff",
  "#c7d2fe",
  "#bfdbfe",
  "#bae6fd",
  "#ccfbf1",
  "#bbf7d0",
  "#d9f99d",
  "#e5e7eb",
  "#fca5a5",
  "#fdba74",
  "#facc15",
  "#86efac",
  "#5eead4",
  "#7dd3fc",
  "#a5b4fc",
  "#d8b4fe",
  "#f0abfc",
  "#f9a8d4",
  "#d4d4d4",
];

function buildColorOptions(colors: string[], prefix: string): UEditorColorOption[] {
  return colors.map((color, index) => ({ name: `${prefix} ${index + 1}`, color }));
}

export const useEditorColors = () => {
  const t = useSmartTranslations("UEditor");

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
      ...buildColorOptions(EDITOR_COLOR_SWATCHES, t("colors.color")),
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
      ...buildColorOptions(HIGHLIGHT_COLOR_SWATCHES, t("colors.color")),
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
}) => {
  const t = useSmartTranslations("UEditor");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const automaticColor = colors[0]?.color ?? "";
  const paletteColors = colors.slice(1);

  return (
    <div className="w-56 p-2">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSelect(automaticColor)}
        className={cn(
          "mt-2 flex h-9 w-full items-center gap-3 rounded-md border px-2 text-sm transition-colors",
          "bg-muted/50 hover:bg-muted",
          currentColor === automaticColor ? "border-primary text-primary" : "border-transparent text-foreground",
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded border border-border bg-background">
          {currentColor === automaticColor && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="flex-1 text-center">{t("colors.automatic")}</span>
      </button>

      <div className="mt-2 grid grid-cols-8 gap-1">
        {paletteColors.map((c) => (
          <Tooltip key={`${c.name}-${c.color}`} placement="top" content={<span className="text-xs font-medium">{c.name}</span>}>
            <button
              type="button"
              aria-label={c.name}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(c.color)}
              className={cn(
                "relative h-5 w-5 rounded-[3px] border transition-transform hover:scale-110",
                currentColor === c.color ? "border-primary ring-2 ring-primary/25" : "border-border/70",
              )}
              style={{ backgroundColor: c.color || "transparent" }}
            >
              {currentColor === c.color && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                </span>
              )}
            </button>
          </Tooltip>
        ))}
      </div>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => colorInputRef.current?.click()}
        className="mt-3 flex h-9 w-full items-center gap-3 rounded-md px-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <span
          aria-hidden="true"
          className="h-5 w-5 rounded border border-border"
          style={{
            background:
              "linear-gradient(135deg, #ff004c 0%, #fffb00 22%, #00ff66 42%, #00d5ff 62%, #2446ff 78%, #ff00d4 100%)",
          }}
        />
        <span className="flex-1 text-center">{t("colors.moreColors")}</span>
        <Palette className="h-4 w-4 text-muted-foreground" />
        <input
          ref={colorInputRef}
          type="color"
          value={currentColor.startsWith("#") ? currentColor : "#000000"}
          onChange={(event) => onSelect(event.target.value)}
          className="sr-only"
          tabIndex={-1}
        />
      </button>
    </div>
  );
};
