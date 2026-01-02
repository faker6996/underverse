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
            <div className="p-3 border rounded-md">Nội dung section (default, md)</div>
          </Section>
          <Section variant="muted" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (muted, md)</div>
          </Section>
          <Section variant="primary" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (primary, md)</div>
          </Section>
          <Section variant="accent" spacing="md">
            <div className="p-3 border rounded-md">Nội dung section (accent, md)</div>
          </Section>
        </div>
      </div>

      {/* Gradient Variant */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Gradient (Hero Section)</p>
        <div className="space-y-3">
          <Section variant="gradient" spacing="md">
            <div className="p-3 border rounded-md bg-background/80 backdrop-blur-sm">Gradient mặc định (primary → accent)</div>
          </Section>
          <Section variant="gradient" gradientFrom="from-purple-500/20" gradientTo="to-pink-500/20" gradientDirection="to-r" spacing="md">
            <div className="p-3 border rounded-md bg-background/80 backdrop-blur-sm">Custom gradient (purple → pink, to-r)</div>
          </Section>
          <Section variant="gradient" gradientFrom="from-blue-600/30" gradientTo="to-emerald-500/30" gradientDirection="to-br" spacing="md">
            <div className="p-3 border rounded-md bg-background/80 backdrop-blur-sm">Custom gradient (blue → emerald, to-br)</div>
          </Section>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Spacing</p>
        <Section variant="muted" spacing="sm">
          <div className="p-3 border rounded-md">Spacing sm</div>
        </Section>
        <Section variant="muted" spacing="md">
          <div className="p-3 border rounded-md">Spacing md</div>
        </Section>
        <Section variant="muted" spacing="lg">
          <div className="p-3 border rounded-md">Spacing lg</div>
        </Section>
        <Section variant="muted" spacing="xl">
          <div className="p-3 border rounded-md">Spacing xl</div>
        </Section>
      </div>

      {/* Full width */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Full width</p>
        <Section variant="primary" spacing="lg" fullWidth>
          <div className="container mx-auto px-4">
            <div className="p-3 border rounded-md">Full width section (primary, lg)</div>
          </div>
        </Section>
      </div>
    </div>
  );

  const code =
    `import { Section } from '@underverse-ui/underverse'\n\n` +
    `// Variants\n` +
    `<Section variant='default' spacing='md'>\n` +
    `  <div className='p-3 border rounded-md'>Nội dung section (default, md)</div>\n` +
    `</Section>\n` +
    `<Section variant='muted' spacing='md'>\n` +
    `  <div className='p-3 border rounded-md'>Nội dung section (muted, md)</div>\n` +
    `</Section>\n` +
    `<Section variant='primary' spacing='md'>\n` +
    `  <div className='p-3 border rounded-md'>Nội dung section (primary, md)</div>\n` +
    `</Section>\n` +
    `<Section variant='accent' spacing='md'>\n` +
    `  <div className='p-3 border rounded-md'>Nội dung section (accent, md)</div>\n` +
    `</Section>\n\n` +
    `// Gradient (Hero Section)\n` +
    `<Section variant='gradient' spacing='xl'>\n` +
    `  <h1>Hero với gradient mặc định</h1>\n` +
    `</Section>\n\n` +
    `<Section\n` +
    `  variant='gradient'\n` +
    `  gradientFrom='from-purple-500/20'\n` +
    `  gradientTo='to-pink-500/20'\n` +
    `  gradientDirection='to-r'\n` +
    `  spacing='xl'\n` +
    `>\n` +
    `  <h1>Hero với custom gradient</h1>\n` +
    `</Section>\n\n` +
    `// Spacing\n` +
    `<Section variant='muted' spacing='sm'><div className='p-3 border rounded-md'>Spacing sm</div></Section>\n` +
    `<Section variant='muted' spacing='md'><div className='p-3 border rounded-md'>Spacing md</div></Section>\n` +
    `<Section variant='muted' spacing='lg'><div className='p-3 border rounded-md'>Spacing lg</div></Section>\n` +
    `<Section variant='muted' spacing='xl'><div className='p-3 border rounded-md'>Spacing xl</div></Section>\n\n` +
    `// Full width\n` +
    `<Section variant='primary' spacing='lg' fullWidth>\n` +
    `  <div className='container mx-auto px-4'>\n` +
    `    <div className='p-3 border rounded-md'>Full width section (primary, lg)</div>\n` +
    `  </div>\n` +
    `</Section>`;

  const rows: PropsRow[] = [
    { property: "children", description: t("props.section.children"), type: "React.ReactNode", default: "-" },
    { property: "className", description: t("props.section.className"), type: "string", default: "-" },
    {
      property: "variant",
      description: t("props.section.variant"),
      type: '"default" | "muted" | "primary" | "accent" | "gradient"',
      default: '"default"',
    },
    { property: "spacing", description: t("props.section.spacing"), type: '"sm" | "md" | "lg" | "xl"', default: '"lg"' },
    { property: "fullWidth", description: t("props.section.fullWidth"), type: "boolean", default: "false" },
    { property: "outlined", description: t("props.section.outlined"), type: "boolean", default: "false" },
    { property: "gradientFrom", description: t("props.section.gradientFrom"), type: "string", default: '"from-primary/20"' },
    { property: "gradientTo", description: t("props.section.gradientTo"), type: "string", default: '"to-accent/20"' },
    {
      property: "gradientDirection",
      description: t("props.section.gradientDirection"),
      type: '"to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl"',
      default: '"to-br"',
    },
  ];
  const order = ["children", "className", "variant", "spacing", "fullWidth", "outlined", "gradientFrom", "gradientTo", "gradientDirection"];
  const docs = <PropsDocsTable rows={rows} order={order} />;

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
