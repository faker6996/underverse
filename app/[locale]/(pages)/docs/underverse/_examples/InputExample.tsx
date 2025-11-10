"use client";

import React from "react";
import Input, { PasswordInput, NumberInput } from "@/components/ui/Input";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { Mail, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function InputExample() {
  const t = useTranslations("DocsUnderverse");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [qty, setQty] = React.useState("10");

  const code =
    `import Input, { PasswordInput, NumberInput } from '@underverse-ui/underverse'\n` +
    `import { Mail, Search } from 'lucide-react'\n\n` +
    `const [name, setName] = useState("")\n` +
    `const [email, setEmail] = useState("")\n` +
    `const [password, setPassword] = useState("")\n` +
    `const [query, setQuery] = useState("")\n` +
    `const [description, setDescription] = useState("")\n` +
    `const [qty, setQty] = useState("10")\n\n` +
    `// Variants\n` +
    `<Input label='Default' placeholder='Enter name' value={name} onChange={(e) => setName(e.target.value)} variant='default' />\n` +
    `<Input label='Filled' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} variant='filled' />\n` +
    `<Input label='Outlined' placeholder='Search' value={query} onChange={(e) => setQuery(e.target.value)} variant='outlined' />\n` +
    `<Input label='Minimal' placeholder='Short description' value={description} onChange={(e) => setDescription(e.target.value)} variant='minimal' />\n\n` +
    `// Sizes & Icons\n` +
    `<Input size='sm' label='Search (sm)' placeholder='Keyword' leftIcon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />\n` +
    `<Input size='md' label='Email (md)' placeholder='you@example.com' type='email' leftIcon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />\n` +
    `<Input size='lg' label='Name (lg)' placeholder='Full name' value={name} onChange={(e) => setName(e.target.value)} />\n\n` +
    `// States\n` +
    `<Input label='Required' placeholder='Enter value' required clearable value={name} onChange={(e)=>setName(e.target.value)} hint='This field is required' />\n` +
    `<Input label='Char limit' placeholder='Max 20' value={description} onChange={(e)=>setDescription(e.target.value)} counter maxLength={20} description='Helper text shows below' />\n` +
    `<Input label='Disabled' placeholder='Disabled' disabled />\n` +
    `<Input label='Loading' placeholder='Loading...' loading />\n` +
    `<Input label='Success' placeholder='Looks good' success />\n\n` +
    `// Specialized\n` +
    `<PasswordInput label='Password' placeholder='••••••••' value={password} onChange={(e)=>setPassword(e.target.value)} showStrength />\n` +
    `<NumberInput label='Quantity' value={qty} onChange={(e)=>setQty(e.target.value)} min={0} max={99} showSteppers formatThousands />`;

  const demo = (
    <div className="space-y-6 max-w-2xl">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Default" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} variant="default" />
          <Input label="Filled" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} variant="filled" />
          <Input label="Outlined" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} variant="outlined" />
          <Input label="Minimal" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} variant="minimal" />
        </div>
      </div>

      {/* Sizes & Icons */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes & Icons</p>
        <div className="grid md:grid-cols-3 gap-3">
          <Input size="sm" label="Search (sm)" placeholder="Keyword" leftIcon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Input size="md" label="Email (md)" placeholder="you@example.com" type="email" leftIcon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input size="lg" label="Name (lg)" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      {/* States: required, clearable, counter, description/hint */}
      <div className="space-y-2">
        <p className="text-sm font-medium">States</p>
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Required" placeholder="Enter value" required clearable value={name} onChange={(e)=>setName(e.target.value)} hint="This field is required" />
          <Input label="Char limit" placeholder="Max 20" value={description} onChange={(e)=>setDescription(e.target.value)} counter maxLength={20} description="Helper text shows below" />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Disabled" placeholder="Disabled" disabled />
          <Input label="Loading" placeholder="Loading..." loading />
          <Input label="Success" placeholder="Looks good" success />
        </div>
      </div>

      {/* Password & Number */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Specialized</p>
        <div className="grid md:grid-cols-2 gap-3">
          <PasswordInput label="Password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} showStrength />
          <NumberInput label="Quantity" value={qty} onChange={(e)=>setQty(e.target.value)} min={0} max={99} showSteppers formatThousands />
        </div>
      </div>
    </div>
  );

  const rowsInput: PropsRow[] = [
    { property: "label", description: t("props.input.label"), type: "string", default: "-" },
    { property: "error", description: t("props.input.error"), type: "string", default: "-" },
    { property: "description", description: t("props.input.description"), type: "string", default: "-" },
    { property: "variant", description: t("props.input.variant"), type: '"default" | "filled" | "outlined" | "minimal"', default: '"default"' },
    { property: "size", description: t("props.input.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "leftIcon", description: t("props.input.leftIcon"), type: "React.ComponentType<{ className?: string }>", default: "-" },
    { property: "rightIcon", description: t("props.input.rightIcon"), type: "React.ComponentType<{ className?: string }>", default: "-" },
    { property: "clearable", description: t("props.input.clearable"), type: "boolean", default: "false" },
    { property: "loading", description: t("props.input.loading"), type: "boolean", default: "false" },
    { property: "success", description: t("props.input.success"), type: "boolean", default: "false" },
    { property: "onClear", description: t("props.input.onClear"), type: "() => void", default: "-" },
    { property: "hint", description: t("props.input.hint"), type: "string", default: "-" },
    { property: "counter", description: t("props.input.counter"), type: "boolean", default: "false" },
    { property: "maxLength", description: t("props.input.maxLength"), type: "number", default: "-" },
    { property: "className", description: t("props.input.className"), type: "string", default: "-" },
    { property: "required", description: t("props.input.required"), type: "boolean", default: "false" },
    { property: "type", description: t("props.input.type"), type: "string", default: '"text"' },
    { property: "value", description: t("props.input.value"), type: "string", default: "-" },
    { property: "onChange", description: t("props.input.onChange"), type: "(e) => void", default: "-" },
    { property: "placeholder", description: t("props.input.placeholder"), type: "string", default: "-" },
  ];
  const orderInput = rowsInput.map(r => r.property);

  const rowsPassword: PropsRow[] = [
    { property: "showStrength", description: t("props.passwordInput.showStrength"), type: "boolean", default: "false" },
    { property: "strengthLabels", description: t("props.passwordInput.strengthLabels"), type: "string[]", default: "[\"Weak\",\"Fair\",\"Good\",\"Strong\"]" },
  ];
  const orderPassword = rowsPassword.map(r => r.property);

  const rowsNumber: PropsRow[] = [
    { property: "min", description: t("props.numberInput.min"), type: "number", default: "-" },
    { property: "max", description: t("props.numberInput.max"), type: "number", default: "-" },
    { property: "step", description: t("props.numberInput.step"), type: "number", default: "1" },
    { property: "showSteppers", description: t("props.numberInput.showSteppers"), type: "boolean", default: "true" },
    { property: "onIncrement", description: t("props.numberInput.onIncrement"), type: "() => void", default: "-" },
    { property: "onDecrement", description: t("props.numberInput.onDecrement"), type: "() => void", default: "-" },
    { property: "formatThousands", description: t("props.numberInput.formatThousands"), type: "boolean", default: "false" },
    { property: "locale", description: t("props.numberInput.locale"), type: "string", default: '"vi-VN"' },
    { property: "value", description: t("props.numberInput.value"), type: "number | string", default: "-" },
    { property: "onChange", description: t("props.numberInput.onChange"), type: "(e) => void", default: "-" },
  ];
  const orderNumber = rowsNumber.map(r => r.property);

  const docs = (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">Input</p>
        <PropsDocsTable rows={rowsInput} order={orderInput} />
      </div>
      <div>
        <p className="text-sm font-medium">PasswordInput</p>
        <PropsDocsTable rows={rowsPassword} order={orderPassword} />
      </div>
      <div>
        <p className="text-sm font-medium">NumberInput</p>
        <PropsDocsTable rows={rowsNumber} order={orderNumber} />
      </div>
    </div>
  );

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
          { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}

