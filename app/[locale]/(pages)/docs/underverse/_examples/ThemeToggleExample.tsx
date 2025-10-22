"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ThemeToggleExample() {
  const code =
    `import ThemeToggle from '@underverse-ui/underverse'\n\n` +
    `<ThemeToggle />`;

  const demo = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Toggle</h3>
        <p className="text-sm text-muted-foreground">
          Switch between light, dark, and system theme preferences.
        </p>
      </div>

      <div className="flex items-center gap-4 p-6 border rounded-lg bg-card">
        <span className="text-sm">Current theme toggle:</span>
        <ThemeToggle />
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p>Features:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Light mode with sun icon</li>
          <li>Dark mode with moon icon</li>
          <li>System preference with monitor icon</li>
          <li>Dropdown menu for theme selection</li>
          <li>Persists preference in localStorage</li>
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
