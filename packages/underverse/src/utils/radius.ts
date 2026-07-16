export const STANDARD_BORDER_MODES = ["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"] as const;

// Bản đồ các mode đặc thù theo khách hàng
export const CUSTOM_BORDER_MAP = {
  daewoo: "rounded",
  infiniq: "rounded-full",
} as const;

export const BORDER_MODE_DOCS_TYPE = `"${STANDARD_BORDER_MODES.join('" | "')}" | "${Object.keys(CUSTOM_BORDER_MAP).join('" | "')}"`;

export type StandardBorderMode = typeof STANDARD_BORDER_MODES[number];
export type CustomBorderMode = keyof typeof CUSTOM_BORDER_MAP;
export type BorderMode = StandardBorderMode | CustomBorderMode | (string & {});

export function getBorderRadiusClass(borderMode: BorderMode | undefined = "full") {
  if (!borderMode) return "rounded-full";

  if (borderMode in CUSTOM_BORDER_MAP) {
    return CUSTOM_BORDER_MAP[borderMode as CustomBorderMode];
  }

  if (STANDARD_BORDER_MODES.includes(borderMode as StandardBorderMode)) {
    return `rounded-${borderMode}`;
  }

  return borderMode;
}
