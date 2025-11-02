"use client";

import React from "react";
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

export default function SkeletonExample() {
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
          <SkeletonCard showAvatar showImage className="max-w-md" />
          <SkeletonCard showAvatar={false} showImage className="max-w-md" />
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
    `<SkeletonCard showAvatar={false} showImage />\n` +
    `<SkeletonPost />\n` +
    `<SkeletonMessage /> <SkeletonMessage own />\n` +
    `<SkeletonList items={4} />\n` +
    `<SkeletonTable rows={3} columns={4} />`;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
