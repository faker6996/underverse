"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

type WatermarkPreset = "confidential" | "draft" | "sample" | "copyright" | "doNotCopy" | "internal";
type WatermarkPattern = "diagonal" | "grid" | "straight";

export interface WatermarkProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string | string[]; // text watermark (support multi-line)
  image?: string; // image src watermark
  width?: number; // pattern tile width (content box)
  height?: number; // pattern tile height (content box)
  gapX?: number; // horizontal gap between tiles
  gapY?: number; // vertical gap between tiles
  rotate?: number; // degrees
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  color?: string; // text color
  /** Use gradient colors */
  gradient?: string;
  opacity?: number; // overall layer opacity (0..1)
  offsetLeft?: number; // background-position x
  offsetTop?: number; // background-position y
  zIndex?: number;
  fullPage?: boolean; // fixed overlay over entire viewport
  /** Preset watermark styles */
  preset?: WatermarkPreset;
  /** Pattern layout */
  pattern?: WatermarkPattern;
  /** Enable interactive mode (click to toggle) */
  interactive?: boolean;
  /** Animation effect */
  animate?: boolean;
  /** Class for the overlay layer */
  overlayClassName?: string;
}

// Preset configurations
const PRESETS: Record<WatermarkPreset, { text: string; color: string; rotate: number; fontSize: number; fontWeight: string }> = {
  confidential: { text: "CONFIDENTIAL", color: "rgba(220, 38, 38, 0.15)", rotate: -22, fontSize: 16, fontWeight: "bold" },
  draft: { text: "DRAFT", color: "rgba(59, 130, 246, 0.15)", rotate: -22, fontSize: 18, fontWeight: "bold" },
  sample: { text: "SAMPLE", color: "rgba(168, 85, 247, 0.15)", rotate: -22, fontSize: 16, fontWeight: "600" },
  copyright: { text: "© Copyright", color: "rgba(0, 0, 0, 0.1)", rotate: 0, fontSize: 12, fontWeight: "normal" },
  doNotCopy: { text: "DO NOT COPY", color: "rgba(234, 88, 12, 0.15)", rotate: -22, fontSize: 14, fontWeight: "bold" },
  internal: { text: "INTERNAL USE ONLY", color: "rgba(156, 163, 175, 0.15)", rotate: -22, fontSize: 13, fontWeight: "600" },
};

function useWatermarkDataURL(opts: {
  text?: string | string[];
  image?: string;
  width?: number;
  height?: number;
  gapX?: number;
  gapY?: number;
  rotate?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  color?: string;
  gradient?: string;
  pattern?: WatermarkPattern;
}) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;

    const text = opts.text;
    const image = opts.image;
    const width = opts.width ?? 180;
    const height = opts.height ?? 100;
    const gapX = opts.gapX ?? 16;
    const gapY = opts.gapY ?? 16;
    const rotate = opts.rotate ?? -22;
    const fontSize = opts.fontSize ?? 14;
    const fontFamily = opts.fontFamily ?? "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    const fontWeight = opts.fontWeight ?? "normal";
    const fontStyle = opts.fontStyle ?? "normal";
    const color = opts.color ?? "rgba(0,0,0,0.15)";
    const gradient = opts.gradient;
    const pattern = opts.pattern ?? "diagonal";

    const tileW = width + gapX;
    const tileH = height + gapY;
    const canvas = document.createElement("canvas");
    canvas.width = tileW;
    canvas.height = tileH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawText = () => {
      ctx.clearRect(0, 0, tileW, tileH);
      ctx.save();
      ctx.translate(tileW / 2, tileH / 2);

      // Apply rotation based on pattern
      if (pattern === "diagonal") {
        ctx.rotate((rotate * Math.PI) / 180);
      } else if (pattern === "straight") {
        // No rotation
      }

      if (text) {
        const textLines = Array.isArray(text) ? text : [text];
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Use gradient if provided
        if (gradient) {
          const splitStops = (input: string) => {
            const s = input.trim();
            // Handle CSS like: linear-gradient(to bottom, rgba(...), #fff)
            let inside = s;
            const lg = s.toLowerCase();
            if (lg.startsWith("linear-gradient")) {
              const start = s.indexOf("(");
              const end = s.lastIndexOf(")");
              if (start >= 0 && end > start) inside = s.slice(start + 1, end);
            }
            const parts: string[] = [];
            let buf = "";
            let depth = 0;
            for (let i = 0; i < inside.length; i++) {
              const ch = inside[i];
              if (ch === "(") depth++;
              if (ch === ")") depth = Math.max(0, depth - 1);
              if (ch === "," && depth === 0) {
                parts.push(buf.trim());
                buf = "";
              } else {
                buf += ch;
              }
            }
            if (buf.trim()) parts.push(buf.trim());
            // If first looks like direction/angle, drop it
            if (parts.length > 0) {
              const first = parts[0].toLowerCase();
              if (first.startsWith("to ") || first.endsWith("deg") || first.endsWith("rad")) {
                parts.shift();
              }
            }
            return parts.filter(Boolean);
          };

          const stops = splitStops(gradient);
          const gradientObj = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
          stops.forEach((c, i) => {
            // Support optional "color percent" syntax
            const tokens = c.split(/\s+/).filter(Boolean);
            const col = tokens[0];
            const pos = tokens[1] ? parseFloat(tokens[1]) / 100 : i / Math.max(1, (stops.length - 1));
            try {
              gradientObj.addColorStop(isFinite(pos) ? Math.min(Math.max(pos, 0), 1) : i / Math.max(1, (stops.length - 1)), col);
            } catch {
              // Fallback: ignore invalid stop
            }
          });
          ctx.fillStyle = gradientObj;
        } else {
          ctx.fillStyle = color;
        }

        // Draw multi-line text
        const lineHeight = fontSize * 1.2;
        const totalHeight = textLines.length * lineHeight;
        const startY = -(totalHeight / 2) + lineHeight / 2;

        textLines.forEach((line, index) => {
          const y = startY + index * lineHeight;
          ctx.fillText(line, 0, y, width);
        });
      }
      ctx.restore();
      if (!cancelled) setUrl(canvas.toDataURL());
    };

    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx!.clearRect(0, 0, tileW, tileH);
        ctx!.save();
        ctx!.translate(tileW / 2, tileH / 2);
        ctx!.rotate((rotate * Math.PI) / 180);
        const drawW = width;
        const drawH = height;
        ctx!.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx!.restore();
        if (!cancelled) setUrl(canvas.toDataURL());
      };
      img.onerror = drawText;
      img.src = image;
    } else {
      drawText();
    }

    return () => {
      cancelled = true;
    };
  }, [opts.text, opts.image, opts.width, opts.height, opts.gapX, opts.gapY, opts.rotate, opts.fontSize, opts.fontFamily, opts.fontWeight, opts.fontStyle, opts.color, opts.gradient, opts.pattern]);

  return url;
}

const Watermark: React.FC<WatermarkProps> = ({
  text: textProp,
  image,
  width = 180,
  height = 100,
  gapX = 16,
  gapY = 16,
  rotate: rotateProp,
  fontSize: fontSizeProp,
  fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  fontWeight: fontWeightProp,
  fontStyle: fontStyleProp,
  color: colorProp,
  gradient,
  opacity = 1,
  offsetLeft = 0,
  offsetTop = 0,
  zIndex = 40,
  fullPage = false,
  preset,
  pattern = "diagonal",
  interactive = false,
  animate = false,
  overlayClassName,
  className,
  style,
  children,
  ...rest
}) => {
  const [visible, setVisible] = React.useState(true);

  // Apply preset if provided
  const presetConfig = preset ? PRESETS[preset] : null;
  const text = textProp ?? presetConfig?.text;
  const color = colorProp ?? presetConfig?.color ?? "rgba(0,0,0,0.15)";
  const rotate = rotateProp ?? presetConfig?.rotate ?? -22;
  const fontSize = fontSizeProp ?? presetConfig?.fontSize ?? 14;
  const fontWeight = fontWeightProp ?? presetConfig?.fontWeight ?? "normal";
  const fontStyle = fontStyleProp ?? "normal";

  const dataURL = useWatermarkDataURL({
    text,
    image,
    width,
    height,
    gapX,
    gapY,
    rotate,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    color,
    gradient,
    pattern,
  });

  const overlayStyle: React.CSSProperties = {
    position: fullPage ? ("fixed" as const) : ("absolute" as const),
    top: 0,
    left: 0,
    zIndex,
    opacity: visible ? opacity : 0,
    backgroundRepeat: "repeat",
    backgroundPosition: `${offsetLeft}px ${offsetTop}px`,
    transition: animate ? "opacity 0.3s ease" : undefined,
  };
  if (fullPage) {
    (overlayStyle as any).right = 0;
    (overlayStyle as any).bottom = 0;
  } else {
    overlayStyle.width = "100%";
    overlayStyle.height = "100%";
  }
  if (dataURL) overlayStyle.backgroundImage = `url(${dataURL})`;

  const overlay = (
    <div
      aria-hidden
      className={cn("pointer-events-none", overlayClassName)}
      style={overlayStyle}
      onClick={interactive ? () => setVisible(!visible) : undefined}
    />
  );

  if (fullPage) {
    return (
      <>
        {children}
        {typeof window !== "undefined" ? createPortal(overlay, document.body) : null}
      </>
    );
  }

  return (
    <div className={cn("relative", className)} style={style} {...rest}>
      {children}
      {overlay}
    </div>
  );
};

export default Watermark;
