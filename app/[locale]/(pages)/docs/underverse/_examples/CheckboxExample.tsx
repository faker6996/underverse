"use client";

import React from "react";
import { Checkbox } from "@/components/ui/CheckBox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CheckboxExample() {
  const [checked, setChecked] = React.useState(false);

  const code =
    `import { Checkbox } from '@underverse-ui/underverse'\n\n` +
    `const [checked, setChecked] = useState(false)\n\n` +
    `<Checkbox label="Đồng ý điều khoản" checked={checked} onChange={(e) => setChecked(e.target.checked)} />`;

  const demo = (
    <div>
      <Checkbox label="Đồng ý điều khoản" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
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

