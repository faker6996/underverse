"use client";

import React from "react";
import { Checkbox } from "@/components/ui/CheckBox";
import CodeBlock from "../_components/CodeBlock";

export default function CheckboxExample() {
  const [checked, setChecked] = React.useState(false);
  return (
    <div className="space-y-3">
      <Checkbox label="Đồng ý điều khoản" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <CodeBlock
        code={`import { Checkbox } from '@underverse-ui/underverse'\n\nconst [checked, setChecked] = useState(false)\n<Checkbox label='Đồng ý điều khoản' checked={checked} onChange={(e) => setChecked(e.target.checked)} />`}
      />
    </div>
  );
}

