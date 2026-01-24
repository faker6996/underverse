"use client";

import React from "react";
import { useTranslations } from "next-intl";
import ColorPicker from "@/components/ui/ColorPicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ColorPickerExample() {
  const t = useTranslations("DocsUnderverse");
  const [color, setColor] = React.useState<string>("#22c55e");
  const [colorHsl, setColorHsl] = React.useState<string>("hsl(280, 82%, 59%)");

  const demo = (
    <div className="space-y-8">
      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Variants</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Default</p>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Full (with labels)</p>
            <ColorPicker variant="full" copyable clearable />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Compact</p>
            <ColorPicker variant="compact" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Minimal</p>
            <ColorPicker variant="minimal" copyable />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Sizes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Small</p>
            <ColorPicker size="sm" defaultValue="#ef4444" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Medium (default)</p>
            <ColorPicker size="md" defaultValue="#3b82f6" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Large</p>
            <ColorPicker size="lg" defaultValue="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* Alpha Channel */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Alpha Channel</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">RGBA Format</p>
            <ColorPicker withAlpha format="rgba" defaultValue="rgba(236, 72, 153, 0.8)" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">HSLA Format</p>
            <ColorPicker withAlpha format="hsla" value={colorHsl} onChange={setColorHsl} />
          </div>
        </div>
      </div>

      {/* Color Formats */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Color Formats</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">HEX</p>
            <ColorPicker format="hex" defaultValue="#f59e0b" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">RGB</p>
            <ColorPicker format="rgba" defaultValue="rgb(16, 185, 129)" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">HSL</p>
            <ColorPicker format="hsl" defaultValue="hsl(217, 91%, 60%)" />
          </div>
        </div>
      </div>

      {/* Recent Colors */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Recent Colors History</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Pick multiple colors to see recent history</p>
          <ColorPicker showRecent maxRecent={8} copyable />
        </div>
      </div>

      {/* Color Harmony */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Color Harmony Suggestions</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Get complementary, triadic, and analogous colors</p>
          <ColorPicker showHarmony variant="full" defaultValue="#ec4899" copyable />
        </div>
      </div>

      {/* Full Featured */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Full Featured Example</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">All features enabled</p>
          <ColorPicker
            variant="full"
            size="lg"
            withAlpha
            format="rgba"
            showRecent
            showHarmony
            copyable
            clearable
            defaultValue="#6366f1"
          />
        </div>
      </div>

      {/* Custom Presets */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Custom Color Presets</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Brand colors palette</p>
          <ColorPicker
            presets={[
              "#1e40af",
              "#3b82f6",
              "#60a5fa",
              "#93c5fd",
              "#dbeafe",
              "#ef4444",
              "#f97316",
              "#eab308",
              "#22c55e",
              "#06b6d4",
              "#8b5cf6",
              "#ec4899",
            ]}
          />
        </div>
      </div>
    </div>
  );

  const code =
    `import { ColorPicker } from '@underverse-ui/underverse'\n\n` +
    `// Basic usage\n` +
    `const [color, setColor] = useState('#22c55e')\n` +
    `<ColorPicker value={color} onChange={setColor} />\n\n` +
    `// Variants\n` +
    `<ColorPicker variant="full" copyable clearable />\n` +
    `<ColorPicker variant="compact" />\n` +
    `<ColorPicker variant="minimal" copyable />\n\n` +
    `// Sizes\n` +
    `<ColorPicker size="sm" />\n` +
    `<ColorPicker size="md" />\n` +
    `<ColorPicker size="lg" />\n\n` +
    `// With alpha channel and different formats\n` +
    `<ColorPicker withAlpha format="rgba" />\n` +
    `<ColorPicker withAlpha format="hsla" />\n` +
    `<ColorPicker format="hsl" />\n\n` +
    `// Recent colors history\n` +
    `<ColorPicker showRecent maxRecent={8} />\n\n` +
    `// Color harmony suggestions\n` +
    `<ColorPicker showHarmony variant="full" />\n\n` +
    `// Full featured\n` +
    `<ColorPicker\n` +
    `  variant="full"\n` +
    `  size="lg"\n` +
    `  withAlpha\n` +
    `  format="rgba"\n` +
    `  showRecent\n` +
    `  showHarmony\n` +
    `  copyable\n` +
    `  clearable\n` +
    `/>\n\n` +
    `// Custom presets\n` +
    `<ColorPicker\n` +
    `  presets={[\n` +
    `    '#1e40af', '#3b82f6', '#60a5fa',\n` +
    `    '#ef4444', '#f97316', '#22c55e'\n` +
    `  ]}\n` +
    `/>`;

  const rows: PropsRow[] = [
    { property: "value", description: t("props.colorPicker.value"), type: "string", default: "-" },
    { property: "defaultValue", description: t("props.colorPicker.defaultValue"), type: "string", default: "#4f46e5" },
    { property: "onChange", description: t("props.colorPicker.onChange"), type: "(value: string) => void", default: "-" },
    { property: "disabled", description: t("props.colorPicker.disabled"), type: "boolean", default: "false" },
    { property: "withAlpha", description: t("props.colorPicker.withAlpha"), type: "boolean", default: "false" },
    { property: "format", description: t("props.colorPicker.format"), type: "'hex' | 'rgba' | 'hsl' | 'hsla'", default: "'hex'" },
    { property: "presets", description: t("props.colorPicker.presets"), type: "string[]", default: "DEFAULT_PRESETS" },
    { property: "clearable", description: t("props.colorPicker.clearable"), type: "boolean", default: "false" },
    { property: "copyable", description: "Show copy to clipboard button", type: "boolean", default: "true" },
    { property: "size", description: "Size variant of the picker", type: "'sm' | 'md' | 'lg'", default: "'md'" },
    { property: "variant", description: "Visual variant of the picker", type: "'default' | 'compact' | 'full' | 'minimal'", default: "'default'" },
    { property: "showRecent", description: "Show recent colors history", type: "boolean", default: "false" },
    { property: "showHarmony", description: "Show color harmony suggestions", type: "boolean", default: "false" },
    { property: "maxRecent", description: "Max recent colors to remember", type: "number", default: "8" },
    { property: "className", description: t("props.colorPicker.className"), type: "string", default: "-" },
    { property: "triggerClassName", description: "Class for the trigger button", type: "string", default: "-" },
    { property: "contentClassName", description: "Class for the popover content", type: "string", default: "-" },
  ];
  const order = [
    "value",
    "defaultValue",
    "onChange",
    "disabled",
    "withAlpha",
    "format",
    "size",
    "variant",
    "presets",
    "showRecent",
    "showHarmony",
    "maxRecent",
    "copyable",
    "clearable",
    "className",
    "triggerClassName",
    "contentClassName",
  ];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="ColorPicker.md" />;

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
