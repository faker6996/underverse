"use client";

import React from "react";
import RadioGroup from "@/components/ui/RadioGroup";
import { RadioGroupItem } from "@/components/ui/RadioGroup";
import CodeBlock from "../_components/CodeBlock";

export default function RadioGroupExample() {
  const [value, setValue] = React.useState("a");
  return (
    <div className="space-y-3">
      <RadioGroup name="demo" value={value} onValueChange={setValue}>
        <RadioGroupItem value="a" label="Option A" />
        <RadioGroupItem value="b" label="Option B" />
      </RadioGroup>
      <CodeBlock
        code={`import { RadioGroup } from '@underverse-ui/underverse'\n\nconst [value, setValue] = useState('a')\n<RadioGroup name='demo' value={value} onChange={setValue} options={[{label:'Option A', value:'a'}, {label:'Option B', value:'b'}]} />`}
      />
    </div>
  );
}
