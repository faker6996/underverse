"use client";

import React from "react";
import { Carousel } from "@/components/ui/Carousel";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CarouselExample() {
  const code =
    `import { Carousel } from '@underverse-ui/underverse'\n\n` +
    `<Carousel>\n` +
    `  {[1,2,3].map((i) => (\n` +
    `    <div key={i} className="h-32 flex items-center justify-center bg-muted rounded-md">Slide {i}</div>\n` +
    `  ))}\n` +
    `</Carousel>`;

  const demo = (
    <div>
      <Carousel>
        {[1,2,3].map((i) => (
          <div key={i} className="h-32 flex items-center justify-center bg-muted rounded-md">Slide {i}</div>
        ))}
      </Carousel>
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

