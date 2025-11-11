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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Confidential</p>
            <Watermark preset="confidential">
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Top Secret Document</p>
                <p className="text-sm text-muted-foreground">Classified information</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Draft</p>
            <Watermark preset="draft">
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Draft Report</p>
                <p className="text-sm text-muted-foreground">Work in progress</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sample</p>
            <Watermark preset="sample">
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Sample Content</p>
                <p className="text-sm text-muted-foreground">For demonstration only</p>
              </div>
            </Watermark>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Do Not Copy</p>
            <Watermark preset="doNotCopy">
              <div className="p-6 rounded-lg border border-border bg-card shadow-sm h-32">
                <p className="font-medium">Protected Content</p>
                <p className="text-sm text-muted-foreground">All rights reserved</p>
              </div>
            </Watermark>
          </div>
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

      {/* Interactive Mode */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Interactive Mode</p>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click to toggle visibility</p>
          <Watermark text="CLICK ME" interactive animate color="rgba(168, 85, 247, 0.2)" fontSize={16}>
            <div className="p-6 rounded-lg border border-border bg-card shadow-sm cursor-pointer">
              <p className="font-medium">Interactive Watermark</p>
              <p className="text-sm text-muted-foreground">Click anywhere to toggle watermark visibility</p>
            </div>
          </Watermark>
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
    `// Basic usage\n` +
    `<Watermark text='UNDERVERSE' rotate={-30} opacity={0.8}>\n` +
    `  <div>Content</div>\n` +
    `</Watermark>\n\n` +
    `// Preset watermarks\n` +
    `<Watermark preset='confidential'>\n` +
    `  <div>Sensitive content</div>\n` +
    `</Watermark>\n\n` +
    `<Watermark preset='draft'>\n` +
    `  <div>Work in progress</div>\n` +
    `</Watermark>\n\n` +
    `// Pattern layouts\n` +
    `<Watermark text='GRID' pattern='grid' rotate={0}>\n` +
    `  <div>Content</div>\n` +
    `</Watermark>\n\n` +
    `// Multi-line text\n` +
    `<Watermark text={['CONFIDENTIAL', 'DO NOT SHARE']}>\n` +
    `  <div>Content</div>\n` +
    `</Watermark>\n\n` +
    `// Gradient colors\n` +
    `<Watermark\n` +
    `  text='GRADIENT'\n` +
    `  gradient='rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2)'\n` +
    `>\n` +
    `  <div>Content</div>\n` +
    `</Watermark>\n\n` +
    `// Font styles\n` +
    `<Watermark text='BOLD' fontWeight='bold' fontSize={16}>\n` +
    `  <div>Content</div>\n` +
    `</Watermark>\n\n` +
    `<Watermark text='ITALIC' fontStyle='italic'>\n` +
    `  <div>Content</div>\n` +
    `</Watermark>\n\n` +
    `// Interactive mode\n` +
    `<Watermark text='CLICK ME' interactive animate>\n` +
    `  <div>Click to toggle visibility</div>\n` +
    `</Watermark>\n\n` +
    `// Image watermark\n` +
    `<Watermark image='/logo.svg' width={120} height={40}>\n` +
    `  <div>Content</div>\n` +
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

