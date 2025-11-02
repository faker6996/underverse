"use client";

import React from "react";
import RadioGroup, {
  RadioGroupItem,
  SimpleRadioGroup,
  RadioButtonGroup,
  SegmentedControl,
  ToggleGroup,
} from "@/components/ui/RadioGroup";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { Home, Settings, User } from "lucide-react";

export default function RadioGroupExample() {
  const code =
    `import RadioGroup, { RadioGroupItem, SimpleRadioGroup, RadioButtonGroup, SegmentedControl, ToggleGroup } from '@underverse-ui/underverse'\n` +
    `import { Home, Settings, User } from 'lucide-react'\n\n` +
    `// 1) Basic (vertical)\n` +
    `<RadioGroup name=\"basic\" defaultValue=\"a\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Option A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Option B\" />\n` +
    `  <RadioGroupItem value=\"c\" label=\"Option C\" />\n` +
    `</RadioGroup>\n\n` +
    `// 2) Horizontal\n` +
    `<RadioGroup name=\"horizontal\" orientation=\"horizontal\" defaultValue=\"a\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Option A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Option B\" />\n` +
    `  <RadioGroupItem value=\"c\" label=\"Option C\" />\n` +
    `</RadioGroup>\n\n` +
    `// 3) Sizes (sm, md, lg)\n` +
    `<RadioGroup name=\"sizes-sm\" size=\"sm\" defaultValue=\"a\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Small A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Small B\" />\n` +
    `</RadioGroup>\n` +
    `<RadioGroup name=\"sizes-md\" size=\"md\" defaultValue=\"a\" className=\"mt-2\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Medium A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Medium B\" />\n` +
    `</RadioGroup>\n` +
    `<RadioGroup name=\"sizes-lg\" size=\"lg\" defaultValue=\"a\" className=\"mt-2\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Large A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Large B\" />\n` +
    `</RadioGroup>\n\n` +
    `// 4) Card variant with description + icon\n` +
    `<RadioGroup name=\"card\" variant=\"card\" defaultValue=\"home\">\n` +
    `  <RadioGroupItem value=\"home\" label=\"Home\" description=\"Your personal dashboard\" icon={Home} />\n` +
    `  <RadioGroupItem value=\"settings\" label=\"Settings\" description=\"Manage your preferences\" icon={Settings} />\n` +
    `  <RadioGroupItem value=\"profile\" label=\"Profile\" description=\"Account information\" icon={User} />\n` +
    `</RadioGroup>\n\n` +
    `// 5) Disabled group\n` +
    `<RadioGroup name=\"disabled\" disabled defaultValue=\"a\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Disabled A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Disabled B\" />\n` +
    `</RadioGroup>\n\n` +
    `// 6) Error state\n` +
    `<RadioGroup name=\"error\" error errorMessage=\"Please pick one option\" defaultValue=\"\">\n` +
    `  <RadioGroupItem value=\"a\" label=\"Choice A\" />\n` +
    `  <RadioGroupItem value=\"b\" label=\"Choice B\" />\n` +
    `</RadioGroup>\n\n` +
    `// 7) SimpleRadioGroup (items prop)\n` +
    `<SimpleRadioGroup\n` +
    `  name=\"simple\"\n` +
    `  items={[\n` +
    `    { value: 'a', label: 'Simple A' },\n` +
    `    { value: 'b', label: 'Simple B' },\n` +
    `    { value: 'c', label: 'Simple C' },\n` +
    `  ]}\n` +
    `  defaultValue=\"a\"\n` +
    `/>\n\n` +
    `// 8) RadioButtonGroup (default, outline, solid)\n` +
    `<RadioButtonGroup\n` +
    `  items={[\n` +
    `    { value: 'left', label: 'Left' },\n` +
    `    { value: 'center', label: 'Center' },\n` +
    `    { value: 'right', label: 'Right' },\n` +
    `  ]}\n` +
    `  defaultValue=\"center\"\n` +
    `  variant=\"default\"\n` +
    `/>\n` +
    `<RadioButtonGroup\n` +
    `  items={[\n` +
    `    { value: 'day', label: 'Day' },\n` +
    `    { value: 'week', label: 'Week' },\n` +
    `    { value: 'month', label: 'Month' },\n` +
    `  ]}\n` +
    `  defaultValue=\"week\"\n` +
    `  variant=\"outline\"\n` +
    `/>\n` +
    `<RadioButtonGroup\n` +
    `  items={[\n` +
    `    { value: 'on', label: 'On' },\n` +
    `    { value: 'off', label: 'Off' },\n` +
    `  ]}\n` +
    `  defaultValue=\"on\"\n` +
    `  variant=\"solid\"\n` +
    `/>\n\n` +
    `// 9) SegmentedControl\n` +
    `<SegmentedControl\n` +
    `  items={[\n` +
    `    { value: 'grid', label: 'Grid' },\n` +
    `    { value: 'list', label: 'List' },\n` +
    `  ]}\n` +
    `  defaultValue=\"grid\"\n` +
    `/>\n\n` +
    `// 10) ToggleGroup (outline connected)\n` +
    `<ToggleGroup\n` +
    `  items={[\n` +
    `    { value: 'bold', label: 'Bold' },\n` +
    `    { value: 'italic', label: 'Italic' },\n` +
    `    { value: 'underline', label: 'Underline' },\n` +
    `  ]}\n` +
    `  defaultValue=\"italic\"\n` +
    `/>`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic (vertical)</p>
        <RadioGroup name="basic" defaultValue="a">
          <RadioGroupItem value="a" label="Option A" />
          <RadioGroupItem value="b" label="Option B" />
          <RadioGroupItem value="c" label="Option C" />
        </RadioGroup>
      </div>

      {/* 2) Horizontal */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Horizontal</p>
        <RadioGroup name="horizontal" orientation="horizontal" defaultValue="a">
          <RadioGroupItem value="a" label="Option A" />
          <RadioGroupItem value="b" label="Option B" />
          <RadioGroupItem value="c" label="Option C" />
        </RadioGroup>
      </div>

      {/* 3) Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-2">
          <RadioGroup name="sizes-sm" size="sm" defaultValue="a">
            <RadioGroupItem value="a" label="Small A" />
            <RadioGroupItem value="b" label="Small B" />
          </RadioGroup>
          <RadioGroup name="sizes-md" size="md" defaultValue="a">
            <RadioGroupItem value="a" label="Medium A" />
            <RadioGroupItem value="b" label="Medium B" />
          </RadioGroup>
          <RadioGroup name="sizes-lg" size="lg" defaultValue="a">
            <RadioGroupItem value="a" label="Large A" />
            <RadioGroupItem value="b" label="Large B" />
          </RadioGroup>
        </div>
      </div>

      {/* 4) Card variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Card variant (with description + icon)</p>
        <RadioGroup name="card" variant="card" defaultValue="home">
          <RadioGroupItem value="home" label="Home" description="Your personal dashboard" icon={Home} />
          <RadioGroupItem value="settings" label="Settings" description="Manage your preferences" icon={Settings} />
          <RadioGroupItem value="profile" label="Profile" description="Account information" icon={User} />
        </RadioGroup>
      </div>

      {/* 5) Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled group</p>
        <RadioGroup name="disabled" disabled defaultValue="a">
          <RadioGroupItem value="a" label="Disabled A" />
          <RadioGroupItem value="b" label="Disabled B" />
        </RadioGroup>
      </div>

      {/* 6) Error state */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Error state</p>
        <RadioGroup name="error" error errorMessage="Please pick one option" defaultValue="">
          <RadioGroupItem value="a" label="Choice A" />
          <RadioGroupItem value="b" label="Choice B" />
        </RadioGroup>
      </div>

      {/* 7) SimpleRadioGroup */}
      <div className="space-y-2">
        <p className="text-sm font-medium">SimpleRadioGroup</p>
        <SimpleRadioGroup
          name="simple"
          items={[
            { value: "a", label: "Simple A" },
            { value: "b", label: "Simple B" },
            { value: "c", label: "Simple C" },
          ]}
          defaultValue="a"
        />
      </div>

      {/* 8) RadioButtonGroup variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">RadioButtonGroup</p>
        <div className="flex flex-wrap gap-3">
          <RadioButtonGroup
            items={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
            defaultValue="center"
            variant="default"
          />
          <RadioButtonGroup
            items={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
            defaultValue="week"
            variant="outline"
          />
          <RadioButtonGroup
            items={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
            defaultValue="on"
            variant="solid"
          />
        </div>
      </div>

      {/* 9) SegmentedControl */}
      <div className="space-y-2">
        <p className="text-sm font-medium">SegmentedControl</p>
        <SegmentedControl
          items={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
          defaultValue="grid"
        />
      </div>

      {/* 10) ToggleGroup */}
      <div className="space-y-2">
        <p className="text-sm font-medium">ToggleGroup (outline connected)</p>
        <ToggleGroup
          items={[
            { value: "bold", label: "Bold" },
            { value: "italic", label: "Italic" },
            { value: "underline", label: "Underline" },
          ]}
          defaultValue="italic"
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

