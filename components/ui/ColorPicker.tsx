"use client";

import * as React from "react";
import { Popover } from "./Popover";
import Input from "./Input";
import { Slider } from "./Slider";
import { cn } from "@/lib/utils/cn";
import { Pipette, X, Copy, Check, Palette, History } from "lucide-react";

type OutputFormat = "hex" | "rgba" | "hsl" | "hsla";
type ColorPickerSize = "sm" | "md" | "lg";
type ColorPickerVariant = "default" | "compact" | "full" | "minimal";

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  withAlpha?: boolean;
  format?: OutputFormat;
  presets?: string[];
  /** Class for the trigger button */
  triggerClassName?: string;
  /** Class for the popover content panel */
  contentClassName?: string;
  /** Show a clear button to reset to empty */
  clearable?: boolean;
  /** Show copy to clipboard button */
  copyable?: boolean;
  /** Size variant of the picker */
  size?: ColorPickerSize;
  /** Visual variant of the picker */
  variant?: ColorPickerVariant;
  /** Show recent colors history */
  showRecent?: boolean;
  /** Show color harmony suggestions */
  showHarmony?: boolean;
  /** Max recent colors to remember */
  maxRecent?: number;
}

type RGBA = { r: number; g: number; b: number; a: number };
type HSLA = { h: number; s: number; l: number; a: number };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const str = hex.replace(/^#/, "").trim();
  if (str.length === 3) {
    const r = parseInt(str[0] + str[0], 16);
    const g = parseInt(str[1] + str[1], 16);
    const b = parseInt(str[2] + str[2], 16);
    return { r, g, b };
  }
  if (str.length === 6) {
    const r = parseInt(str.slice(0, 2), 16);
    const g = parseInt(str.slice(2, 4), 16);
    const b = parseInt(str.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function parseAnyColor(input?: string): RGBA | null {
  if (!input) return null;
  const s = input.trim();
  if (s.startsWith("#")) {
    const rgb = hexToRgb(s);
    if (!rgb) return null;
    return { ...rgb, a: 1 };
  }
  // rgba(r,g,b,a)
  const rgbaMatch = s.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)/i);
  if (rgbaMatch) {
    const r = clamp(parseInt(rgbaMatch[1], 10), 0, 255);
    const g = clamp(parseInt(rgbaMatch[2], 10), 0, 255);
    const b = clamp(parseInt(rgbaMatch[3], 10), 0, 255);
    const a = rgbaMatch[4] != null ? clamp(parseFloat(rgbaMatch[4]), 0, 1) : 1;
    return { r, g, b, a };
  }
  // hsla(h,s%,l%,a)
  const hslaMatch = s.match(/hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*,?\s*(\d{1,3}(?:\.\d+)?)%?\s*,?\s*(\d{1,3}(?:\.\d+)?)%?(?:\s*,?\s*(\d*\.?\d+))?\s*\)/i);
  if (hslaMatch) {
    const h = parseFloat(hslaMatch[1]);
    const sl = parseFloat(hslaMatch[2]);
    const l = parseFloat(hslaMatch[3]);
    const a = hslaMatch[4] != null ? clamp(parseFloat(hslaMatch[4]), 0, 1) : 1;
    const rgb = hslToRgb(h, sl, l);
    return { ...rgb, a };
  }
  return null;
}

function formatOutput({ r, g, b, a }: RGBA, withAlpha: boolean, format: OutputFormat) {
  if (format === "hex" && (!withAlpha || a === 1)) {
    return rgbToHex(r, g, b);
  }
  if (format === "hsl" || format === "hsla") {
    const hsl = rgbToHsl(r, g, b);
    if (format === "hsla" || withAlpha) {
      return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${clamp(a, 0, 1)})`;
    }
    return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
  }
  if (withAlpha || a !== 1) {
    return `rgba(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(b, 0, 255)}, ${clamp(a, 0, 1)})`;
  }
  return rgbToHex(r, g, b);
}

// Generate color harmony
function getColorHarmony(rgba: RGBA): { complementary: string; triadic: string[]; analogous: string[] } {
  const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);

  // Complementary: opposite on color wheel
  const compH = (hsl.h + 180) % 360;
  const compRgb = hslToRgb(compH, hsl.s, hsl.l);

  // Triadic: 120 degrees apart
  const tri1H = (hsl.h + 120) % 360;
  const tri2H = (hsl.h + 240) % 360;
  const tri1Rgb = hslToRgb(tri1H, hsl.s, hsl.l);
  const tri2Rgb = hslToRgb(tri2H, hsl.s, hsl.l);

  // Analogous: 30 degrees apart
  const ana1H = (hsl.h + 30) % 360;
  const ana2H = (hsl.h - 30 + 360) % 360;
  const ana1Rgb = hslToRgb(ana1H, hsl.s, hsl.l);
  const ana2Rgb = hslToRgb(ana2H, hsl.s, hsl.l);

  return {
    complementary: rgbToHex(compRgb.r, compRgb.g, compRgb.b),
    triadic: [rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b), rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b)],
    analogous: [rgbToHex(ana1Rgb.r, ana1Rgb.g, ana1Rgb.b), rgbToHex(ana2Rgb.r, ana2Rgb.g, ana2Rgb.b)],
  };
}

const DEFAULT_PRESETS = [
  "#000000", "#ffffff", "#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6",
  "#111827", "#4b5563", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6",
];

const Swatch: React.FC<{ color: string; onClick?: () => void; ariaLabel?: string; size?: "sm" | "md" | "lg" }> = ({
  color,
  onClick,
  ariaLabel,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };
  return (
    <button
      type="button"
      className={cn(
        sizeClasses[size],
        "rounded-md border border-border shadow-sm hover:scale-110 transition-transform",
        onClick && "cursor-pointer"
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
      aria-label={ariaLabel}
    />
  );
};

export default function ColorPicker({
  value,
  defaultValue = "#4f46e5",
  onChange,
  disabled = false,
  withAlpha = false,
  format = "hex",
  presets,
  className,
  triggerClassName,
  contentClassName,
  clearable = false,
  copyable = true,
  size = "md",
  variant = "default",
  showRecent = false,
  showHarmony = false,
  maxRecent = 8,
  ...rest
}: ColorPickerProps) {
  const isControlled = value !== undefined;
  const initial = parseAnyColor(isControlled ? value! : defaultValue) || { r: 79, g: 70, b: 229, a: 1 };
  const [rgba, setRgba] = React.useState<RGBA>(initial);
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(() => formatOutput(initial, withAlpha, format));
  const [copied, setCopied] = React.useState(false);
  const [recentColors, setRecentColors] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isControlled) {
      const parsed = parseAnyColor(value);
      if (parsed) {
        setRgba(parsed);
        setText(formatOutput(parsed, withAlpha, format));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (next: RGBA) => {
    const out = formatOutput(next, withAlpha, format);
    if (!isControlled) setText(out);
    onChange?.(out);

    // Add to recent colors
    if (showRecent) {
      const hexColor = rgbToHex(next.r, next.g, next.b);
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c !== hexColor);
        return [hexColor, ...filtered].slice(0, maxRecent);
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleHexChange = (raw: string) => {
    setText(raw);
    const parsed = parseAnyColor(raw);
    if (parsed) {
      setRgba((prev) => ({ ...parsed, a: withAlpha ? parsed.a : 1 }));
      emit({ ...parsed, a: withAlpha ? parsed.a : 1 });
    }
  };

  const handleNativeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const hex = e.target.value || "#000000";
    const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
    const next = { ...rgba, ...rgb };
    setRgba(next);
    emit(next);
  };

  const setAlpha = (aPct: number) => {
    const a = clamp(aPct / 100, 0, 1);
    const next = { ...rgba, a };
    setRgba(next);
    emit(next);
  };

  const tryEyedropper = async () => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.EyeDropper) {
      // @ts-ignore
      const eye = new window.EyeDropper();
      try {
        const res = await eye.open();
        const rgb = hexToRgb(res.sRGBHex);
        if (rgb) {
          const next = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a };
          setRgba(next);
          emit(next);
        }
      } catch {}
    }
  };

  const clear = () => {
    setText("");
    const next = { r: 0, g: 0, b: 0, a: 0 };
    setRgba(next);
    onChange?.("");
  };

  const swatches = presets && presets.length ? presets : DEFAULT_PRESETS;
  const hexForInput = rgbToHex(rgba.r, rgba.g, rgba.b);
  const alphaPct = Math.round(rgba.a * 100);
  const harmony = showHarmony ? getColorHarmony(rgba) : null;

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  };

  const swatchSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "w-full px-3 rounded-lg border border-input bg-background flex items-center justify-between",
        sizeClasses[size],
        "hover:border-accent-foreground/30 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        triggerClassName
      )}
      aria-label="Open color picker"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded border border-border shadow-sm",
            size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
          )}
          style={{ backgroundColor: withAlpha ? `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})` : hexForInput }}
        />
        <span className="font-mono text-muted-foreground">{text}</span>
      </div>
      <Pipette className={cn(size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4", "text-muted-foreground")} />
    </button>
  );

  const contentWidthByVariant = {
    minimal: 240,
    compact: 280,
    default: 320,
    full: 360,
  };

  return (
    <div className={cn("inline-block w-full", className)} {...rest}>
      <Popover
        trigger={trigger}
        open={open}
        onOpenChange={setOpen}
        placement="bottom-start"
        matchTriggerWidth={variant === "minimal"}
        contentWidth={contentWidthByVariant[variant]}
        contentClassName={cn("p-3 rounded-lg border border-border bg-card shadow-lg", contentClassName)}
      >
        <div className="space-y-3">
          {/* Native input + eyedropper + copy + clear */}
          {variant !== "minimal" && (
            <div className="flex items-center gap-2">
              <input type="color" value={hexForInput} onChange={handleNativeChange} className="h-9 w-9 rounded-md cursor-pointer border border-border" />
              <button
                type="button"
                onClick={tryEyedropper}
                className={cn("h-9 px-3 rounded-md border border-border text-xs hover:bg-accent/10 transition-colors flex items-center gap-1.5")}
              >
                <Pipette className="w-3.5 h-3.5" />
                {variant === "full" && "Pick"}
              </button>
              {copyable && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={cn(
                    "h-9 px-3 rounded-md border border-border text-xs hover:bg-accent/10 transition-colors flex items-center gap-1.5",
                    copied && "bg-green-500/10 border-green-500/30"
                  )}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {variant === "full" && (copied ? "Copied!" : "Copy")}
                </button>
              )}
              {clearable && (
                <button
                  type="button"
                  onClick={clear}
                  className="ml-auto h-9 px-2 rounded-md border border-border text-xs hover:bg-destructive/10 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  {variant === "full" && "Clear"}
                </button>
              )}
            </div>
          )}

          {/* Color value input */}
          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder={
                format === "hsl" || format === "hsla"
                  ? "hsl(240, 82%, 59%)"
                  : withAlpha || format === "rgba"
                  ? "rgba(79,70,229,1)"
                  : "#4f46e5"
              }
              variant="outlined"
              size="sm"
              className="flex-1"
            />
            {variant === "minimal" && copyable && (
              <button
                type="button"
                onClick={copyToClipboard}
                className={cn(
                  "h-9 w-9 rounded-md border border-border hover:bg-accent/10 transition-colors flex items-center justify-center",
                  copied && "bg-green-500/10 border-green-500/30"
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Alpha slider */}
          {withAlpha && (
            <div className="pt-1">
              <Slider min={0} max={100} step={1} value={alphaPct} onChange={(v) => setAlpha(v)} label="Alpha" showValue formatValue={(v) => `${v}%`} size="sm" />
            </div>
          )}

          {/* Presets */}
          {variant !== "minimal" && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Presets
              </div>
              <div className="grid grid-cols-8 gap-2">
                {swatches.map((c) => (
                  <Swatch
                    key={c}
                    color={c}
                    ariaLabel={c}
                    size={swatchSize}
                    onClick={() => {
                      const rgb = hexToRgb(c)!;
                      const next = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a };
                      setRgba(next);
                      emit(next);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent colors */}
          {showRecent && recentColors.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Recent
              </div>
              <div className="flex gap-2 flex-wrap">
                {recentColors.map((c, i) => (
                  <Swatch
                    key={`${c}-${i}`}
                    color={c}
                    ariaLabel={c}
                    size={swatchSize}
                    onClick={() => {
                      const rgb = hexToRgb(c)!;
                      const next = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a };
                      setRgba(next);
                      emit(next);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color Harmony */}
          {showHarmony && harmony && variant !== "minimal" && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Harmony</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24">Complementary</span>
                  <Swatch
                    color={harmony.complementary}
                    ariaLabel="Complementary"
                    size={swatchSize}
                    onClick={() => {
                      const rgb = hexToRgb(harmony.complementary)!;
                      const next = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a };
                      setRgba(next);
                      emit(next);
                    }}
                  />
                  <span className="text-xs font-mono text-muted-foreground">{harmony.complementary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24">Triadic</span>
                  <div className="flex gap-2">
                    {harmony.triadic.map((c) => (
                      <Swatch
                        key={c}
                        color={c}
                        ariaLabel={c}
                        size={swatchSize}
                        onClick={() => {
                          const rgb = hexToRgb(c)!;
                          const next = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a };
                          setRgba(next);
                          emit(next);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24">Analogous</span>
                  <div className="flex gap-2">
                    {harmony.analogous.map((c) => (
                      <Swatch
                        key={c}
                        color={c}
                        ariaLabel={c}
                        size={swatchSize}
                        onClick={() => {
                          const rgb = hexToRgb(c)!;
                          const next = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a };
                          setRgba(next);
                          emit(next);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}
