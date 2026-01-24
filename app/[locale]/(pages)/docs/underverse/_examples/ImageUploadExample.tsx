"use client";

import React from "react";
import { useTranslations } from "next-intl";
import ImageUpload from "@/components/ui/ImageUpload";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ImageUploadExample() {
  const t = useTranslations("DocsUnderverse");
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

  const rows: PropsRow[] = [
    { property: "onUpload", description: t("props.imageUpload.onUpload"), type: "(image: UploadedImage) => void", default: "-" },
    { property: "onRemove", description: t("props.imageUpload.onRemove"), type: "(imageId: string) => void", default: "-" },
    { property: "maxSize", description: t("props.imageUpload.maxSize"), type: "number (MB)", default: "process.env.NEXT_PUBLIC_MAX_FILE_SIZE / (1024*1024)" },
    { property: "accept", description: t("props.imageUpload.accept"), type: "string", default: '"image/*"' },
    { property: "multiple", description: t("props.imageUpload.multiple"), type: "boolean", default: "false" },
    { property: "disabled", description: t("props.imageUpload.disabled"), type: "boolean", default: "false" },
    { property: "className", description: t("props.imageUpload.className"), type: "string", default: "-" },
    { property: "showPreview", description: t("props.imageUpload.showPreview"), type: "boolean", default: "true" },
    { property: "previewSize", description: t("props.imageUpload.previewSize"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "dragDropText", description: t("props.imageUpload.dragDropText"), type: "string", default: "t('OCR.imageUpload.dragDropText')" },
    { property: "browseText", description: t("props.imageUpload.browseText"), type: "string", default: "t('OCR.imageUpload.browseFiles')" },
    { property: "supportedFormatsText", description: t("props.imageUpload.supportedFormatsText"), type: "string", default: "t('OCR.imageUpload.supportedFormats')" },
  ];
  const order = rows.map(r => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="ImageUpload.md" />;

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
