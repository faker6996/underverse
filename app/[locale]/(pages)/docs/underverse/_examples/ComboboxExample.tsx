"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { Apple, Banana, Cherry, Citrus, Grape, Users, Settings, Bell, Lock, Palette, Globe, Zap, Shield, Sparkles } from "lucide-react";

export default function ComboboxExample() {
  const t = useTranslations("DocsUnderverse");
  const [value, setValue] = React.useState<string | null>(null);
  const [valueOutline, setValueOutline] = React.useState<string | null>(null);
  const [valueGhost, setValueGhost] = React.useState<string | null>(null);
  const [valueDisabled] = React.useState<string | null>("banana");
  const [valueAdvanced, setValueAdvanced] = React.useState<string | null>(null);
  const [valueWithIcons, setValueWithIcons] = React.useState<string | null>(null);
  const [valueGrouped, setValueGrouped] = React.useState<string | null>(null);
  const [valueError, setValueError] = React.useState<string | null>(null);

  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];

  // Options with icons and descriptions
  const optionsWithIcons = [
    { label: "Apple", value: "apple", icon: <Apple className="w-4 h-4" />, description: "Fresh and crispy" },
    { label: "Banana", value: "banana", icon: <Banana className="w-4 h-4" />, description: "Rich in potassium" },
    { label: "Cherry", value: "cherry", icon: <Cherry className="w-4 h-4" />, description: "Sweet and tangy" },
    { label: "Grape", value: "grape", icon: <Grape className="w-4 h-4" />, description: "Perfect for wine" },
    { label: "Lemon", value: "lemon", icon: <Citrus className="w-4 h-4" />, description: "Zesty and fresh", disabled: true },
  ];

  // Grouped options for settings
  const groupedOptions = [
    { label: "Profile", value: "profile", icon: <Users className="w-4 h-4" />, description: "Manage your profile", group: "Account" },
    { label: "Security", value: "security", icon: <Lock className="w-4 h-4" />, description: "Password & 2FA", group: "Account" },
    { label: "Notifications", value: "notifications", icon: <Bell className="w-4 h-4" />, description: "Email & push alerts", group: "Preferences" },
    { label: "Appearance", value: "appearance", icon: <Palette className="w-4 h-4" />, description: "Theme & colors", group: "Preferences" },
    { label: "Language", value: "language", icon: <Globe className="w-4 h-4" />, description: "Display language", group: "Preferences" },
    { label: "Performance", value: "performance", icon: <Zap className="w-4 h-4" />, description: "Speed optimizations", group: "Advanced" },
    { label: "Privacy", value: "privacy", icon: <Shield className="w-4 h-4" />, description: "Data & cookies", group: "Advanced" },
    { label: "Integrations", value: "integrations", icon: <Settings className="w-4 h-4" />, description: "Third-party apps", group: "Advanced" },
  ];

  // Many options to demonstrate search input (>10)
  const manyOptions = Array.from({ length: 20 }).map((_, i) => ({ label: `Option ${i + 1}`, value: `opt-${i + 1}` }));

  // Advanced options example (explicit list to show rich props)
  const advancedOptions = [
    { label: "Apple", value: "apple", icon: <Apple className="w-4 h-4" /> },
    { label: "Banana", value: "banana", icon: <Banana className="w-4 h-4" /> },
    { label: "Cherry", value: "cherry", icon: <Cherry className="w-4 h-4" /> },
    { label: "Dragonfruit", value: "dragonfruit", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Elderberry", value: "elderberry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape", icon: <Grape className="w-4 h-4" /> },
    { label: "Honeydew", value: "honeydew" },
    { label: "Jackfruit", value: "jackfruit" },
    { label: "Kiwi", value: "kiwi" },
    { label: "Lemon", value: "lemon", icon: <Citrus className="w-4 h-4" /> },
    { label: "Mango", value: "mango" },
  ];

  const code =
    `import { Combobox } from '@underverse-ui/underverse'\n` +
    `import { Apple, Banana, Cherry, Users, Lock, Bell, Palette, Globe, Zap, Shield, Settings } from 'lucide-react'\n\n` +
    `const [value, setValue] = useState<string | null>(null)\n\n` +
    `// Basic options\n` +
    `const options = [\n` +
    `  { label: 'Apple', value: 'apple' },\n` +
    `  { label: 'Banana', value: 'banana' },\n` +
    `  { label: 'Cherry', value: 'cherry' },\n` +
    `]\n\n` +
    `// Options with icons and descriptions\n` +
    `const optionsWithIcons = [\n` +
    `  { label: 'Apple', value: 'apple', icon: <Apple />, description: 'Fresh and crispy' },\n` +
    `  { label: 'Banana', value: 'banana', icon: <Banana />, description: 'Rich in potassium' },\n` +
    `  { label: 'Cherry', value: 'cherry', icon: <Cherry />, description: 'Sweet and tangy' },\n` +
    `  { label: 'Lemon', value: 'lemon', icon: <Citrus />, description: 'Zesty and fresh', disabled: true },\n` +
    `]\n\n` +
    `// Grouped options\n` +
    `const groupedOptions = [\n` +
    `  { label: 'Profile', value: 'profile', icon: <Users />, group: 'Account' },\n` +
    `  { label: 'Security', value: 'security', icon: <Lock />, group: 'Account' },\n` +
    `  { label: 'Notifications', value: 'notifications', icon: <Bell />, group: 'Preferences' },\n` +
    `  { label: 'Appearance', value: 'appearance', icon: <Palette />, group: 'Preferences' },\n` +
    `]\n\n` +
    `// 1) Basic with label\n` +
    `<Combobox options={options} value={value} onChange={setValue} label='Fruit' required allowClear />\n\n` +
    `// 2) With icons and descriptions\n` +
    `<Combobox options={optionsWithIcons} value={value} onChange={setValue} label='Select Fruit' showSelectedIcon />\n\n` +
    `// 3) Grouped options\n` +
    `<Combobox options={groupedOptions} groupBy={(opt) => opt.group || ''} label='Settings' />\n\n` +
    `// 4) With error state\n` +
    `<Combobox options={options} value={null} error='Please select an option' helperText='Required field' />\n\n` +
    `// 5) Sizes\n` +
    `<Combobox options={options} size='sm' placeholder='Small' />\n` +
    `<Combobox options={options} size='md' placeholder='Medium' />\n` +
    `<Combobox options={options} size='lg' placeholder='Large' />\n\n` +
    `// 6) Variants\n` +
    `<Combobox options={options} variant='default' placeholder='Default' />\n` +
    `<Combobox options={options} variant='outline' placeholder='Outline' />\n` +
    `<Combobox options={options} variant='ghost' placeholder='Ghost' />\n`;

  const demo = (
    <div className="space-y-8">
      {/* Section 1: Basic */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
          Basic with Label
        </h4>
        <Combobox options={options} value={value} onChange={setValue} label="Fruit" required allowClear placeholder="Select a fruit" />
        <div className="text-xs text-muted-foreground">
          Selected: <code className="px-1.5 py-0.5 rounded bg-muted">{String(value ?? "none")}</code>
        </div>
      </div>

      {/* Section 2: With Icons & Descriptions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
          Icons & Descriptions
        </h4>
        <Combobox
          options={optionsWithIcons}
          value={valueWithIcons}
          onChange={setValueWithIcons}
          label="Fruit Selection"
          showSelectedIcon
          allowClear
          placeholder="Choose with icons"
          helperText="Options can have icons, descriptions, and be disabled"
        />
      </div>

      {/* Section 3: Grouped Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
          Grouped Options
        </h4>
        <Combobox
          options={groupedOptions}
          value={valueGrouped}
          onChange={setValueGrouped}
          groupBy={(opt) => (opt as (typeof groupedOptions)[0]).group || ""}
          label="Settings"
          showSelectedIcon
          placeholder="Select a setting"
          maxHeight={280}
        />
      </div>

      {/* Section 4: Error State */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs">4</span>
          Error State
        </h4>
        <Combobox
          options={options}
          value={valueError}
          onChange={setValueError}
          label="Required Field"
          required
          error={!valueError ? "Please select an option" : undefined}
          helperText="This field is required"
          placeholder="Select to clear error"
        />
      </div>

      {/* Section 5: Sizes */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">5</span>
          Sizes
        </h4>
        <div className="flex flex-wrap items-end gap-3">
          <Combobox options={options} value={value} onChange={setValue} size="sm" placeholder="Small" />
          <Combobox options={options} value={value} onChange={setValue} size="md" placeholder="Medium" />
          <Combobox options={options} value={value} onChange={setValue} size="lg" placeholder="Large" />
        </div>
      </div>

      {/* Section 6: Variants */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">6</span>
          Variants
        </h4>
        <div className="flex flex-wrap items-end gap-3">
          <Combobox options={options} value={value} onChange={setValue} variant="default" placeholder="Default" />
          <Combobox options={options} value={valueOutline} onChange={setValueOutline} variant="outline" placeholder="Outline" />
          <Combobox options={options} value={valueGhost} onChange={setValueGhost} variant="ghost" placeholder="Ghost" />
        </div>
      </div>

      {/* Section 7: Disabled */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">7</span>
          Disabled State
        </h4>
        <Combobox options={options} value={valueDisabled} onChange={() => {}} disabled placeholder="Disabled" />
      </div>

      {/* Section 8: Advanced */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-linear-to-r from-primary to-secondary text-white flex items-center justify-center text-xs">8</span>
          Advanced (Many Options + Search)
        </h4>
        <Combobox
          options={advancedOptions}
          value={valueAdvanced}
          onChange={setValueAdvanced}
          allowClear
          showSelectedIcon
          placeholder="Search and select fruit"
          searchPlaceholder="Type to search..."
          label="Fruit Selection"
          required
          size="md"
          usePortal
          fontBold
          helperText="Supports keyboard navigation and search"
        />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "id", description: t("props.combobox.id"), type: "string", default: "-" },
    {
      property: "options",
      description: "Array of options with optional icon, description, disabled, and group",
      type: "Array<ComboboxOption>",
      default: "-",
    },
    { property: "value", description: t("props.combobox.value"), type: "any", default: "-" },
    { property: "onChange", description: t("props.combobox.onChange"), type: "(value: any) => void", default: "-" },
    { property: "placeholder", description: t("props.combobox.placeholder"), type: "string", default: '"Select..."' },
    { property: "className", description: t("props.combobox.className"), type: "string", default: "-" },
    { property: "disabled", description: t("props.combobox.disabled"), type: "boolean", default: "false" },
    { property: "size", description: t("props.combobox.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "variant", description: t("props.combobox.variant"), type: '"default" | "outline" | "ghost"', default: '"default"' },
    { property: "allowClear", description: t("props.combobox.allowClear"), type: "boolean", default: "false" },
    { property: "searchPlaceholder", description: t("props.combobox.searchPlaceholder"), type: "string", default: '"Search..."' },
    { property: "emptyText", description: t("props.combobox.emptyText"), type: "string", default: '"No results found"' },
    { property: "usePortal", description: t("props.combobox.usePortal"), type: "boolean", default: "true" },
    { property: "label", description: t("props.combobox.label"), type: "string", default: "-" },
    { property: "required", description: t("props.combobox.required"), type: "boolean", default: "false" },
    { property: "fontBold", description: t("props.combobox.fontBold"), type: "boolean", default: "false" },
    { property: "showSelectedIcon", description: "Show icon of selected option in trigger", type: "boolean", default: "false" },
    { property: "maxHeight", description: "Maximum height of dropdown list in pixels", type: "number", default: "320" },
    { property: "groupBy", description: "Function to get group name from option", type: "(option: ComboboxOption) => string", default: "-" },
    { property: "renderOption", description: "Custom render function for options", type: "(option, isSelected) => ReactNode", default: "-" },
    { property: "renderValue", description: "Custom render function for selected value", type: "(option) => ReactNode", default: "-" },
    { property: "error", description: "Error message to display", type: "string", default: "-" },
    { property: "helperText", description: "Helper text below the combobox", type: "string", default: "-" },
  ];
  const order = rows.map((r) => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} />;

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
