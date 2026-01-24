"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/Slider";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function SliderExample() {
  const t = useTranslations("DocsUnderverse");
  const [value1, setValue1] = React.useState(30);
  const [value2, setValue2] = React.useState(50);
  const [value3, setValue3] = React.useState(25);
  const [value4, setValue4] = React.useState(75);
  const [value5, setValue5] = React.useState(0);
  const [value6, setValue6] = React.useState(500);
  const [value7, setValue7] = React.useState(50);

  const code =
    `import { Slider } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `// Basic Slider\n` +
    `const [value, setValue] = useState(30)\n` +
    `<Slider value={value} onValueChange={setValue} />\n\n` +
    `// With Label\n` +
    `<Slider value={value} onValueChange={setValue} label=\"Volume\" />\n\n` +
    `// With Value Display\n` +
    `<Slider value={value} onValueChange={setValue} label=\"Brightness\" showValue />\n\n` +
    `// Sizes\n` +
    `<Slider value={value} onValueChange={setValue} size=\"sm\" label=\"Small\" showValue />\n` +
    `<Slider value={value} onValueChange={setValue} size=\"md\" label=\"Medium\" showValue />\n` +
    `<Slider value={value} onValueChange={setValue} size=\"lg\" label=\"Large\" showValue />\n\n` +
    `// Custom Min/Max/Step\n` +
    `<Slider \n` +
    `  value={value} \n` +
    `  onValueChange={setValue} \n` +
    `  min={0} \n` +
    `  max={1000} \n` +
    `  step={50} \n` +
    `  label=\"Price Range\" \n` +
    `  showValue \n` +
    `/>\n\n` +
    `// Custom Format Value\n` +
    `<Slider \n` +
    `  value={value} \n` +
    `  onValueChange={setValue} \n` +
    `  label=\"Temperature\" \n` +
    `  showValue \n` +
    `  formatValue={(val) => \`\${val}°C\`} \n` +
    `/>\n\n` +
    `// Disabled\n` +
    `<Slider value={50} onValueChange={() => {}} label=\"Disabled Slider\" showValue disabled />`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Slider */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Slider</p>
        <Slider value={value1} onValueChange={setValue1} />
      </div>

      {/* With Label */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Label</p>
        <Slider value={value2} onValueChange={setValue2} label="Volume" />
      </div>

      {/* With Value Display */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Value Display</p>
        <Slider value={value3} onValueChange={setValue3} label="Brightness" showValue />
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-3">
          <Slider value={value4} onValueChange={setValue4} size="sm" label="Small" showValue />
          <Slider value={value4} onValueChange={setValue4} size="md" label="Medium" showValue />
          <Slider value={value4} onValueChange={setValue4} size="lg" label="Large" showValue />
        </div>
      </div>

      {/* Custom Min/Max/Step */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Min/Max/Step</p>
        <Slider
          value={value6}
          onValueChange={setValue6}
          min={0}
          max={1000}
          step={50}
          label="Price Range"
          showValue
        />
      </div>

      {/* Custom Format Value */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Format Value</p>
        <Slider
          value={value5}
          onValueChange={setValue5}
          min={-20}
          max={40}
          label="Temperature"
          showValue
          formatValue={(val) => `${val}°C`}
        />
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <Slider value={value7} onValueChange={setValue7} label="Disabled Slider" showValue disabled />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "value", description: t("props.slider.value"), type: "number", default: "-" },
    { property: "defaultValue", description: t("props.slider.defaultValue"), type: "number", default: "0" },
    { property: "min", description: t("props.slider.min"), type: "number", default: "0" },
    { property: "max", description: t("props.slider.max"), type: "number", default: "100" },
    { property: "step", description: t("props.slider.step"), type: "number", default: "1" },
    { property: "onChange", description: t("props.slider.onChange"), type: "(value: number) => void", default: "-" },
    { property: "onValueChange", description: t("props.slider.onValueChange"), type: "(value: number) => void", default: "-" },
    { property: "onMouseUp", description: t("props.slider.onMouseUp"), type: "() => void", default: "-" },
    { property: "onTouchEnd", description: t("props.slider.onTouchEnd"), type: "() => void", default: "-" },
    { property: "label", description: t("props.slider.label"), type: "React.ReactNode", default: "-" },
    { property: "labelClassName", description: t("props.slider.labelClassName"), type: "string", default: "-" },
    { property: "containerClassName", description: t("props.slider.containerClassName"), type: "string", default: "-" },
    { property: "trackClassName", description: t("props.slider.trackClassName"), type: "string", default: "-" },
    { property: "thumbClassName", description: t("props.slider.thumbClassName"), type: "string", default: "-" },
    { property: "showValue", description: t("props.slider.showValue"), type: "boolean", default: "false" },
    { property: "valueClassName", description: t("props.slider.valueClassName"), type: "string", default: "-" },
    { property: "formatValue", description: t("props.slider.formatValue"), type: "(value: number) => string", default: "-" },
    { property: "size", description: t("props.slider.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "disabled", description: t("props.slider.disabled"), type: "boolean", default: "false" },
    { property: "orientation", description: t("props.slider.orientation"), type: '"horizontal" | "vertical"', default: '"horizontal"' },
    { property: "noFocus", description: t("props.slider.noFocus"), type: "boolean", default: "false" },
  ];
  const order = ["value","defaultValue","min","max","step","onChange","onValueChange","onMouseUp","onTouchEnd","label","labelClassName","containerClassName","trackClassName","thumbClassName","showValue","valueClassName","formatValue","size","disabled","orientation","noFocus"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Slider.md" />;

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
