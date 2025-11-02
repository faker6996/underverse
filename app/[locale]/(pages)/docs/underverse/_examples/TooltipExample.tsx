"use client";

import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function TooltipExample() {
  const code =
    `import { Tooltip, Button } from '@underverse-ui/underverse'\n\n` +
    `// Basic Tooltip\n` +
    `<Tooltip content="Default tooltip">\n` +
    `  <Button variant="outline">Hover me</Button>\n` +
    `</Tooltip>\n\n` +
    `// Placements\n` +
    `<Tooltip content="Top tooltip" placement="top">\n` +
    `  <Button variant="outline">Top</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Right tooltip" placement="right">\n` +
    `  <Button variant="outline">Right</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Bottom tooltip" placement="bottom">\n` +
    `  <Button variant="outline">Bottom</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Left tooltip" placement="left">\n` +
    `  <Button variant="outline">Left</Button>\n` +
    `</Tooltip>\n\n` +
    `// Variants\n` +
    `<Tooltip content="Default variant" variant="default">\n` +
    `  <Button variant="outline">Default</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Info tooltip" variant="info">\n` +
    `  <Button variant="outline">Info</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Success tooltip" variant="success">\n` +
    `  <Button variant="outline">Success</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Warning tooltip" variant="warning">\n` +
    `  <Button variant="outline">Warning</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Error tooltip" variant="error">\n` +
    `  <Button variant="outline">Error</Button>\n` +
    `</Tooltip>\n\n` +
    `// Custom Delay\n` +
    `<Tooltip content="Fast tooltip" delay={200}>\n` +
    `  <Button variant="outline">Fast (200ms)</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Slow tooltip" delay={1500}>\n` +
    `  <Button variant="outline">Slow (1500ms)</Button>\n` +
    `</Tooltip>\n` +
    `<Tooltip content="Custom delays" delay={{ open: 500, close: 100 }}>\n` +
    `  <Button variant="outline">Custom Delays</Button>\n` +
    `</Tooltip>\n\n` +
    `// Rich Content\n` +
    `<Tooltip content={\n` +
    `  <div>\n` +
    `    <p className="font-semibold">Rich Content</p>\n` +
    `    <p className="text-xs">You can use any React component</p>\n` +
    `  </div>\n` +
    `}>\n` +
    `  <Button variant="outline">Rich Content</Button>\n` +
    `</Tooltip>\n\n` +
    `// Disabled\n` +
    `<Tooltip content="This won't show" disabled>\n` +
    `  <Button variant="outline">Disabled Tooltip</Button>\n` +
    `</Tooltip>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Tooltip */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Tooltip</p>
        <Tooltip content="Default tooltip">
          <Button variant="outline">Hover me</Button>
        </Tooltip>
      </div>

      {/* Placements */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Placements</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Top tooltip" placement="top">
            <Button variant="outline" size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" placement="right">
            <Button variant="outline" size="sm">Right</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement="bottom">
            <Button variant="outline" size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" placement="left">
            <Button variant="outline" size="sm">Left</Button>
          </Tooltip>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Default variant" variant="default">
            <Button variant="outline" size="sm">Default</Button>
          </Tooltip>
          <Tooltip content="Info tooltip" variant="info">
            <Button variant="outline" size="sm">Info</Button>
          </Tooltip>
          <Tooltip content="Success tooltip" variant="success">
            <Button variant="outline" size="sm">Success</Button>
          </Tooltip>
          <Tooltip content="Warning tooltip" variant="warning">
            <Button variant="outline" size="sm">Warning</Button>
          </Tooltip>
          <Tooltip content="Error tooltip" variant="error">
            <Button variant="outline" size="sm">Error</Button>
          </Tooltip>
        </div>
      </div>

      {/* Custom Delay */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Delay</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Fast tooltip (200ms)" delay={200}>
            <Button variant="outline" size="sm">Fast (200ms)</Button>
          </Tooltip>
          <Tooltip content="Default delay (700ms)">
            <Button variant="outline" size="sm">Default (700ms)</Button>
          </Tooltip>
          <Tooltip content="Slow tooltip (1500ms)" delay={1500}>
            <Button variant="outline" size="sm">Slow (1500ms)</Button>
          </Tooltip>
          <Tooltip content="Custom delays" delay={{ open: 500, close: 100 }}>
            <Button variant="outline" size="sm">Custom Delays</Button>
          </Tooltip>
        </div>
      </div>

      {/* Rich Content */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Rich Content</p>
        <Tooltip
          content={
            <div>
              <p className="font-semibold">Rich Content</p>
              <p className="text-xs mt-1">You can use any React component</p>
            </div>
          }
        >
          <Button variant="outline">Rich Content</Button>
        </Tooltip>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled Tooltip</p>
        <Tooltip content="This won't show" disabled>
          <Button variant="outline">Disabled Tooltip</Button>
        </Tooltip>
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

