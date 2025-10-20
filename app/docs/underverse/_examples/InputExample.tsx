"use client";

import React from "react";
import Input, { PasswordInput, NumberInput } from "@/components/ui/Input";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Mail, Search } from "lucide-react";

export default function InputExample() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [qty, setQty] = React.useState("10");

  return (
    <IntlDemoProvider>
      <div className="space-y-6 max-w-2xl">
        {/* Variants */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Variants</p>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Default" placeholder="Nhập tên" value={name} onChange={(e) => setName(e.target.value)} variant="default" />
            <Input label="Filled" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} variant="filled" />
            <Input label="Outlined" placeholder="Tìm kiếm" value={query} onChange={(e) => setQuery(e.target.value)} variant="outlined" />
            <Input label="Minimal" placeholder="Mô tả ngắn" value={description} onChange={(e) => setDescription(e.target.value)} variant="minimal" />
          </div>
          <CodeBlock code={`<Input variant='default' />\n<Input variant='filled' />\n<Input variant='outlined' />\n<Input variant='minimal' />`} />
        </div>

        {/* Sizes & Icons */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Sizes & Icons</p>
          <div className="grid md:grid-cols-3 gap-3">
            <Input size="sm" label="Tìm kiếm (sm)" placeholder="Từ khóa" leftIcon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />
            <Input size="md" label="Email (md)" placeholder="you@example.com" type="email" leftIcon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input size="lg" label="Tên (lg)" placeholder="Họ tên" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <CodeBlock code={`<Input size='sm' leftIcon={Search} />\n<Input size='md' leftIcon={Mail} type='email'/>\n<Input size='lg' />`} />
        </div>

        {/* States: required, clearable, counter, description/hint */}
        <div className="space-y-2">
          <p className="text-sm font-medium">States</p>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Bắt buộc" placeholder="Nhập giá trị" required clearable value={name} onChange={(e)=>setName(e.target.value)} hint="Trường này là bắt buộc" />
            <Input label="Giới hạn ký tự" placeholder="Tối đa 20" value={description} onChange={(e)=>setDescription(e.target.value)} counter maxLength={20} description="Mô tả hiển thị bên dưới" />
          </div>
          <CodeBlock code={`<Input required clearable hint='Bắt buộc'/>\n<Input counter maxLength={20} description='Mô tả'/>`} />
        </div>

        {/* Password & Number */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Specialized</p>
          <div className="grid md:grid-cols-2 gap-3">
            <PasswordInput label="Mật khẩu" placeholder="········" value={password} onChange={(e)=>setPassword(e.target.value)} showStrength />
            <NumberInput label="Số lượng" value={qty} onChange={(e)=>setQty(e.target.value)} min={0} max={99} showSteppers formatThousands />
          </div>
          <CodeBlock code={`import { PasswordInput, NumberInput } from '@underverse-ui/underverse'\n\n<PasswordInput label='Mật khẩu' showStrength />\n<NumberInput label='Số lượng' min={0} max={99} showSteppers formatThousands />`} />
        </div>
      </div>
    </IntlDemoProvider>
  );
}
