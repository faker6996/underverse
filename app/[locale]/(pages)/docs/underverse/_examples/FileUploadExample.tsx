"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FileUpload from "@/components/ui/FileUpload";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function FileUploadExample() {
  const t = useTranslations("DocsUnderverse");
  const [uploadedCount, setUploadedCount] = React.useState(0);

  const code =
    `import { FileUpload } from '@underverse-ui/underverse'\n\n` +
    `// 1) Basic (default variant)\n` +
    `<FileUpload\n` +
    `  maxSize={50}\n` +
    `  maxFiles={10}\n` +
    `  onUpload={(file) => console.log('Uploaded:', file.name)}\n` +
    `/>\n\n` +
    `// 2) Compact variant\n` +
    `<FileUpload\n` +
    `  variant="compact"\n` +
    `  maxSize={25}\n` +
    `  accept=".pdf,.doc,.docx"\n` +
    `/>\n\n` +
    `// 3) Minimal variant\n` +
    `<FileUpload variant="minimal" multiple={false} />\n\n` +
    `// 4) Large size with custom text\n` +
    `<FileUpload\n` +
    `  size="lg"\n` +
    `  dragDropText="Drop your files here"\n` +
    `  browseText="Choose files"\n` +
    `  supportedFormatsText="All file types • Max 100MB"\n` +
    `  maxSize={100}\n` +
    `/>\n\n` +
    `// 5) With custom upload handler\n` +
    `<FileUpload\n` +
    `  uploadHandler={async (file) => {\n` +
    `    const formData = new FormData()\n` +
    `    formData.append('file', file)\n` +
    `    const res = await fetch('/api/upload', { method: 'POST', body: formData })\n` +
    `    return await res.json()\n` +
    `  }}\n` +
    `/>\n\n` +
    `// 6) Disabled state\n` +
    `<FileUpload disabled />`;

  const demo = (
    <div className="space-y-8">
      {/* 1) Default variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Default variant (drag & drop area)</p>
        <FileUpload maxSize={50} maxFiles={5} onUpload={() => setUploadedCount((c) => c + 1)} />
        {uploadedCount > 0 && <p className="text-xs text-muted-foreground">Files uploaded: {uploadedCount}</p>}
      </div>

      {/* 2) Compact variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Compact variant (documents only)</p>
        <FileUpload variant="compact" maxSize={25} maxFiles={3} accept=".pdf,.doc,.docx,.xls,.xlsx" />
      </div>

      {/* 3) Minimal variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Minimal variant (single file)</p>
        <FileUpload variant="minimal" multiple={false} maxFiles={1} />
      </div>

      {/* 4) Large size */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Large size with custom text</p>
        <FileUpload
          size="lg"
          dragDropText="Drop your files here"
          browseText="Choose files"
          supportedFormatsText="All file types supported • Max 100MB"
          maxSize={100}
          maxFiles={20}
        />
      </div>

      {/* 5) Small size */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Small size</p>
        <FileUpload size="sm" maxFiles={3} />
      </div>

      {/* 6) Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled state</p>
        <FileUpload disabled />
      </div>

      {/* 7) Images only */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Images only (with preview)</p>
        <FileUpload accept="image/*" allowPreview={true} maxFiles={4} />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "onUpload", description: "Callback when file is uploaded", type: "(file: UploadedFile) => void", default: "-" },
    { property: "onRemove", description: "Callback when file is removed", type: "(fileId: string | number) => void", default: "-" },
    { property: "onChange", description: "Callback when files array changes", type: "(files: UploadedFile[]) => void", default: "-" },
    {
      property: "uploadHandler",
      description: "Custom upload handler for server uploads",
      type: "(file: File) => Promise<UploadedFile>",
      default: "-",
    },
    { property: "maxSize", description: "Maximum file size in MB", type: "number", default: "50" },
    { property: "maxFiles", description: "Maximum number of files allowed", type: "number", default: "10" },
    { property: "accept", description: "Accepted file types (e.g., '.pdf,.doc' or 'image/*')", type: "string", default: "-" },
    { property: "multiple", description: "Allow multiple file selection", type: "boolean", default: "true" },
    { property: "disabled", description: "Disable the upload component", type: "boolean", default: "false" },
    { property: "className", description: "Additional CSS classes", type: "string", default: "-" },
    { property: "showFileList", description: "Show the list of uploaded files", type: "boolean", default: "true" },
    { property: "variant", description: "Layout variant", type: '"default" | "compact" | "minimal"', default: '"default"' },
    { property: "size", description: "Size variant", type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "dragDropText", description: "Custom drag & drop text", type: "string", default: "i18n" },
    { property: "browseText", description: "Custom browse button text", type: "string", default: "i18n" },
    { property: "supportedFormatsText", description: "Custom supported formats text", type: "string", default: "i18n" },
    { property: "showTypeIcons", description: "Show file type icons", type: "boolean", default: "true" },
    { property: "allowPreview", description: "Allow image preview", type: "boolean", default: "true" },
    { property: "initialFiles", description: "Initial files to display", type: "UploadedFile[]", default: "[]" },
  ];
  const order = rows.map((r) => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="FileUpload.md" />;

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
