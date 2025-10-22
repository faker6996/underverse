"use client";

import React from "react";
import RadioGroup from "@/components/ui/RadioGroup";
import { RadioGroupItem } from "@/components/ui/RadioGroup";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function RadioGroupExample() {
  const [value, setValue] = React.useState("a");

  const code =
    `import RadioGroup, { RadioGroupItem } from '@underverse-ui/underverse'\n\n` +
    `const [value, setValue] = useState("a")\n\n` +
    `<RadioGroup name="demo" value={value} onValueChange={setValue}>\n` +
    `  <RadioGroupItem value="a" label="Option A" />\n` +
    `  <RadioGroupItem value="b" label="Option B" />\n` +
    `</RadioGroup>`;

  const demo = (
    <div>
      <RadioGroup name="demo" value={value} onValueChange={setValue}>
        <RadioGroupItem value="a" label="Option A" />
        <RadioGroupItem value="b" label="Option B" />
      </RadioGroup>
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
