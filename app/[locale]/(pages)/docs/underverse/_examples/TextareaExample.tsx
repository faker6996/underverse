"use client";

import React from "react";
import Textarea from "@/components/ui/Textarea";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function TextareaExample() {
  const [value, setValue] = React.useState("");

  const code =
    `import { Textarea } from '@underverse-ui/underverse'\n\n` +
    `const [value, setValue] = useState("")\n\n` +
    `<Textarea label="Mô tả" placeholder="Nhập mô tả..." value={value} onChange={(e) => setValue(e.target.value)} />`;

  const demo = (
    <div>
      <Textarea label="Mô tả" placeholder="Nhập mô tả..." value={value} onChange={(e) => setValue(e.target.value)} />
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

