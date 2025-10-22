"use client";

import React from 'react';
import { ThemeToggle } from '@underverse-ui/underverse';
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ThemeToggleHeadlessExample() {
  const [theme, setTheme] = React.useState<'light'|'dark'|'system'>('system');

  const code =
    `import { ThemeToggle } from '@underverse-ui/underverse'\n\n` +
    `const [theme, setTheme] = useState<'light'|'dark'|'system'>('system')\n\n` +
    `<div className="flex items-center gap-3">\n` +
    `  <ThemeToggle theme={theme} onChange={setTheme} />\n` +
    `  <span className="text-sm text-muted-foreground">Current: <strong className="text-foreground">{theme}</strong></span>\n` +
    `</div>`;

  const demo = (
    <div className="flex items-center gap-3">
      <ThemeToggle theme={theme} onChange={setTheme} />
      <span className="text-sm text-muted-foreground">Current: <strong className="text-foreground">{theme}</strong></span>
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

