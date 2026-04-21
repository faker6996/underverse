"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Section from "@/components/ui/Section";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function SectionExample() {
  const t = useTranslations("DocsUnderverse");
  const demo = (
    <div className="space-y-8">
      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <Section variant="default" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (default)</div>
          </Section>
          <Section variant="muted" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (muted)</div>
          </Section>
          <Section variant="primary" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (primary)</div>
          </Section>
          <Section variant="accent" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (accent)</div>
          </Section>
        </div>
      </div>

      {/* Gradient Variant */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Gradient (Hero Section)</p>
        <div className="space-y-3">
          <Section variant="gradient" spacing="md" paddingX="md">
            <div className="p-3 border rounded-md bg-background/80 backdrop-blur-sm">Gradient mặc định</div>
          </Section>
          <Section
            variant="gradient"
            gradientFrom="oklch(0.7 0.2 300 / 20%)"
            gradientTo="oklch(0.7 0.2 0 / 20%)"
            gradientDirection="to-r"
            spacing="md"
            paddingX="md"
          >
            <div className="p-3 border rounded-md bg-background/80 backdrop-blur-sm">Custom gradient (purple → pink, to-r)</div>
          </Section>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Spacing (vertical padding)</p>
        <Section variant="muted" spacing="none">
          <div className="p-3 border rounded-md">spacing: none (default)</div>
        </Section>
        <Section variant="muted" spacing="sm">
          <div className="p-3 border rounded-md">spacing: sm</div>
        </Section>
        <Section variant="muted" spacing="md">
          <div className="p-3 border rounded-md">spacing: md</div>
        </Section>
        <Section variant="muted" spacing="lg">
          <div className="p-3 border rounded-md">spacing: lg</div>
        </Section>
      </div>

      {/* Horizontal Padding */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Horizontal Padding (paddingX)</p>
        <Section variant="muted" spacing="sm" paddingX="none">
          <div className="p-3 border rounded-md">paddingX: none (default)</div>
        </Section>
        <Section variant="muted" spacing="sm" paddingX="sm">
          <div className="p-3 border rounded-md">paddingX: sm — px-3 md:px-4</div>
        </Section>
        <Section variant="muted" spacing="sm" paddingX="md">
          <div className="p-3 border rounded-md">paddingX: md — px-4 md:px-6</div>
        </Section>
        <Section variant="muted" spacing="sm" paddingX="lg">
          <div className="p-3 border rounded-md">paddingX: lg — px-5 md:px-8</div>
        </Section>
      </div>

      {/* Contained */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Contained (background full-width, content max-width)</p>
        <Section variant="primary" spacing="md" contained paddingX="md">
          <div className="p-3 border rounded-md">
            Background phủ full-width, inner div có container mx-auto + paddingX
          </div>
        </Section>
      </div>

      {/* as prop */}
      <div className="space-y-3">
        <p className="text-sm font-medium">as prop (đổi tag HTML)</p>
        <Section as="div" variant="muted" spacing="sm" paddingX="md">
          <div className="p-3 border rounded-md">Render như &lt;div&gt; thay vì &lt;section&gt;</div>
        </Section>
        <Section as="article" variant="accent" spacing="sm" paddingX="md">
          <div className="p-3 border rounded-md">Render như &lt;article&gt;</div>
        </Section>
      </div>
    </div>
  );

  const code =
    `import { Section } from '@underverse-ui/underverse'\n\n` +
    `// Variants\n` +
    `<Section variant='muted' spacing='md'>\n` +
    `  Nội dung section\n` +
    `</Section>\n\n` +
    `// Gradient – dùng CSS color value\n` +
    `<Section\n` +
    `  variant='gradient'\n` +
    `  gradientFrom='oklch(0.7 0.2 300 / 20%)'\n` +
    `  gradientTo='oklch(0.7 0.2 0 / 20%)'\n` +
    `  gradientDirection='to-r'\n` +
    `  spacing='xl'\n` +
    `  paddingX='md'\n` +
    `>\n` +
    `  <h1>Hero với custom gradient</h1>\n` +
    `</Section>\n\n` +
    `// Contained: background full-width, content có container mx-auto\n` +
    `<Section variant='primary' spacing='md' contained paddingX='md'>\n` +
    `  Nội dung bên trong có max-width tự động\n` +
    `</Section>\n\n` +
    `// containerClassName: custom inner container\n` +
    `<Section contained containerClassName='max-w-3xl mx-auto px-6'>\n` +
    `  Nội dung hẹp hơn\n` +
    `</Section>\n\n` +
    `// as prop: đổi HTML tag\n` +
    `<Section as='div' variant='muted' spacing='sm'>...</Section>\n` +
    `<Section as='article' variant='accent' spacing='md'>...</Section>`;

  const rows: PropsRow[] = [
    { property: "children", description: t("props.section.children"), type: "React.ReactNode", default: "-" },
    { property: "className", description: t("props.section.className"), type: "string", default: "-" },
    { property: "as", description: "Override HTML tag", type: "React.ElementType", default: '"section"' },
    {
      property: "variant",
      description: t("props.section.variant"),
      type: '"default" | "muted" | "primary" | "accent" | "gradient"',
      default: '"default"',
    },
    { property: "spacing", description: t("props.section.spacing"), type: '"none" | "sm" | "md" | "lg" | "xl"', default: '"none"' },
    { property: "paddingX", description: t("props.section.paddingX"), type: '"none" | "sm" | "md" | "lg" | "xl"', default: '"none"' },
    { property: "contained", description: "Background full-width, inner div có container mx-auto", type: "boolean", default: "false" },
    { property: "containerClassName", description: "Custom className cho inner container khi contained=true", type: "string", default: "-" },
    { property: "outlined", description: t("props.section.outlined"), type: "boolean", default: "false" },
    { property: "gradientFrom", description: "CSS color value cho gradient start", type: "string", default: '"oklch(0.7 0.15 280 / 20%)"' },
    { property: "gradientTo", description: "CSS color value cho gradient end", type: "string", default: '"oklch(0.7 0.2 200 / 20%)"' },
    {
      property: "gradientDirection",
      description: t("props.section.gradientDirection"),
      type: '"to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl"',
      default: '"to-br"',
    },
  ];
  const order = [
    "children", "className", "as", "variant", "spacing", "paddingX",
    "contained", "containerClassName", "outlined",
    "gradientFrom", "gradientTo", "gradientDirection",
  ];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Section.md" />;

  return (
    <Tabs id="section-tabs"
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
