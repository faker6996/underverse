"use client";

import React from "react";
import { Carousel } from "@/components/ui/Carousel";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CarouselExample() {
  const code =
    `import { Carousel } from '@underverse-ui/underverse'\n\n` +
    `// 1) Basic\n` +
    `<Carousel>\n` +
    `  {[1,2,3].map((i) => (\n` +
    `    <div key={i} className=\"h-32 flex items-center justify-center bg-muted rounded-md\">Slide {i}</div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 2) Without autoScroll\n` +
    `<Carousel autoScroll={false}>\n` +
    `  {[1,2,3,4].map((i) => (\n` +
    `    <div key={i} className=\"h-32 flex items-center justify-center bg-muted rounded-md\">No auto: {i}</div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 3) Custom interval\n` +
    `<Carousel autoScroll autoScrollInterval={2000}>\n` +
    `  {[1,2,3].map((i) => (\n` +
    `    <div key={i} className=\"h-40 flex items-center justify-center bg-accent rounded-md\">Fast {i}</div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 4) Mixed content\n` +
    `<Carousel>\n` +
    `  <div className=\"h-48 rounded-md overflow-hidden\">\n` +
    `    <img src=\"https://picsum.photos/seed/uv1/800/300\" alt=\"slide\" className=\"w-full h-full object-cover\"/>\n` +
    `  </div>\n` +
    `  <div className=\"h-48 flex items-center justify-center bg-card border border-border rounded-md\">\n` +
    `    <div className=\"text-sm\">Card content</div>\n` +
    `  </div>\n` +
    `  <div className=\"h-48 rounded-md overflow-hidden\">\n` +
    `    <img src=\"https://picsum.photos/seed/uv2/800/300\" alt=\"slide\" className=\"w-full h-full object-cover\"/>\n` +
    `  </div>\n` +
    `</Carousel>`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic */}
      <Carousel>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 flex items-center justify-center bg-muted rounded-md">Slide {i}</div>
        ))}
      </Carousel>

      {/* 2) Without autoScroll */}
      <Carousel autoScroll={false}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 flex items-center justify-center bg-muted rounded-md">No auto: {i}</div>
        ))}
      </Carousel>

      {/* 3) Custom interval */}
      <Carousel autoScroll autoScrollInterval={2000}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 flex items-center justify-center bg-accent rounded-md">Fast {i}</div>
        ))}
      </Carousel>

      {/* 4) Mixed content */}
      <Carousel>
        <div className="h-48 rounded-md overflow-hidden">
          <img src="https://picsum.photos/seed/uv1/800/300" alt="slide" className="w-full h-full object-cover" />
        </div>
        <div className="h-48 flex items-center justify-center bg-card border border-border rounded-md">
          <div className="text-sm">Card content</div>
        </div>
        <div className="h-48 rounded-md overflow-hidden">
          <img src="https://picsum.photos/seed/uv2/800/300" alt="slide" className="w-full h-full object-cover" />
        </div>
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

