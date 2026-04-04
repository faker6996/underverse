import type {
  UEditorFontFamilyOption,
  UEditorFontSizeOption,
  UEditorLetterSpacingOption,
  UEditorLineHeightOption,
} from "./types";

export function normalizeStyleValue(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "") : "";
}

export function getDefaultFontFamilies(t: (key: string) => string): UEditorFontFamilyOption[] {
  return [
    { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
    { label: "System UI", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
    { label: "Palatino", value: "'Palatino Linotype', Palatino, Georgia, serif" },
    { label: "Times", value: "'Times New Roman', Times, serif" },
    { label: "JetBrains Mono", value: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace" },
  ];
}

export function getDefaultFontSizes(): UEditorFontSizeOption[] {
  return [
    { label: "12", value: "12px" },
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
    { label: "24", value: "24px" },
    { label: "32", value: "32px" },
  ];
}

export function getDefaultLineHeights(): UEditorLineHeightOption[] {
  return [
    { label: "1.2", value: "1.2" },
    { label: "1.5", value: "1.5" },
    { label: "1.75", value: "1.75" },
    { label: "2", value: "2" },
  ];
}

export function getDefaultLetterSpacings(): UEditorLetterSpacingOption[] {
  return [
    { label: "-0.02em", value: "-0.02em" },
    { label: "0", value: "0" },
    { label: "0.02em", value: "0.02em" },
    { label: "0.05em", value: "0.05em" },
    { label: "0.08em", value: "0.08em" },
  ];
}
