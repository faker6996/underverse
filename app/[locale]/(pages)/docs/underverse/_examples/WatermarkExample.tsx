"use client";

import * as React from "react";
import Watermark from "@/components/ui/Watermark";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function WatermarkExample() {
  const t = useTranslations("DocsUnderverse");

  const demo = (
    <div className="space-y-8">
      {/* Presets */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Preset Watermarks</p>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Confidential</p>
          <Watermark preset="confidential">
            <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
              <p className="font-medium">Top Secret Document</p>
              <p className="text-sm text-muted-foreground">Classified information</p>
            </div>
          </Watermark>
        </div>
      </div>

      {/* Patterns */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Pattern Layouts</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Diagonal (default)</p>
            <Watermark text="UNDERVERSE" pattern="diagonal">
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Diagonal Pattern</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Grid</p>
            <Watermark text="GRID" pattern="grid" rotate={0}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Grid Pattern</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Straight</p>
            <Watermark text="STRAIGHT" pattern="straight" rotate={0}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Straight Pattern</p>
              </div>
            </Watermark>
          </div>
        </div>
      </div>

      {/* Multi-line Text */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Multi-line Text</p>
        <Watermark text={["CONFIDENTIAL", "DO NOT SHARE"]} color="rgba(220, 38, 38, 0.15)" fontSize={14}>
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <p className="font-medium">Multi-line Watermark</p>
            <p className="text-sm text-muted-foreground">Two lines of text for extra emphasis</p>
          </div>
        </Watermark>
      </div>

      {/* Gradient Colors */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Gradient Colors</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Blue to Purple Gradient</p>
            <Watermark text="GRADIENT" gradient="rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2)" fontSize={18}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Gradient Watermark</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Rainbow Gradient</p>
            <Watermark text="RAINBOW" gradient="rgba(239, 68, 68, 0.2), rgba(234, 179, 8, 0.2), rgba(34, 197, 94, 0.2)" fontSize={18}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Rainbow Effect</p>
              </div>
            </Watermark>
          </div>
        </div>
      </div>

      {/* Font Styles */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Font Styles</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Bold Text</p>
            <Watermark text="BOLD" fontWeight="bold" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Bold Watermark</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Italic Text</p>
            <Watermark text="ITALIC" fontStyle="italic" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Italic Watermark</p>
              </div>
            </Watermark>
          </div>
        </div>
      </div>

      {/* Interactive Mode with Animation Variants */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Interactive Mode & Animations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Fade Animation (Click to toggle)</p>
            <Watermark text="FADE" interactive animate animationVariant="fade" color="rgba(168, 85, 247, 0.2)" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Fade Effect</p>
                <p className="text-sm text-muted-foreground">Click to toggle</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Scale Animation (Click to toggle)</p>
            <Watermark text="SCALE" interactive animate animationVariant="scale" color="rgba(59, 130, 246, 0.2)" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Scale Effect</p>
                <p className="text-sm text-muted-foreground">Click to toggle</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Pulse Animation</p>
            <Watermark text="PULSE" animate animationVariant="pulse" color="rgba(34, 197, 94, 0.2)" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Pulse Effect</p>
                <p className="text-sm text-muted-foreground">Continuous pulse</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Slide Animation (Click to toggle)</p>
            <Watermark text="SLIDE" interactive animate animationVariant="slide" color="rgba(234, 88, 12, 0.2)" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Slide Effect</p>
                <p className="text-sm text-muted-foreground">Click to toggle</p>
              </div>
            </Watermark>
          </div>
        </div>
      </div>

      {/* Advanced Effects */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Advanced Effects</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Backdrop Blur</p>
            <Watermark text="BLUR" blur blurAmount={8} color="rgba(168, 85, 247, 0.3)" fontSize={18}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Blurred Background</p>
                <p className="text-sm text-muted-foreground">Subtle blur effect</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Text Shadow/Glow</p>
            <Watermark text="GLOW" textShadow shadowColor="rgba(59, 130, 246, 0.8)" color="rgba(59, 130, 246, 0.4)" fontSize={18} fontWeight="bold">
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Glowing Text</p>
                <p className="text-sm text-muted-foreground">Enhanced shadow</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Dark Mode Auto-Adjust</p>
            <Watermark text="DARK MODE" darkMode color="rgba(168, 85, 247, 0.2)" fontSize={16}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Theme Aware</p>
                <p className="text-sm text-muted-foreground">Adjusts opacity automatically</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Combined Effects</p>
            <Watermark
              text="PREMIUM"
              blur
              textShadow
              darkMode
              animate
              animationVariant="pulse"
              gradient="rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3)"
              fontSize={20}
              fontWeight="bold"
            >
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">All Features</p>
                <p className="text-sm text-muted-foreground">Blur + Shadow + Dark Mode</p>
              </div>
            </Watermark>
          </div>
        </div>
      </div>

      {/* Image Watermark */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Image Watermark</p>
        <Watermark image="/next.svg" width={120} height={40} gapX={48} gapY={48} opacity={0.7}>
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <p className="font-medium">Logo Watermark</p>
            <p className="text-sm text-muted-foreground">Using image as repeating pattern</p>
          </div>
        </Watermark>
      </div>

      {/* Custom Spacing */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Custom Spacing</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Dense (small gaps)</p>
            <Watermark text="DENSE" gapX={8} gapY={8} fontSize={12}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Dense Pattern</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sparse (large gaps)</p>
            <Watermark text="SPARSE" gapX={80} gapY={80} fontSize={18}>
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Sparse Pattern</p>
              </div>
            </Watermark>
          </div>
        </div>
      </div>

      {/* Full Page */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Full Page Overlay</p>
        <div className="text-xs text-muted-foreground">Note: Full page watermark is rendered in a portal (not shown in preview)</div>
      </div>
    </div>
  );

  const code =
    `import { Watermark } from '@underverse-ui/underverse'\n\n` +
    `// Preset watermarks\n` +
    `<Watermark preset='confidential'>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Top Secret Document</p>\n` +
    `    <p className="text-sm text-muted-foreground">Classified information</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Pattern layouts\n` +
    `<Watermark text='UNDERVERSE' pattern='diagonal'>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Diagonal Pattern</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark text='GRID' pattern='grid' rotate={0}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Grid Pattern</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark text='STRAIGHT' pattern='straight' rotate={0}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Straight Pattern</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Multi-line text\n` +
    `<Watermark\n` +
    `  text={['CONFIDENTIAL', 'DO NOT SHARE']}\n` +
    `  color='rgba(220, 38, 38, 0.15)'\n` +
    `  fontSize={14}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm">\n` +
    `    <p className="font-medium">Multi-line Watermark</p>\n` +
    `    <p className="text-sm text-muted-foreground">Two lines of text for extra emphasis</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Gradient colors\n` +
    `<Watermark\n` +
    `  text='GRADIENT'\n` +
    `  gradient='rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2)'\n` +
    `  fontSize={18}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Gradient Watermark</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark\n` +
    `  text='RAINBOW'\n` +
    `  gradient='rgba(239, 68, 68, 0.2), rgba(234, 179, 8, 0.2), rgba(34, 197, 94, 0.2)'\n` +
    `  fontSize={18}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Rainbow Effect</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Font styles\n` +
    `<Watermark text='BOLD' fontWeight='bold' fontSize={16}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Bold Watermark</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark text='ITALIC' fontStyle='italic' fontSize={16}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Italic Watermark</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Interactive mode with animation variants\n` +
    `<Watermark\n` +
    `  text='FADE'\n` +
    `  interactive\n` +
    `  animate\n` +
    `  animationVariant='fade'\n` +
    `  color='rgba(168, 85, 247, 0.2)'\n` +
    `  fontSize={16}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Fade Effect</p>\n` +
    `    <p className="text-sm text-muted-foreground">Click to toggle</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark\n` +
    `  text='SCALE'\n` +
    `  interactive\n` +
    `  animate\n` +
    `  animationVariant='scale'\n` +
    `  color='rgba(59, 130, 246, 0.2)'\n` +
    `  fontSize={16}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Scale Effect</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark\n` +
    `  text='PULSE'\n` +
    `  animate\n` +
    `  animationVariant='pulse'\n` +
    `  color='rgba(34, 197, 94, 0.2)'\n` +
    `  fontSize={16}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Pulse Effect</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Advanced effects\n` +
    `<Watermark text='BLUR' blur blurAmount={8} color='rgba(168, 85, 247, 0.3)' fontSize={18}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Blurred Background</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark\n` +
    `  text='GLOW'\n` +
    `  textShadow\n` +
    `  shadowColor='rgba(59, 130, 246, 0.8)'\n` +
    `  color='rgba(59, 130, 246, 0.4)'\n` +
    `  fontSize={18}\n` +
    `  fontWeight='bold'\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Glowing Text</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark text='DARK MODE' darkMode color='rgba(168, 85, 247, 0.2)' fontSize={16}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Theme Aware</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Combined effects\n` +
    `<Watermark\n` +
    `  text='PREMIUM'\n` +
    `  blur\n` +
    `  textShadow\n` +
    `  darkMode\n` +
    `  animate\n` +
    `  animationVariant='pulse'\n` +
    `  gradient='rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3)'\n` +
    `  fontSize={20}\n` +
    `  fontWeight='bold'\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">All Features</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Image watermark\n` +
    `<Watermark\n` +
    `  image='/next.svg'\n` +
    `  width={120}\n` +
    `  height={40}\n` +
    `  gapX={48}\n` +
    `  gapY={48}\n` +
    `  opacity={0.7}\n` +
    `>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm">\n` +
    `    <p className="font-medium">Logo Watermark</p>\n` +
    `    <p className="text-sm text-muted-foreground">Using image as repeating pattern</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Custom spacing\n` +
    `<Watermark text='DENSE' gapX={8} gapY={8} fontSize={12}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Dense Pattern</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `<Watermark text='SPARSE' gapX={80} gapY={80} fontSize={18}>\n` +
    `  <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">\n` +
    `    <p className="font-medium">Sparse Pattern</p>\n` +
    `  </div>\n` +
    `</Watermark>\n\n` +
    `// Full page overlay\n` +
    `<Watermark text='CONFIDENTIAL' fullPage />`;

  const rows: PropsRow[] = [
    { property: "text", description: t("props.watermark.text"), type: "string | string[]", default: "-" },
    { property: "image", description: t("props.watermark.image"), type: "string", default: "-" },
    { property: "preset", description: t("props.watermark.preset"), type: "'confidential' | 'draft' | 'sample' | 'copyright' | 'doNotCopy' | 'internal'", default: "-" },
    { property: "pattern", description: t("props.watermark.pattern"), type: "'diagonal' | 'grid' | 'straight'", default: "'diagonal'" },
    { property: "width", description: t("props.watermark.width"), type: "number", default: "180" },
    { property: "height", description: t("props.watermark.height"), type: "number", default: "100" },
    { property: "gapX", description: t("props.watermark.gapX"), type: "number", default: "16" },
    { property: "gapY", description: t("props.watermark.gapY"), type: "number", default: "16" },
    { property: "rotate", description: t("props.watermark.rotate"), type: "number", default: "-22" },
    { property: "fontSize", description: t("props.watermark.fontSize"), type: "number", default: "14" },
    { property: "fontFamily", description: t("props.watermark.fontFamily"), type: "string", default: "system" },
    { property: "fontWeight", description: t("props.watermark.fontWeight"), type: "number | string", default: "'normal'" },
    { property: "fontStyle", description: t("props.watermark.fontStyle"), type: "'normal' | 'italic'", default: "'normal'" },
    { property: "color", description: t("props.watermark.color"), type: "string", default: "'rgba(0,0,0,0.15)'" },
    { property: "gradient", description: t("props.watermark.gradient"), type: "string", default: "-" },
    { property: "opacity", description: t("props.watermark.opacity"), type: "number", default: "1" },
    { property: "offsetLeft", description: t("props.watermark.offsetLeft"), type: "number", default: "0" },
    { property: "offsetTop", description: t("props.watermark.offsetTop"), type: "number", default: "0" },
    { property: "zIndex", description: t("props.watermark.zIndex"), type: "number", default: "40" },
    { property: "fullPage", description: t("props.watermark.fullPage"), type: "boolean", default: "false" },
    { property: "interactive", description: t("props.watermark.interactive"), type: "boolean", default: "false" },
    { property: "animate", description: t("props.watermark.animate"), type: "boolean", default: "false" },
    { property: "animationVariant", description: "Animation variant type", type: "'fade' | 'slide' | 'scale' | 'pulse' | 'none'", default: "'fade'" },
    { property: "blur", description: "Enable backdrop blur effect", type: "boolean", default: "false" },
    { property: "blurAmount", description: "Blur amount in pixels", type: "number", default: "4" },
    { property: "textShadow", description: "Enable text shadow effect", type: "boolean", default: "false" },
    { property: "shadowColor", description: "Text shadow color", type: "string", default: "-" },
    { property: "darkMode", description: "Auto-adjust opacity for dark mode", type: "boolean", default: "false" },
    { property: "ariaLabel", description: "ARIA label for accessibility", type: "string", default: "-" },
    { property: "overlayClassName", description: t("props.watermark.overlayClassName"), type: "string", default: "-" },
    { property: "className", description: t("props.watermark.className"), type: "string", default: "-" },
  ];
  const docs = <PropsDocsTable rows={rows} />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

