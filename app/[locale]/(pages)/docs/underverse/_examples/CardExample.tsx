"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CardExample() {
  const [clickCount, setClickCount] = React.useState(0);

  const code =
    `import { Card } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n\n` +
    `// Basic Card\n` +
    `<Card title="Card Title" description="Card description here">\n` +
    `  <p>Card content can be any React node.</p>\n` +
    `</Card>\n\n` +
    `// Card with Footer\n` +
    `<Card\n` +
    `  title="Card with Footer"\n` +
    `  description="This card has a footer section"\n` +
    `  footer={<Button size="sm">Action</Button>}\n` +
    `>\n` +
    `  <p>Main content here.</p>\n` +
    `</Card>\n\n` +
    `// Hoverable Card\n` +
    `<Card title="Hoverable" description="Hover to see effect" hoverable>\n` +
    `  <p>This card has hover animations.</p>\n` +
    `</Card>\n\n` +
    `// Clickable Card\n` +
    `const [count, setCount] = useState(0)\n` +
    `<Card\n` +
    `  title="Clickable Card"\n` +
    `  description="Click me!"\n` +
    `  clickable\n` +
    `  onClick={() => setCount(count + 1)}\n` +
    `>\n` +
    `  <p>Clicked {count} times</p>\n` +
    `</Card>\n\n` +
    `// Card without Padding\n` +
    `<Card title="No Padding" noPadding>\n` +
    `  <img src="/image.jpg" alt="Full width" className="w-full" />\n` +
    `</Card>\n\n` +
    `// Custom Styling\n` +
    `<Card\n` +
    `  title="Custom Styles"\n` +
    `  className="bg-gradient-to-br from-primary/10 to-transparent"\n` +
    `  contentClassName="text-center"\n` +
    `>\n` +
    `  <p>Centered content with gradient background</p>\n` +
    `</Card>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Card</p>
        <Card title="Card Title" description="Card description here">
          <p className="text-sm">Card content can be any React node.</p>
        </Card>
      </div>

      {/* Card with Footer */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Card with Footer</p>
        <Card
          title="Card with Footer"
          description="This card has a footer section"
          footer={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Cancel</Button>
              <Button size="sm" variant="primary">Save</Button>
            </div>
          }
        >
          <p className="text-sm">Main content here with action buttons in footer.</p>
        </Card>
      </div>

      {/* Hoverable Card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Hoverable Card</p>
        <Card title="Hoverable" description="Hover to see effect" hoverable>
          <p className="text-sm">This card has hover animations - try hovering over it!</p>
        </Card>
      </div>

      {/* Clickable Card */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Clickable Card</p>
        <Card
          title="Clickable Card"
          description="Click me!"
          clickable
          onClick={() => setClickCount(clickCount + 1)}
        >
          <p className="text-sm">Clicked <strong>{clickCount}</strong> times</p>
        </Card>
      </div>

      {/* Card without Padding */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Card without Padding (noPadding)</p>
        <Card title="No Padding for Content" noPadding>
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 text-center">
            <p className="text-sm">Content area has no default padding - useful for images or custom layouts</p>
          </div>
        </Card>
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Styling</p>
        <Card
          title="Custom Styles"
          description="With gradient background and centered content"
          className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20"
          contentClassName="text-center"
        >
          <p className="text-sm">Centered content with gradient background</p>
        </Card>
      </div>

      {/* Combined Features */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Combined Features</p>
        <Card
          title="Feature Complete"
          description="Hoverable, with footer and custom styling"
          hoverable
          footer={<Button size="sm" variant="gradient">Learn More</Button>}
          className="border-primary/30"
        >
          <p className="text-sm">This card combines multiple features: hoverable effect, footer section, and custom border color.</p>
        </Card>
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

