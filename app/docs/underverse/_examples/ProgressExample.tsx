"use client";

import React from "react";
import { Progress } from "@/components/ui/Progress";
import CodeBlock from "../_components/CodeBlock";

export default function ProgressExample() {
  const [v, setV] = React.useState(40);
  return (
    <div className="space-y-3">
      <Progress value={v} showValue label="Tiến độ" />
      <div className="flex gap-2">
        <button className="text-sm px-2 py-1 border rounded" onClick={() => setV((x) => Math.max(0, x - 10))}>-10</button>
        <button className="text-sm px-2 py-1 border rounded" onClick={() => setV((x) => Math.min(100, x + 10))}>+10</button>
      </div>
      <CodeBlock
        code={`import { Progress } from '@underverse-ui/underverse'\n\nconst [v, setV] = useState(40)\n<Progress value={v} showValue label='Tiến độ' />`}
      />
    </div>
  );
}

