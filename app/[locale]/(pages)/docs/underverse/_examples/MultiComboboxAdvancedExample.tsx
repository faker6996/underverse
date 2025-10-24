"use client";

import React from "react";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";

// Use object options and >10 items to demonstrate conditional search + displayFormat
const ALL = [
  { value: 'react', label: 'React' },
  { value: 'next', label: 'Next.js' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'node', label: 'Node' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'vite', label: 'Vite' },
  { value: 'webpack', label: 'Webpack' },
  { value: 'esbuild', label: 'esbuild' },
  { value: 'rollup', label: 'Rollup' },
  { value: 'vitest', label: 'Vitest' },
  { value: 'jest', label: 'Jest' },
];

export default function MultiComboboxAdvancedExample() {
  const [value, setValue] = React.useState<string[]>(['react']);
  return (
    <div className="space-y-3">
      <MultiCombobox
        options={ALL}
        value={value}
        onChange={setValue}
        maxSelected={3}
        disabledOptions={["node"]}
        showClear
        showTags
        title="Tech stack"
        label="Select technologies"
        placeholder="Search technologies..."
        displayFormat={(opt) => `# ${opt.label}`}
      />
      <CodeBlock code={`<MultiCombobox options={[{value:'react',label:'React'}]} maxSelected={3} disabledOptions={['node']} showClear showTags title="Tech stack" label="Select technologies" displayFormat={(o) => '# ' + o.label} />`} />
    </div>
  );
}
