"use client";

import React from "react";
import Section from "@/components/ui/Section";
import CodeBlock from "../_components/CodeBlock";

export default function SectionExample() {
  return (
    <div className="space-y-3">
      <Section variant="muted" spacing="md">
        <div className="p-3 border rounded-md">Nội dung section (muted, md)</div>
      </Section>
      <Section variant="primary" spacing="lg" fullWidth>
        <div className="container mx-auto px-4">
          <div className="p-3 border rounded-md">Full width section (primary, lg)</div>
        </div>
      </Section>
      <CodeBlock code={`<Section variant='muted' spacing='md'>...</Section>\n<Section variant='primary' spacing='lg' fullWidth>...</Section>`} />
    </div>
  );
}
