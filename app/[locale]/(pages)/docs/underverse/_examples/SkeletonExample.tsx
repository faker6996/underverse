"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Skeleton, {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  SkeletonCard,
  SkeletonPost,
  SkeletonMessage,
  SkeletonList,
  SkeletonTable,
} from "@/components/ui/Skeleton";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function SkeletonExample() {
  const t = useTranslations("DocsUnderverse");
  const demo = (
    <div className="space-y-8">
      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Variants</p>
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" className="w-24 h-10" />
          <Skeleton variant="rounded" className="w-24 h-10" />
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" lines={3} />
          </div>
        </div>
      </div>

      {/* Animations */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Animations</p>
        <div className="flex items-center gap-4">
          <Skeleton animation="pulse" className="w-32 h-6" />
          <Skeleton animation="wave" className="w-32 h-6" />
          <Skeleton animation="none" className="w-32 h-6" />
        </div>
      </div>

      {/* Prebuilt: Avatar, Button, Text */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Prebuilt</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <SkeletonAvatar size="sm" />
            <SkeletonAvatar size="md" />
            <SkeletonAvatar size="lg" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonButton size="sm" />
            <SkeletonButton size="md" />
            <SkeletonButton size="lg" />
          </div>
          <div className="w-56">
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>

      {/* Card layout */}
      <div className="space-y-3">
        <p className="text-sm font-medium">SkeletonCard</p>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Default layout */}
          <SkeletonCard showAvatar showImage className="max-w-md" />
          {/* Custom children layout */}
          <SkeletonCard className="max-w-md">
            <Skeleton className="h-6 w-32 mb-4" />
            <SkeletonTable rows={6} columns={6} />
          </SkeletonCard>
        </div>
      </div>

      {/* Complex layouts */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Complex Layouts</p>
        <div className="grid gap-4">
          <SkeletonPost />
          <div className="flex items-center justify-between">
            <SkeletonMessage />
            <SkeletonMessage own />
          </div>
          <SkeletonList items={4} />
          <SkeletonTable rows={3} columns={4} />
        </div>
      </div>
    </div>
  );

  const code =
    `import Skeleton, { SkeletonAvatar, SkeletonButton, SkeletonText, SkeletonCard, SkeletonPost, SkeletonMessage, SkeletonList, SkeletonTable } from '@underverse-ui/underverse'\n\n` +
    `// Variants\n` +
    `<Skeleton variant='rectangular' className='w-24 h-10'/>\n` +
    `<Skeleton variant='rounded' className='w-24 h-10'/>\n` +
    `<Skeleton variant='circular' className='w-10 h-10'/>\n` +
    `<Skeleton variant='text' lines={3} />\n\n` +
    `// Animations\n` +
    `<Skeleton animation='pulse' className='w-32 h-6'/>\n` +
    `<Skeleton animation='wave' className='w-32 h-6'/>\n` +
    `<Skeleton animation='none' className='w-32 h-6'/>\n\n` +
    `// Prebuilt\n` +
    `<SkeletonAvatar size='sm'/> <SkeletonAvatar size='md'/> <SkeletonAvatar size='lg'/>\n` +
    `<SkeletonButton size='sm'/> <SkeletonButton size='md'/> <SkeletonButton size='lg'/>\n` +
    `<SkeletonText lines={3}/>\n\n` +
    `// Layouts\n` +
    `<SkeletonCard showAvatar showImage />\n` +
    `<SkeletonCard>\n` +
    `  <Skeleton className='h-6 w-32 mb-4' />\n` +
    `  <SkeletonTable rows={6} columns={6} />\n` +
    `</SkeletonCard>\n` +
    `<SkeletonPost />\n` +
    `<SkeletonMessage /> <SkeletonMessage own />\n` +
    `<SkeletonList items={4} />\n` +
    `<SkeletonTable rows={3} columns={4} />`;

  const rows: PropsRow[] = [
    // Skeleton (base)
    { property: "className", description: t("props.skeleton.className"), type: "string", default: "-" },
    { property: "width", description: t("props.skeleton.width"), type: "string | number", default: "-" },
    { property: "height", description: t("props.skeleton.height"), type: "string | number", default: "-" },
    { property: "variant", description: t("props.skeleton.variant"), type: '"rectangular" | "circular" | "rounded" | "text"', default: '"rectangular"' },
    { property: "animation", description: t("props.skeleton.animation"), type: '"pulse" | "wave" | "none"', default: '"pulse"' },
    { property: "lines", description: t("props.skeleton.lines"), type: "number", default: "1" },

    // SkeletonAvatar
    { property: "SkeletonAvatar.size", description: t("props.skeleton.SkeletonAvatar.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "SkeletonAvatar.className", description: t("props.skeleton.SkeletonAvatar.className"), type: "string", default: "-" },

    // SkeletonButton
    { property: "SkeletonButton.size", description: t("props.skeleton.SkeletonButton.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "SkeletonButton.className", description: t("props.skeleton.SkeletonButton.className"), type: "string", default: "-" },

    // SkeletonText
    { property: "SkeletonText.lines", description: t("props.skeleton.SkeletonText.lines"), type: "number", default: "3" },
    { property: "SkeletonText.className", description: t("props.skeleton.SkeletonText.className"), type: "string", default: "-" },
    { property: "SkeletonText.width", description: t("props.skeleton.SkeletonText.width"), type: "string", default: '"100%"' },

    // SkeletonCard
    { property: "SkeletonCard.showAvatar", description: t("props.skeleton.SkeletonCard.showAvatar"), type: "boolean", default: "true" },
    { property: "SkeletonCard.showImage", description: t("props.skeleton.SkeletonCard.showImage"), type: "boolean", default: "false" },
    { property: "SkeletonCard.textLines", description: t("props.skeleton.SkeletonCard.textLines"), type: "number", default: "3" },
    { property: "SkeletonCard.className", description: t("props.skeleton.SkeletonCard.className"), type: "string", default: "-" },

    // SkeletonPost
    { property: "SkeletonPost.className", description: t("props.skeleton.SkeletonPost.className"), type: "string", default: "-" },

    // SkeletonMessage
    { property: "SkeletonMessage.own", description: t("props.skeleton.SkeletonMessage.own"), type: "boolean", default: "false" },
    { property: "SkeletonMessage.showAvatar", description: t("props.skeleton.SkeletonMessage.showAvatar"), type: "boolean", default: "true" },
    { property: "SkeletonMessage.className", description: t("props.skeleton.SkeletonMessage.className"), type: "string", default: "-" },

    // SkeletonList
    { property: "SkeletonList.items", description: t("props.skeleton.SkeletonList.items"), type: "number", default: "5" },
    { property: "SkeletonList.itemHeight", description: t("props.skeleton.SkeletonList.itemHeight"), type: "number", default: "60" },
    { property: "SkeletonList.showAvatar", description: t("props.skeleton.SkeletonList.showAvatar"), type: "boolean", default: "true" },
    { property: "SkeletonList.className", description: t("props.skeleton.SkeletonList.className"), type: "string", default: "-" },

    // SkeletonTable
    { property: "SkeletonTable.rows", description: t("props.skeleton.SkeletonTable.rows"), type: "number", default: "5" },
    { property: "SkeletonTable.columns", description: t("props.skeleton.SkeletonTable.columns"), type: "number", default: "4" },
    { property: "SkeletonTable.className", description: t("props.skeleton.SkeletonTable.className"), type: "string", default: "-" },
  ];

  const order = [
    // Base first
    "className","width","height","variant","animation","lines",
    // Groups by component
    "SkeletonAvatar.size","SkeletonAvatar.className",
    "SkeletonButton.size","SkeletonButton.className",
    "SkeletonText.lines","SkeletonText.className","SkeletonText.width",
    "SkeletonCard.showAvatar","SkeletonCard.showImage","SkeletonCard.textLines","SkeletonCard.className",
    "SkeletonPost.className",
    "SkeletonMessage.own","SkeletonMessage.showAvatar","SkeletonMessage.className",
    "SkeletonList.items","SkeletonList.itemHeight","SkeletonList.showAvatar","SkeletonList.className",
    "SkeletonTable.rows","SkeletonTable.columns","SkeletonTable.className",
  ];

  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Skeleton.md" />;

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
