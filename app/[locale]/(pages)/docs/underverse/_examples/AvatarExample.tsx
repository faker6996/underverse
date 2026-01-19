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
    `// With Status Indicator\n` +
    `<Avatar size="sm" src="..." showStatus status="online" />\n` +
    `<Avatar size="md" src="..." showStatus status="busy" />\n` +
    `<Avatar size="lg" src="..." showStatus status="away" />\n` +
    `<Avatar size="md" src="..." showStatus status="offline" />\n\n` +
    `// Status - always visible (no hide on hover)\n` +
    `<Avatar size="md" src="..." showStatus status="online" hideStatusOnHover={false} />\n\n` +
    `// Interactive (with onClick)\n` +
    `<Avatar size="md" fallback="JD" onClick={() => setClicked("John")} />\n\n` +
    `// Custom Styling\n` +
    `<Avatar size="md" fallback="VIP" className="ring-2 ring-primary shadow-lg" />`;

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

      {/* With Status Indicator */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Status Indicator (hover to hide)</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <Avatar size="sm" src="https://picsum.photos/seed/status1/80" alt="Online" showStatus status="online" />
            <p className="text-xs text-muted-foreground mt-1">online</p>
          </div>
          <div className="text-center">
            <Avatar size="md" src="https://picsum.photos/seed/status2/100" alt="Busy" showStatus status="busy" />
            <p className="text-xs text-muted-foreground mt-1">busy</p>
          </div>
          <div className="text-center">
            <Avatar size="lg" src="https://picsum.photos/seed/status3/120" alt="Away" showStatus status="away" />
            <p className="text-xs text-muted-foreground mt-1">away</p>
          </div>
          <div className="text-center">
            <Avatar size="md" src="https://picsum.photos/seed/status4/100" alt="Offline" showStatus status="offline" />
            <p className="text-xs text-muted-foreground mt-1">offline</p>
          </div>
        </div>
      </div>

      {/* Status always visible */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Status always visible (hideStatusOnHover=false)</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" src="https://picsum.photos/seed/always1/100" alt="Always visible" showStatus status="online" hideStatusOnHover={false} />
          <span className="text-sm text-muted-foreground">← Hover - dot stays visible</span>
        </div>
      </div>

      {/* Fallback Demo */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Fallback with Status</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" fallback="ER" showStatus status="online" />
          <Avatar size="md" fallback="BZ" showStatus status="busy" />
          <Avatar size="md" fallback="AW" showStatus status="away" />
        </div>
      </div>

      {/* Interactive */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Interactive (with onClick)</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" fallback="JD" showStatus status="online" onClick={() => setClickedAvatar("John Doe")} />
          <Avatar size="md" src="https://picsum.photos/seed/user4/100" alt="Jane" showStatus status="busy" onClick={() => setClickedAvatar("Jane")} />
          {clickedAvatar && (
            <span className="text-sm text-muted-foreground">
              Clicked: <strong>{clickedAvatar}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Styling</p>
        <div className="flex items-center gap-4">
          <Avatar size="md" fallback="VIP" showStatus status="online" className="ring-2 ring-primary shadow-lg" />
          <Avatar size="md" src="https://picsum.photos/seed/user5/100" alt="Custom" showStatus status="online" className="border-4 border-success" />
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "src", description: t("props.avatar.src"), type: "string", default: "—" },
    { property: "alt", description: t("props.avatar.alt"), type: "string", default: "—" },
    { property: "fallback", description: t("props.avatar.fallback"), type: "string", default: "—" },
    { property: "size", description: t("props.avatar.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "showStatus", description: t("props.avatar.showStatus"), type: "boolean", default: "false" },
    { property: "status", description: t("props.avatar.status"), type: '"online" | "offline" | "busy" | "away" | "none"', default: '"online"' },
    { property: "hideStatusOnHover", description: t("props.avatar.hideStatusOnHover"), type: "boolean", default: "true" },
    { property: "className", description: t("props.avatar.className"), type: "string", default: "—" },
    { property: "onClick", description: t("props.avatar.onClick"), type: "() => void", default: "—" },
  ];
  const order = ["src", "alt", "fallback", "size", "showStatus", "status", "hideStatusOnHover", "className", "onClick"];
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
