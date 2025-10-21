"use client";

import React from "react";
import { Carousel } from "@/components/ui/Carousel";
import CodeBlock from "../_components/CodeBlock";

export default function CarouselExample() {
  return (
    <div className="space-y-3">
      <Carousel>
        {[1,2,3].map((i) => (
          <div key={i} className="h-32 flex items-center justify-center bg-muted rounded-md">Slide {i}</div>
        ))}
      </Carousel>
      <CodeBlock
        code={`import { Carousel } from '@underverse-ui/underverse'\n\n<Carousel>\n  <div>Slide 1</div>\n  <div>Slide 2</div>\n</Carousel>`}
      />
    </div>
  );
}

