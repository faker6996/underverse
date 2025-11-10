"use client";

import React from "react";
import FallingIcons from "@/components/ui/FallingIcons";
import { Leaf, Star, Heart } from "lucide-react";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function FallingIconsExample() {
  const t = useTranslations("DocsUnderverse");
  const [showFull, setShowFull] = React.useState(false);

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
    `import { Leaf } from 'lucide-react'\n` +
    `import FallingIcons from '@underverse-ui/underverse'\n\n` +
    `export default function Example() {\n` +
    `  return (\n` +
    `    <div className=\"relative h-48 bg-muted rounded\">\n` +
    `      <FallingIcons icon={Leaf} count={24} speedRange={[6,14]} sizeRange={[14,28]} horizontalDrift={24} spin pauseOnHover />\n` +
    `    </div>\n` +
    `  )\n` +
    `}\n`;

  const preview = (
    <div className="space-y-6">
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
        />
      )}

      <div className="relative h-48 rounded bg-muted">
        <FallingIcons icon={Leaf} count={24} speedRange={[6, 14]} sizeRange={[14, 28]} horizontalDrift={28} spin pauseOnHover />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative h-36 rounded bg-muted">
          <FallingIcons icon={Leaf} count={18} speedRange={[8, 16]} sizeRange={[12, 20]} horizontalDrift={20} />
        </div>
        <div className="relative h-36 rounded bg-muted">
          <FallingIcons icon={Star} count={20} colorClassName="text-warning" speedRange={[5, 10]} />
        </div>
        <div className="relative h-36 rounded bg-muted">
          <FallingIcons icon={Heart} count={16} colorClassName="text-destructive" speedRange={[7, 12]} sizeRange={[16, 26]} />
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "icon", description: t("props.fallingIcons.icon"), type: "React.ComponentType<{ className?: string }>", default: "(circle)" },
    { property: "count", description: t("props.fallingIcons.count"), type: "number", default: String(24) },
    { property: "speedRange", description: t("props.fallingIcons.speedRange"), type: "[number,number] (seconds)", default: "[6,14]" },
    { property: "sizeRange", description: t("props.fallingIcons.sizeRange"), type: "[number,number] (px)", default: "[14,28]" },
    { property: "horizontalDrift", description: t("props.fallingIcons.horizontalDrift"), type: "number (px)", default: "24" },
    { property: "spin", description: t("props.fallingIcons.spin"), type: "boolean", default: "true" },
    { property: "pauseOnHover", description: t("props.fallingIcons.pauseOnHover"), type: "boolean", default: "false" },
    { property: "areaClassName", description: t("props.fallingIcons.areaClassName"), type: "string", default: "-" },
    { property: "colorClassName", description: t("props.fallingIcons.colorClassName"), type: "string", default: "-" },
    { property: "zIndex", description: t("props.fallingIcons.zIndex"), type: "number", default: "10" },
    { property: "className", description: t("props.fallingIcons.className"), type: "string", default: "-" },
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
