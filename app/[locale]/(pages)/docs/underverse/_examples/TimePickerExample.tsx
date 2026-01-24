"use client";

import React from "react";
import TimePicker from "@/components/ui/TimePicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function TimePickerExample() {
  const t = useTranslations("DocsUnderverse");
  const [time24, setTime24] = React.useState<string | undefined>("14:30");
  const [time12, setTime12] = React.useState<string | undefined>("02:30 PM");
  const [validatedTime, setValidatedTime] = React.useState<string | undefined>();
  const [error, setError] = React.useState<string>("");

  const handleValidatedTimeChange = (time: string | undefined) => {
    setValidatedTime(time);
    if (time) {
      const hour = parseInt(time.split(":")[0]);
      if (hour < 9 || hour >= 18) {
        setError("Please select a time between 9 AM and 6 PM");
      } else {
        setError("");
      }
    }
  };

  const demo = (
    <div className="space-y-8">
      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Variants</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Default</p>
            <TimePicker value={time24} onChange={setTime24} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Compact</p>
            <TimePicker variant="compact" />
          </div>
        </div>
      </div>

      {/* Inline Variant */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Inline Variant</p>
        <div className="max-w-sm">
          <TimePicker variant="inline" label="Select Time" showNow showPresets />
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Sizes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Small</p>
            <TimePicker size="sm" defaultValue="09:00" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Medium (default)</p>
            <TimePicker size="md" defaultValue="12:00" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Large</p>
            <TimePicker size="lg" defaultValue="18:00" />
          </div>
        </div>
      </div>

      {/* Time Formats */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Time Formats</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">24-hour format</p>
            <TimePicker format="24" defaultValue="14:30" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">12-hour format with AM/PM</p>
            <TimePicker format="12" value={time12} onChange={setTime12} />
          </div>
        </div>
      </div>

      {/* With Seconds */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Seconds</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">24-hour with seconds</p>
            <TimePicker format="24" includeSeconds secondStep={10} defaultValue="14:30:45" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">12-hour with seconds</p>
            <TimePicker format="12" includeSeconds secondStep={15} defaultValue="02:30:30 PM" />
          </div>
        </div>
      </div>

      {/* With Now Button */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With "Now" Button</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Click "Now" to set current time</p>
          <TimePicker showNow label="Meeting Time" />
        </div>
      </div>

      {/* With Presets */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Time Presets</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Quick select Morning, Afternoon, Evening, Night</p>
          <TimePicker showPresets showNow label="Work Hours" />
        </div>
      </div>

      {/* Manual Input */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Manual Input</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Type time directly in the input field</p>
          <TimePicker allowManualInput label="Enter Time" placeholder="Type time..." />
        </div>
      </div>

      {/* Custom Step */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Custom Minute Steps</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">1 minute step</p>
            <TimePicker minuteStep={1} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">5 minute step (default)</p>
            <TimePicker minuteStep={5} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">15 minute step</p>
            <TimePicker minuteStep={15} />
          </div>
        </div>
      </div>

      {/* Time Range and Validation */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Time Range & Validation</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Working hours (9 AM - 6 PM)</p>
            <TimePicker
              label="Work Time"
              minTime="09:00"
              maxTime="18:00"
              value={validatedTime}
              onChange={handleValidatedTimeChange}
              error={error}
              helperText="Select time within business hours"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Success state</p>
            <TimePicker label="Validated Time" success defaultValue="10:30" helperText="Time is valid!" />
          </div>
        </div>
      </div>

      {/* Custom Presets */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Custom Presets</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">Quick select common meeting times</p>
          <TimePicker
            label="Meeting Time"
            showNow
            customPresets={[
              { label: "Daily Standup", time: "09:30" },
              { label: "Lunch Break", time: "12:00" },
              { label: "Team Sync", time: "15:00" },
              { label: "EOD Review", time: "17:30" },
            ]}
          />
        </div>
      </div>

      {/* Keyboard Navigation */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Keyboard Navigation</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">
            Use Arrow keys, Home/End, Page Up/Down to navigate. Tab/Shift+Tab to switch columns.
          </p>
          <TimePicker label="Try Keyboard" showNow animate helperText="Click to open and try keyboard controls" />
        </div>
      </div>

      {/* Full Featured */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Full Featured Example</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">All features enabled</p>
          <TimePicker
            label="Appointment Time"
            size="lg"
            format="12"
            includeSeconds
            showNow
            showPresets
            allowManualInput
            clearable
            required
            animate
            placeholder="Select appointment time"
            helperText="Select your preferred appointment time"
          />
        </div>
      </div>
    </div>
  );

  const code =
    `import { TimePicker } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `// Basic usage\n` +
    `const [time, setTime] = useState('14:30')\n` +
    `<TimePicker value={time} onChange={setTime} />\n\n` +
    `// Variants\n` +
    `<TimePicker variant="default" />\n` +
    `<TimePicker variant="compact" />\n` +
    `<TimePicker variant="inline" />\n\n` +
    `// Sizes\n` +
    `<TimePicker size="sm" />\n` +
    `<TimePicker size="md" />\n` +
    `<TimePicker size="lg" />\n\n` +
    `// Time formats\n` +
    `<TimePicker format="24" />\n` +
    `<TimePicker format="12" />\n\n` +
    `// With seconds\n` +
    `<TimePicker includeSeconds secondStep={10} />\n\n` +
    `// With "Now" button\n` +
    `<TimePicker showNow />\n\n` +
    `// With presets (Morning, Afternoon, Evening, Night)\n` +
    `<TimePicker showPresets />\n\n` +
    `// With manual input\n` +
    `<TimePicker allowManualInput />\n\n` +
    `// Custom minute step\n` +
    `<TimePicker minuteStep={15} />\n\n` +
    `// Time range validation\n` +
    `const [validatedTime, setValidatedTime] = useState()\n` +
    `const [error, setError] = useState("")\n\n` +
    `const handleValidatedTimeChange = (time) => {\n` +
    `  setValidatedTime(time)\n` +
    `  if (time) {\n` +
    `    const hour = parseInt(time.split(":")[0])\n` +
    `    if (hour < 9 || hour >= 18) {\n` +
    `      setError("Please select a time between 9 AM and 6 PM")\n` +
    `    } else {\n` +
    `      setError("")\n` +
    `    }\n` +
    `  }\n` +
    `}\n\n` +
    `<TimePicker\n` +
    `  label="Work Time"\n` +
    `  minTime="09:00"\n` +
    `  maxTime="18:00"\n` +
    `  value={validatedTime}\n` +
    `  onChange={handleValidatedTimeChange}\n` +
    `  error={error}\n` +
    `  helperText="Select time within business hours"\n` +
    `/>\n\n` +
    `// Success state\n` +
    `<TimePicker\n` +
    `  label="Validated Time"\n` +
    `  success\n` +
    `  defaultValue="10:30"\n` +
    `  helperText="Time is valid!"\n` +
    `/>\n\n` +
    `// Custom presets\n` +
    `<TimePicker\n` +
    `  label="Meeting Time"\n` +
    `  showNow\n` +
    `  customPresets={[\n` +
    `    { label: "Daily Standup", time: "09:30" },\n` +
    `    { label: "Lunch Break", time: "12:00" },\n` +
    `    { label: "Team Sync", time: "15:00" },\n` +
    `    { label: "EOD Review", time: "17:30" },\n` +
    `  ]}\n` +
    `/>\n\n` +
    `// Keyboard navigation\n` +
    `// Arrow keys: Navigate up/down in columns\n` +
    `// Left/Right: Switch between columns\n` +
    `// Home/End: Jump to start/end of list\n` +
    `// PageUp/PageDown: Jump by larger steps\n` +
    `<TimePicker\n` +
    `  label="Try Keyboard"\n` +
    `  showNow\n` +
    `  animate\n` +
    `  helperText="Click to open and try keyboard controls"\n` +
    `/>\n\n` +
    `// Full featured\n` +
    `<TimePicker\n` +
    `  label="Appointment Time"\n` +
    `  size="lg"\n` +
    `  format="12"\n` +
    `  includeSeconds\n` +
    `  showNow\n` +
    `  showPresets\n` +
    `  allowManualInput\n` +
    `  clearable\n` +
    `  required\n` +
    `  animate\n` +
    `  placeholder="Select appointment time"\n` +
    `  helperText="Select your preferred appointment time"\n` +
    `/>`;

  const rows: PropsRow[] = [
    { property: "value", description: t("props.timePicker.value"), type: "string", default: "-" },
    { property: "defaultValue", description: t("props.timePicker.defaultValue"), type: "string", default: "-" },
    { property: "onChange", description: t("props.timePicker.onChange"), type: "(value?: string) => void", default: "-" },
    { property: "placeholder", description: t("props.timePicker.placeholder"), type: "string", default: "'Select time'" },
    { property: "disabled", description: t("props.timePicker.disabled"), type: "boolean", default: "false" },
    { property: "size", description: t("props.timePicker.size"), type: "'sm' | 'md' | 'lg'", default: "'md'" },
    { property: "label", description: t("props.timePicker.label"), type: "string", default: "-" },
    { property: "required", description: t("props.timePicker.required"), type: "boolean", default: "false" },
    { property: "format", description: t("props.timePicker.format"), type: "'24' | '12'", default: "'24'" },
    { property: "includeSeconds", description: t("props.timePicker.includeSeconds"), type: "boolean", default: "false" },
    { property: "minuteStep", description: t("props.timePicker.minuteStep"), type: "number", default: "5" },
    { property: "secondStep", description: t("props.timePicker.secondStep"), type: "number", default: "5" },
    { property: "clearable", description: t("props.timePicker.clearable"), type: "boolean", default: "true" },
    { property: "variant", description: "Visual variant of the picker", type: "'default' | 'compact' | 'inline'", default: "'default'" },
    { property: "showNow", description: 'Show "Now" button', type: "boolean", default: "false" },
    { property: "showPresets", description: "Show time presets (Morning, Afternoon, etc.)", type: "boolean", default: "false" },
    { property: "allowManualInput", description: "Enable manual input", type: "boolean", default: "false" },
    { property: "customPresets", description: "Custom preset buttons with labels and times", type: "Array<{label: string; time: string}>", default: "[]" },
    { property: "minTime", description: "Minimum allowed time (e.g., '09:00')", type: "string", default: "-" },
    { property: "maxTime", description: "Maximum allowed time (e.g., '18:00')", type: "string", default: "-" },
    { property: "disabledTimes", description: "Disabled times function or array", type: "((time: string) => boolean) | string[]", default: "-" },
    { property: "error", description: "Error message to display", type: "string", default: "-" },
    { property: "success", description: "Show success state", type: "boolean", default: "false" },
    { property: "helperText", description: "Helper text below the picker", type: "string", default: "-" },
    { property: "animate", description: "Enable smooth animations", type: "boolean", default: "true" },
    { property: "onOpen", description: "Callback when popover opens", type: "() => void", default: "-" },
    { property: "onClose", description: "Callback when popover closes", type: "() => void", default: "-" },
  ];
  const order = [
    "value",
    "defaultValue",
    "onChange",
    "placeholder",
    "disabled",
    "size",
    "variant",
    "label",
    "required",
    "format",
    "includeSeconds",
    "minuteStep",
    "secondStep",
    "showNow",
    "showPresets",
    "customPresets",
    "allowManualInput",
    "minTime",
    "maxTime",
    "disabledTimes",
    "error",
    "success",
    "helperText",
    "animate",
    "onOpen",
    "onClose",
    "clearable",
  ];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="TimePicker.md" />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
