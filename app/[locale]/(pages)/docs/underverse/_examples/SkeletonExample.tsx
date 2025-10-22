"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SkeletonExample() {
  const demo = (
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  );

  const code =
    `import { Skeleton } from '@underverse-ui/underverse'\n\n` +
    `<div className='flex items-center gap-3'>\n` +
    `  <Skeleton variant='circular' className='w-10 h-10'/>\n` +
    `  <div className='flex-1 space-y-2'>\n` +
    `    <Skeleton variant='text' lines={2} />\n` +
    `  </div>\n` +
    `</div>`;

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

