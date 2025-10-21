"use client";

import React from "react";
import Switch from "@/components/ui/Switch";
import CodeBlock from "../_components/CodeBlock";

export default function SwitchExample() {
  const [on, setOn] = React.useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch checked={on} onCheckedChange={setOn} />
        <span className="text-sm">Trạng thái: {on ? "Bật" : "Tắt"}</span>
      </div>
      <CodeBlock
        code={`import { Switch } from '@underverse-ui/underverse'\n\nconst [on, setOn] = useState(false)\n<Switch checked={on} onCheckedChange={setOn} />`}
      />
    </div>
  );
}

