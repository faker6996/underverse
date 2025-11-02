"use client";

import React from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ImageUploadExample() {
  const [lastUploaded, setLastUploaded] = React.useState<string>("");

  const code =
    `import ImageUpload from '@underverse-ui/underverse'\n\n` +
    `// 1) Basic (5MB max, custom texts)\n` +
    `<ImageUpload\n` +
    `  dragDropText='Kéo & thả ảnh vào đây'\n` +
    `  browseText='Chọn ảnh'\n` +
    `  supportedFormatsText='Hỗ trợ JPG, PNG, WebP (tối đa 5MB)'\n` +
    `  maxSize={5}\n` +
    `/>\n\n` +
    `// 2) Multiple, custom accept, showPreview lg\n` +
    `<ImageUpload multiple accept='image/png,image/jpeg' previewSize='lg' />\n\n` +
    `// 3) Small trigger, no preview list\n` +
    `<ImageUpload previewSize='sm' showPreview={false} />\n\n` +
    `// 4) Disabled\n` +
    `<ImageUpload disabled />\n\n` +
    `// 5) With callbacks\n` +
    `<ImageUpload onUpload={(img) => console.log('Uploaded:', img.originalName)} />`;

  const demo = (
    <div className="space-y-8">
      {/* 1) Basic */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic (5MB max, custom texts)</p>
        <ImageUpload
          dragDropText="Kéo & thả ảnh vào đây"
          browseText="Chọn ảnh"
          supportedFormatsText="Hỗ trợ JPG, PNG, WebP (tối đa 5MB)"
          maxSize={5}
          onUpload={(img) => setLastUploaded(img.originalName)}
        />
        {lastUploaded && (
          <p className="text-xs text-muted-foreground">Last uploaded: {lastUploaded}</p>
        )}
      </div>

      {/* 2) Multiple */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Multiple, custom accept, large preview</p>
        <ImageUpload multiple accept="image/png,image/jpeg" previewSize="lg" />
      </div>

      {/* 3) No preview list */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Small trigger, no preview list</p>
        <ImageUpload previewSize="sm" showPreview={false} />
      </div>

      {/* 4) Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <ImageUpload disabled />
      </div>
    </div>
  );

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

