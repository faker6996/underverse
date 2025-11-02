"use client";

import React from "react";
import { Checkbox } from "@/components/ui/CheckBox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CheckboxExample() {
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(false);

  const code =
    `import { Checkbox } from '@underverse-ui/underverse'\n\n` +
    `// Controlled Checkbox\n` +
    `const [checked, setChecked] = useState(false)\n` +
    `<Checkbox label="Đồng ý điều khoản" checked={checked} onChange={(e) => setChecked(e.target.checked)} />\n\n` +
    `// Uncontrolled Checkbox (with defaultChecked)\n` +
    `<Checkbox label="Remember me" defaultChecked />\n` +
    `<Checkbox label="Subscribe to newsletter" defaultChecked={false} />\n\n` +
    `// Checkbox without Label\n` +
    `<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />\n\n` +
    `// Disabled Checkbox\n` +
    `<Checkbox label="Disabled (unchecked)" disabled />\n` +
    `<Checkbox label="Disabled (checked)" checked disabled />\n\n` +
    `// Custom Styling\n` +
    `<Checkbox\n` +
    `  label="Custom styled"\n` +
    `  checked={checked}\n` +
    `  onChange={(e) => setChecked(e.target.checked)}\n` +
    `  containerClassName="p-2 rounded bg-accent/10"\n` +
    `  labelClassName="font-semibold text-primary"\n` +
    `/>`;

  const demo = (
    <div className="space-y-6">
      {/* Controlled Checkbox */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Controlled Checkbox</p>
        <div className="space-y-2">
          <Checkbox label="Đồng ý điều khoản" checked={checked1} onChange={(e) => setChecked1(e.target.checked)} />
          <p className="text-xs text-muted-foreground">Status: {checked1 ? "Checked" : "Unchecked"}</p>
        </div>
      </div>

      {/* Uncontrolled Checkbox */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Uncontrolled Checkbox (with defaultChecked)</p>
        <div className="space-y-2">
          <Checkbox label="Remember me" defaultChecked />
          <Checkbox label="Subscribe to newsletter" defaultChecked={false} />
        </div>
      </div>

      {/* Checkbox without Label */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Checkbox without Label</p>
        <Checkbox checked={checked2} onChange={(e) => setChecked2(e.target.checked)} />
      </div>

      {/* Disabled Checkbox */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled Checkbox</p>
        <div className="space-y-2">
          <Checkbox label="Disabled (unchecked)" disabled />
          <Checkbox label="Disabled (checked)" checked disabled />
        </div>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Styling</p>
        <Checkbox
          label="Custom styled"
          checked={checked3}
          onChange={(e) => setChecked3(e.target.checked)}
          containerClassName="p-2 rounded bg-accent/10 hover:bg-accent/20"
          labelClassName="font-semibold text-primary"
        />
      </div>
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

