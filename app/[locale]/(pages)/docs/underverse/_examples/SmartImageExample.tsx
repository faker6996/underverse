"use client";

import React from "react";
import SmartImage from "@/components/ui/SmartImage";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SmartImageExample() {
  const demo = (
    <div className="space-y-6">
      {/* 1) Fill + aspect ratio */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Fill + aspect ratio</p>
        <div className="w-72 rounded-md overflow-hidden">
          <SmartImage src="https://picsum.photos/seed/uv123/600/400" alt="Demo cover" fill ratioClass="aspect-[4/3]" className="object-cover" />
        </div>
      </div>

      {/* 2) Fixed size (no fill) + contain */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Fixed size (contain)</p>
        <div className="w-72 h-44 rounded-md overflow-hidden">
          <SmartImage src="https://picsum.photos/seed/uv456/400/300" alt="Contain" fill={false} width={300} height={180} className="bg-muted" fit="contain" />
        </div>
      </div>

      {/* 3) Rounded variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Rounded</p>
        <div className="w-24">
          <SmartImage src="https://picsum.photos/seed/uv789/200/200" alt="Rounded" fill ratioClass="aspect-square" roundedClass="rounded-full" className="object-cover" />
        </div>
      </div>

      {/* 4) Priority + quality */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Priority + quality</p>
        <div className="w-72 rounded-md overflow-hidden">
          <SmartImage src="https://picsum.photos/seed/uvprio/800/480" alt="Priority" fill ratioClass="aspect-[16/9]" priority quality={90} />
        </div>
      </div>

      {/* 5) Fallback on error */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Fallback on error</p>
        <div className="w-40 rounded-md overflow-hidden">
          <SmartImage src="/images/does-not-exist.jpg" alt="Fallback" fill ratioClass="aspect-square" />
        </div>
      </div>

      {/* 6) Local product path auto .jpg → .png */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Local product path auto-fix (.jpg → .png)</p>
        <div className="w-40 rounded-md overflow-hidden">
          <SmartImage src="/images/products/sample.jpg" alt="Auto-fix" fill ratioClass="aspect-square" />
        </div>
      </div>
    </div>
  );

  const code =
    `import { SmartImage } from '@underverse-ui/underverse'\n\n` +
    `// 1) Fill + aspect ratio\n` +
    `<div className='w-72 rounded-md overflow-hidden'>\n` +
    `  <SmartImage src='https://picsum.photos/seed/uv123/600/400' alt='Demo cover' fill ratioClass='aspect-[4/3]' className='object-cover'/>\n` +
    `</div>\n\n` +
    `// 2) Fixed size (no fill) + contain\n` +
    `<div className='w-72 h-44 rounded-md overflow-hidden'>\n` +
    `  <SmartImage src='https://picsum.photos/seed/uv456/400/300' alt='Contain' fill={false} width={300} height={180} className='bg-muted' fit='contain'/>\n` +
    `</div>\n\n` +
    `// 3) Rounded\n` +
    `<div className='w-24'>\n` +
    `  <SmartImage src='https://picsum.photos/seed/uv789/200/200' alt='Rounded' fill ratioClass='aspect-square' roundedClass='rounded-full' className='object-cover'/>\n` +
    `</div>\n\n` +
    `// 4) Priority + quality\n` +
    `<div className='w-72 rounded-md overflow-hidden'>\n` +
    `  <SmartImage src='https://picsum.photos/seed/uvprio/800/480' alt='Priority' fill ratioClass='aspect-[16/9]' priority quality={90}/>\n` +
    `</div>\n\n` +
    `// 5) Fallback on error\n` +
    `<div className='w-40 rounded-md overflow-hidden'>\n` +
    `  <SmartImage src='/images/does-not-exist.jpg' alt='Fallback' fill ratioClass='aspect-square'/>\n` +
    `</div>\n\n` +
    `// 6) Local product path auto-convert .jpg -> .png\n` +
    `<div className='w-40 rounded-md overflow-hidden'>\n` +
    `  <SmartImage src='/images/products/sample.jpg' alt='Auto-fix' fill ratioClass='aspect-square'/>\n` +
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
