"use client";

import React from "react";
import { Slider } from "@/components/ui/Slider";
import CodeBlock from "../_components/CodeBlock";

export default function SliderExample() {
  const [val, setVal] = React.useState(30);
  return (
    <div className="space-y-3">
      <Slider value={val} onChange={setVal} showValue label="Âm lượng" />
      <CodeBlock
        code={`import { Slider } from '@underverse-ui/underverse'\n\nconst [val, setVal] = useState(30)\n<Slider value={val} onChange={setVal} showValue label='Âm lượng' />`}
      />
    </div>
  );
}

