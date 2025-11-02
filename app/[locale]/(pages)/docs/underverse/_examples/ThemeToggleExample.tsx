"use client";

import React from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggleExample() {
  const { theme } = useTheme();

  const code =
    `import ThemeToggle from '@underverse-ui/underverse'\n` +
    `import { useTheme } from '@underverse-ui/underverse'\n\n` +
    `// 1) Basic\n` +
    `<ThemeToggle />\n\n` +
    `// 2) In a card with label\n` +
    `<div className='flex items-center gap-4 p-6 border rounded-lg bg-card'>\n` +
    `  <span className='text-sm'>Theme:</span>\n` +
    `  <ThemeToggle />\n` +
    `</div>\n\n` +
    `// 3) Show current theme from context\n` +
    `function CurrentTheme() {\n` +
    `  const { theme } = useTheme()\n` +
    `  return <span className='text-sm text-muted-foreground'>Current: <strong className='text-foreground'>{theme}</strong></span>\n` +
    `}\n` +
    `<div className='flex items-center gap-3'>\n` +
    `  <ThemeToggle />\n` +
    `  <CurrentTheme />\n` +
    `</div>\n\n` +
    `// 4) In header toolbar\n` +
    `<header className='flex items-center justify-between p-3 border rounded-lg bg-background'>\n` +
    `  <span className='text-sm font-medium'>Toolbar</span>\n` +
    `  <ThemeToggle />\n` +
    `</header>\n\n` +
    `// 5) Multiple toggles (works with same context)\n` +
    `<div className='flex items-center gap-2'>\n` +
    `  <ThemeToggle />\n` +
    `  <ThemeToggle />\n` +
    `</div>`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic</h3>
        <ThemeToggle />
      </div>

      {/* 2) In card with label */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">In Card</h3>
        <div className="flex items-center gap-4 p-6 border rounded-lg bg-card">
          <span className="text-sm">Theme:</span>
          <ThemeToggle />
        </div>
      </div>

      {/* 3) Show current theme */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Show Current Theme</h3>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">Current: <strong className="text-foreground">{theme}</strong></span>
        </div>
      </div>

      {/* 4) In header toolbar */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Header Toolbar</h3>
        <header className="flex items-center justify-between p-3 border rounded-lg bg-background">
          <span className="text-sm font-medium">Toolbar</span>
          <ThemeToggle />
        </header>
      </div>

      {/* 5) Multiple toggles */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Multiple Toggles</h3>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Features list */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p>Features:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Light/Dark/System options with icons</li>
          <li>Dropdown menu selection with portal</li>
          <li>Persists preference in localStorage</li>
          <li>Safe hydration (shows System icon before mount)</li>
        </ul>
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
