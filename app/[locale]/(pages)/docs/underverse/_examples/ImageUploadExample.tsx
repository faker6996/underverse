"use client";

import React from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ImageUploadExample() {
  const code =
    `import ImageUpload from '@underverse-ui/underverse'\n\n` +
    `<ImageUpload\n` +
    `  dragDropText="Kéo & thả ảnh vào đây"\n` +
    `  browseText="Chọn ảnh"\n` +
    `  supportedFormatsText="Hỗ trợ JPG, PNG, WebP (tối đa 5MB)"\n` +
    `  maxSize={5}\n` +
    `/>`;

  const demo = (
    <div>
      <ImageUpload
        dragDropText="Kéo & thả ảnh vào đây"
        browseText="Chọn ảnh"
        supportedFormatsText="Hỗ trợ JPG, PNG, WebP (tối đa 5MB)"
        maxSize={5}
      />
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

