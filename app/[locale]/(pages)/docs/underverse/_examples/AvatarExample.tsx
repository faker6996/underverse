"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Avatar from "@/components/ui/Avatar";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function AvatarExample() {
  const t = useTranslations("DocsUnderverse");
  const [clickedAvatar, setClickedAvatar] = React.useState<string>("");

  const code =
    `import { Avatar } from '@underverse-ui/underverse'\n\n` +
    `// Sizes\n` +
    `<Avatar size="sm" fallback="AB" />\n` +
    `<Avatar size="md" fallback="CD" />\n` +
    `<Avatar size="lg" fallback="EF" />\n\n` +
    `// With Images\n` +
    `<Avatar size="sm" src="https://picsum.photos/seed/user1/80" alt="User 1" />\n` +
    `<Avatar size="md" src="https://picsum.photos/seed/user2/100" alt="User 2" />\n` +
    `<Avatar size="lg" src="https://picsum.photos/seed/user3/120" alt="User 3" />\n\n` +
    `// Fallback with Image Error\n` +
    `<Avatar size="md" src="invalid-url.jpg" fallback="ER" alt="Error Demo" />\n\n` +
    `// Interactive (with onClick)\n` +
    `const [clicked, setClicked] = useState("")\n` +
    `<Avatar size="md" fallback="JD" onClick={() => setClicked("John Doe")} />\n` +
    `<Avatar size="md" src="https://picsum.photos/seed/user4/100" alt="Jane" onClick={() => setClicked("Jane")} />\n\n` +
    `// Custom Styling\n` +
    `<Avatar size="md" fallback="VIP" className="ring-2 ring-primary shadow-lg" />\n` +
    `<Avatar size="md" src="https://picsum.photos/seed/user5/100" alt="Custom" className="border-4 border-success" />`;

  const demo = (
    <div className="space-y-6">
      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="flex items-center gap-4">
          <Avatar size="sm" fallback="AB" />
          <Avatar size="md" fallback="CD" />
          <Avatar size="lg" fallback="EF" />
        </div>
      </div>

      {/* With Images */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Images</p>
        <div className="flex items-center gap-4">
          <Avatar size="sm" src="https://picsum.photos/seed/user1/80" alt="User 1" />
          <Avatar size="md" src="https://picsum.photos/seed/user2/100" alt="User 2" />
          <Avatar size="lg" src="https://picsum.photos/seed/user3/120" alt="User 3" />
        </div>
      </div>

      {/* Fallback with Image Error */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Fallback (Image Error Handling)</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" src="invalid-url.jpg" fallback="ER" alt="Error Demo" />
          <span className="text-sm text-muted-foreground">← Shows fallback when image fails to load</span>
        </div>
      </div>

      {/* Interactive */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Interactive (with onClick)</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" fallback="JD" onClick={() => setClickedAvatar("John Doe")} />
          <Avatar size="md" src="https://picsum.photos/seed/user4/100" alt="Jane" onClick={() => setClickedAvatar("Jane")} />
          {clickedAvatar && <span className="text-sm text-muted-foreground">Clicked: <strong>{clickedAvatar}</strong></span>}
        </div>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Styling</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" fallback="VIP" className="ring-2 ring-primary shadow-lg" />
          <Avatar size="md" src="https://picsum.photos/seed/user5/100" alt="Custom" className="border-4 border-success" />
        </div>
      </div>
    </div>
  );

  // Document tab (props) — placeholder rows; fill later
  const rows: PropsRow[] = [
    { property: "src", description: t("props.avatar.src"), type: "string", default: "—" },
    { property: "alt", description: t("props.avatar.alt"), type: "string", default: "—" },
    { property: "fallback", description: t("props.avatar.fallback"), type: "string", default: "—" },
    { property: "size", description: t("props.avatar.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "className", description: t("props.avatar.className"), type: "string", default: "—" },
    { property: "onClick", description: t("props.avatar.onClick"), type: "() => void", default: "—" },
  ];
  const order = ["src", "alt", "fallback", "size", "className", "onClick"];
  const docs = <PropsDocsTable rows={rows} order={order} />;

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

