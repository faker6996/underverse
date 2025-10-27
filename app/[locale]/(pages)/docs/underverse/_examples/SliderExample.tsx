"use client";

import React from "react";
import { Slider } from "@/components/ui/Slider";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SliderExample() {
  const [val, setVal] = React.useState(30);

  const code =
    `import { Slider } from '@underverse-ui/underverse'\n\n` +
    `const [val, setVal] = useState(30)\n\n` +
    `<Slider value={val} onValueChange={setVal} showValue label=\"Âm lượng\" />`;

  const demo = (
    <div>
      <Slider value={val} onValueChange={setVal} showValue label="Âm lượng" />
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
