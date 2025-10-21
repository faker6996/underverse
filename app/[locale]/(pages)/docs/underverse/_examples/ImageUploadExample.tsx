"use client";

import React from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import CodeBlock from "../_components/CodeBlock";

export default function ImageUploadExample() {
  return (
    <div className="space-y-3">
      <ImageUpload
        dragDropText="Kéo & thả ảnh vào đây"
        browseText="Chọn ảnh"
        supportedFormatsText="Hỗ trợ JPG, PNG, WebP (tối đa 5MB)"
        maxSize={5}
      />
      <CodeBlock
        code={`import { ImageUpload } from '@underverse-ui/underverse'\n\n<ImageUpload dragDropText='Kéo & thả ảnh vào đây' browseText='Chọn ảnh' supportedFormatsText='Hỗ trợ JPG, PNG, WebP (tối đa 5MB)' maxSize={5} />`}
      />
    </div>
  );
}

