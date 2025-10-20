"use client";

import React from "react";
import Textarea from "@/components/ui/Textarea";
import CodeBlock from "../_components/CodeBlock";

export default function TextareaExample() {
  const [value, setValue] = React.useState("");
  return (
    <div className="space-y-3">
      <Textarea label="Mô tả" placeholder="Nhập mô tả..." value={value} onChange={(e) => setValue(e.target.value)} />
      <CodeBlock
        code={`import { Textarea } from '@underverse-ui/underverse'\n\nconst [value, setValue] = useState('')\n<Textarea label='Mô tả' placeholder='Nhập mô tả...' value={value} onChange={(e)=>setValue(e.target.value)} />`}
      />
    </div>
  );
}

