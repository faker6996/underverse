"use client";

import React from "react";
import Switch from "@/components/ui/Switch";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function SwitchExample() {
  const [on, setOn] = React.useState(false);

  const code =
    `import { Switch } from '@underverse-ui/underverse'\n\n` +
    `const [on, setOn] = useState(false)\n\n` +
    `<div className="flex items-center gap-3">\n` +
    `  <Switch checked={on} onCheckedChange={setOn} />\n` +
    `  <span className="text-sm">Trạng thái: {on ? "Bật" : "Tắt"}</span>\n` +
    `</div>`;

  const demo = (
    <div className="flex items-center gap-3">
      <Switch checked={on} onCheckedChange={setOn} />
      <span className="text-sm">Trạng thái: {on ? "Bật" : "Tắt"}</span>
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

