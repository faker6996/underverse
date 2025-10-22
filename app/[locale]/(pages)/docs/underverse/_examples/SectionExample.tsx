"use client";

import React from "react";
import Section from "@/components/ui/Section";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SectionExample() {
  const demo = (
    <div className="space-y-3">
      <Section variant="muted" spacing="md">
        <div className="p-3 border rounded-md">N?i dung section (muted, md)</div>
      </Section>
      <Section variant="primary" spacing="lg" fullWidth>
        <div className="container mx-auto px-4">
          <div className="p-3 border rounded-md">Full width section (primary, lg)</div>
        </div>
      </Section>
    </div>
  );

  const code =
    `import { Section } from '@underverse-ui/underverse'\n\n` +
    `<Section variant='muted' spacing='md'>\n` +
    `  <div className='p-3 border rounded-md'>N?i dung section (muted, md)</div>\n` +
    `</Section>\n` +
    `<Section variant='primary' spacing='lg' fullWidth>\n` +
    `  <div className='container mx-auto px-4'>\n` +
    `    <div className='p-3 border rounded-md'>Full width section (primary, lg)</div>\n` +
    `  </div>\n` +
    `</Section>`;

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

