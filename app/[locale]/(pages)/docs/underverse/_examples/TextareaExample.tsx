"use client";

import React from "react";
import Textarea from "@/components/ui/Textarea";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function TextareaExample() {
  const [value1, setValue1] = React.useState("");
  const [value2, setValue2] = React.useState("");
  const [value3, setValue3] = React.useState("This textarea has an error");

  const code =
    `import { Textarea } from '@underverse-ui/underverse'\n\n` +
    `// Variants\n` +
    `<Textarea label="Default variant" variant="default" placeholder="Default style..." />\n` +
    `<Textarea label="Filled variant" variant="filled" placeholder="Filled style..." />\n` +
    `<Textarea label="Outlined variant" variant="outlined" placeholder="Outlined style..." />\n\n` +
    `// Sizes\n` +
    `<Textarea label="Small" size="sm" placeholder="Small textarea..." />\n` +
    `<Textarea label="Medium" size="md" placeholder="Medium textarea..." />\n` +
    `<Textarea label="Large" size="lg" placeholder="Large textarea..." />\n\n` +
    `// With Error\n` +
    `<Textarea label="Comment" error="This field is required" value={value} onChange={(e) => setValue(e.target.value)} />\n\n` +
    `// With Description\n` +
    `<Textarea label="Bio" description="Tell us about yourself (max 500 characters)" maxLength={500} />\n\n` +
    `// Required Field\n` +
    `<Textarea label="Required field" required placeholder="This field is required..." />\n\n` +
    `// Disabled\n` +
    `<Textarea label="Disabled" disabled value="This textarea is disabled" />`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <Textarea label="Default variant" variant="default" placeholder="Default style..." />
          <Textarea label="Filled variant" variant="filled" placeholder="Filled style..." />
          <Textarea label="Outlined variant" variant="outlined" placeholder="Outlined style..." />
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-3">
          <Textarea label="Small" size="sm" placeholder="Small textarea..." />
          <Textarea label="Medium" size="md" placeholder="Medium textarea..." />
          <Textarea label="Large" size="lg" placeholder="Large textarea..." />
        </div>
      </div>

      {/* With Error */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Error</p>
        <Textarea
          label="Comment"
          error="This field is required"
          value={value3}
          onChange={(e) => setValue3(e.target.value)}
          placeholder="Enter your comment..."
        />
      </div>

      {/* With Description */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Description</p>
        <Textarea
          label="Bio"
          description="Tell us about yourself (max 500 characters)"
          maxLength={500}
          placeholder="Write your bio..."
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
        />
      </div>

      {/* Required Field */}
      <div className="space-y-2">
        <Textarea label="Required field" required placeholder="This field is required..." />
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <Textarea label="Disabled" disabled value="This textarea is disabled" />
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

