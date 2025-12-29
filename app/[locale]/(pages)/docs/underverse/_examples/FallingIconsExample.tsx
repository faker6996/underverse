"use client";

import React from "react";
import FallingIcons from "@/components/ui/FallingIcons";
import { Leaf, Star } from "lucide-react";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function FallingIconsExample() {
  const t = useTranslations("DocsUnderverse");
  const [showFull, setShowFull] = React.useState(false);

  // Interactive demo controls
  const [demoActive, setDemoActive] = React.useState(true);
  const [windDirection, setWindDirection] = React.useState(0);
  const [windStrength, setWindStrength] = React.useState(0.5);
  const [gravity, setGravity] = React.useState(1);
  const [glowEnabled, setGlowEnabled] = React.useState(false);
  const [trailEnabled, setTrailEnabled] = React.useState(false);
  const [customImageUrl, setCustomImageUrl] = React.useState<string>("");
  const [imagePreview, setImagePreview] = React.useState<string>("");

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear custom image
  const clearImage = () => {
    setCustomImageUrl("");
    setImagePreview("");
  };

  // Auto-play full-screen effect when landing via #falling-icons
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const playIfHash = () => {
      if (window.location.hash === '#falling-icons') {
        setShowFull(true); // keep running continuously when at this anchor
      }
    };
    playIfHash();
    window.addEventListener('hashchange', playIfHash);
    return () => window.removeEventListener('hashchange', playIfHash);
  }, []);

  const code =
    `import { Star } from 'lucide-react'\n` +
    `import FallingIcons from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `export default function Example() {\n` +
    `  const [active, setActive] = useState(true)\n` +
    `  const [windDir, setWindDir] = useState(0)\n` +
    `  const [windStr, setWindStr] = useState(0.5)\n` +
    `  const [grav, setGrav] = useState(1)\n` +
    `  const [glow, setGlow] = useState(false)\n` +
    `  const [trail, setTrail] = useState(false)\n\n` +
    `  return (\n` +
    `    <div className="space-y-4">\n` +
    `      {/* Demo Area */}\n` +
    `      <div className="relative h-64 rounded-lg bg-linear-to-b from-slate-900 to-slate-800">\n` +
    `        {active && (\n` +
    `          <FallingIcons\n` +
    `            icon={Star}\n` +
    `            count={25}\n` +
    `            physics={{ gravity: grav, windDirection: windDir, windStrength: windStr, rotation: true }}\n` +
    `            glow={glow}\n` +
    `            glowColor="#fbbf24"\n` +
    `            glowIntensity={0.8}\n` +
    `            trail={trail}\n` +
    `            trailLength={3}\n` +
    `            colorClassName="text-warning"\n` +
    `            easingFunction="ease-in-out"\n` +
    `          />\n` +
    `        )}\n` +
    `      </div>\n\n` +
    `      {/* Controls */}\n` +
    `      <button onClick={() => setActive(!active)}>\n` +
    `        {active ? 'Pause' : 'Start'}\n` +
    `      </button>\n` +
    `      <input type="range" min="-1" max="1" step="0.1" value={windDir} onChange={(e) => setWindDir(+e.target.value)} />\n` +
    `      <input type="range" min="0" max="1" step="0.1" value={windStr} onChange={(e) => setWindStr(+e.target.value)} />\n` +
    `      <input type="range" min="0.5" max="2" step="0.1" value={grav} onChange={(e) => setGrav(+e.target.value)} />\n` +
    `      <button onClick={() => setGlow(!glow)}>Glow {glow ? 'ON' : 'OFF'}</button>\n` +
    `      <button onClick={() => setTrail(!trail)}>Trail {trail ? 'ON' : 'OFF'}</button>\n` +
    `    </div>\n` +
    `  )\n` +
    `}\n`;

  const preview = (
    <div className="space-y-8">
      {showFull && (
        <FallingIcons
          fullScreen
          icon={Leaf}
          count={60}
          speedRange={[6, 12]}
          sizeRange={[16, 32]}
          horizontalDrift={32}
          colorClassName="text-warning"
          zIndex={2000}
          glow
          glowIntensity={0.6}
        />
      )}

      {/* Interactive Demo */}
      <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interactive Demo</h3>
          <button
            onClick={() => setDemoActive(!demoActive)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {demoActive ? "Pause" : "Start"}
          </button>
        </div>

        {/* Demo Area */}
        <div className="relative h-64 rounded-lg bg-linear-to-b from-slate-900 to-slate-800 overflow-hidden">
          {demoActive && (
            <FallingIcons
              icon={customImageUrl ? undefined : Star}
              imageUrl={customImageUrl || undefined}
              count={25}
              speedRange={[5, 10]}
              sizeRange={[16, 28]}
              physics={{
                gravity,
                windDirection,
                windStrength,
                rotation: true,
              }}
              glow={glowEnabled}
              glowColor="#fbbf24"
              glowIntensity={0.8}
              trail={trailEnabled}
              trailLength={3}
              colorClassName="text-warning"
              easingFunction="ease-in-out"
            />
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wind Direction */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Wind Direction</span>
              <span className="text-xs text-muted-foreground">
                {windDirection > 0 ? "→ Right" : windDirection < 0 ? "← Left" : "↓ None"}
              </span>
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={windDirection}
              onChange={(e) => setWindDirection(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Left</span>
              <span>{windDirection.toFixed(1)}</span>
              <span>Right</span>
            </div>
          </div>

          {/* Wind Strength */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Wind Strength</span>
              <span className="text-xs text-muted-foreground">{windStrength.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={windStrength}
              onChange={(e) => setWindStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0</span>
              <span>1.0</span>
            </div>
          </div>

          {/* Gravity */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Gravity</span>
              <span className="text-xs text-muted-foreground">{gravity.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span>Heavy</span>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Effects</label>
            <div className="flex gap-3">
              <button
                onClick={() => setGlowEnabled(!glowEnabled)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  glowEnabled
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Glow {glowEnabled ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => setTrailEnabled(!trailEnabled)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  trailEnabled
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Trail {trailEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Custom Image</label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <>
                  <div className="flex items-center gap-2">
                    <img src={imagePreview} alt="Preview" className="w-8 h-8 object-cover rounded border border-border" />
                    <span className="text-xs text-muted-foreground">Image loaded</span>
                  </div>
                  <button
                    onClick={clearImage}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setWindDirection(0);
            setWindStrength(0.5);
            setGravity(1);
            setGlowEnabled(false);
            setTrailEnabled(false);
            clearImage();
          }}
          className="w-full px-4 py-2 rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          Reset to Default
        </button>
      </div>

    </div>
  );

  const rows: PropsRow[] = [
    { property: "icon", description: t("props.fallingIcons.icon"), type: "React.ComponentType<{ className?: string }>", default: "(circle)" },
    { property: "imageUrl", description: "Custom image URL to use instead of icon", type: "string", default: "-" },
    { property: "count", description: t("props.fallingIcons.count"), type: "number", default: String(24) },
    { property: "speedRange", description: t("props.fallingIcons.speedRange"), type: "[number,number] (seconds)", default: "[6,14]" },
    { property: "sizeRange", description: t("props.fallingIcons.sizeRange"), type: "[number,number] (px)", default: "[14,28]" },
    { property: "horizontalDrift", description: t("props.fallingIcons.horizontalDrift"), type: "number (px)", default: "24" },
    { property: "spin", description: t("props.fallingIcons.spin"), type: "boolean", default: "true" },
    { property: "areaClassName", description: t("props.fallingIcons.areaClassName"), type: "string", default: "-" },
    { property: "colorClassName", description: t("props.fallingIcons.colorClassName"), type: "string", default: "-" },
    { property: "zIndex", description: t("props.fallingIcons.zIndex"), type: "number", default: "10" },
    { property: "className", description: t("props.fallingIcons.className"), type: "string", default: "-" },
    { property: "glow", description: "Add glow/shadow effect to particles", type: "boolean", default: "false" },
    { property: "glowColor", description: "Custom glow color (CSS color)", type: "string", default: "currentColor" },
    { property: "glowIntensity", description: "Glow intensity from 0 to 1", type: "number", default: "0.5" },
    { property: "trail", description: "Add particle trail effect", type: "boolean", default: "false" },
    { property: "trailLength", description: "Number of trail particles (1-5)", type: "number", default: "3" },
    { property: "physics", description: "Physics-based animation settings", type: "object", default: "-" },
    { property: "physics.gravity", description: "Gravity multiplier (0.5-2)", type: "number", default: "1" },
    { property: "physics.windDirection", description: "Wind direction (-1 left to 1 right)", type: "number", default: "0" },
    { property: "physics.windStrength", description: "Wind strength (0-1)", type: "number", default: "0" },
    { property: "physics.rotation", description: "Physics-based rotation animation", type: "boolean", default: "false" },
    { property: "easingFunction", description: "Animation easing function", type: "'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic'", default: "linear" },
  ];
  const order = rows.map(r => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} />;

  return (
    <Tabs
      variant="underline"
      size="sm"
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{preview}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
    />
  );
}
