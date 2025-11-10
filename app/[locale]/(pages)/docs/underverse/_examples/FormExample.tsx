"use client";

import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/CheckBox";
import { useToast } from "@/components/ui/Toast";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { useTranslations } from "next-intl";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function FormExample() {
  const td = useTranslations("DocsUnderverse");
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (data: LoginFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: "success",
        title: "Form Submitted",
        message: `Email: ${data.email}, Remember Me: ${data.rememberMe}`,
      });
    }, 900);
  };

  const code =
    `import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@underverse-ui/underverse'\n` +
    `import Input from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { Checkbox } from '@underverse-ui/underverse'\n` +
    `import { useToast } from '@underverse-ui/underverse'\n\n` +
    `interface LoginFormData { email: string; password: string; rememberMe: boolean }\n` +
    `const { addToast } = useToast()\n` +
    `const [loading, setLoading] = useState(false)\n\n` +
    `const handleSubmit = (data: LoginFormData) => {\n` +
    `  setLoading(true)\n` +
    `  setTimeout(() => {\n` +
    `    setLoading(false)\n` +
    `    addToast({ type: 'success', title: 'Form Submitted', message: \`Email: \${data.email}, Remember: \${data.rememberMe}\` })\n` +
    `  }, 900)\n` +
    `}\n\n` +
    `// 1) Basic with validation\n` +
    `<Form<LoginFormData> onSubmit={handleSubmit} initialValues={{ email: '', password: '', rememberMe: false }} className='space-y-4 max-w-md'>\n` +
    `  <FormField name='email' rules={{ required: 'Email is required' }} render={({ field, fieldState }) => (\n` +
    `    <FormItem>\n` +
    `      <FormLabel>Email</FormLabel>\n` +
    `      <FormControl><Input {...field} type='email' placeholder='Enter your email' error={fieldState.error?.message} /></FormControl>\n` +
    `      <FormMessage />\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <FormField name='password' rules={{ required: 'Password is required', minLength: { value: 6, message: 'At least 6 chars' } }} render={({ field, fieldState }) => (\n` +
    `    <FormItem>\n` +
    `      <FormLabel>Password</FormLabel>\n` +
    `      <FormControl><Input {...field} type='password' placeholder='Enter your password' error={fieldState.error?.message} /></FormControl>\n` +
    `      <FormMessage />\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <FormField name='rememberMe' render={({ field }) => (\n` +
    `    <FormItem className='flex items-center gap-2'>\n` +
    `      <FormControl><Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} /></FormControl>\n` +
    `      <FormLabel className='!mt-0'>Remember me</FormLabel>\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <Button type='submit' className='w-full' loading={loading} loadingText='Submitting...'>Submit</Button>\n` +
    `</Form>\n\n` +
    `// 2) Inline form\n` +
    `<Form<{ email: string }> onSubmit={(d)=>{}} initialValues={{ email: '' }}>\n` +
    `  <div className='flex items-end gap-2 max-w-md'>\n` +
    `    <FormField name='email' rules={{ required: 'Email is required' }} render={({field, fieldState}) => (\n` +
    `      <FormItem className='flex-1'>\n` +
    `        <FormLabel>Email</FormLabel>\n` +
    `        <FormControl><Input {...field} type='email' placeholder='Your email' error={fieldState.error?.message} /></FormControl>\n` +
    `      </FormItem>\n` +
    `    )} />\n` +
    `    <Button type='submit'>Subscribe</Button>\n` +
    `  </div>\n` +
    `</Form>\n\n` +
    `// 3) Disabled fieldset\n` +
    `<fieldset disabled>\n` +
    `  <Input label='Email' placeholder='Readonly' disabled />\n` +
    `  <Button disabled>Submit</Button>\n` +
    `</fieldset>`;

  const demo = (
    <div className="space-y-8">
      {/* 1) Basic with validation + loading */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Form with Validation</h3>
        <Form<LoginFormData>
          onSubmit={handleSubmit}
          initialValues={{ email: "", password: "", rememberMe: false }}
          className="space-y-4 max-w-md"
        >
          <FormField
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter your email" error={fieldState.error?.message} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            rules={{ required: "Password is required", minLength: { value: 6, message: "At least 6 chars" } }}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter your password" error={fieldState.error?.message} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                </FormControl>
                <FormLabel className="!mt-0">Remember me</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={loading} loadingText="Submitting...">
            Submit
          </Button>
        </Form>
      </div>

      {/* 2) Inline form */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Inline Form</h3>
        <Form<{ email: string }>
          onSubmit={(d) => addToast({ type: "info", title: "Subscribed", message: d.email })}
          initialValues={{ email: "" }}
        >
          <div className="flex items-end gap-2 max-w-md">
            <FormField
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field, fieldState }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Your email" error={fieldState.error?.message} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Subscribe</Button>
          </div>
        </Form>
      </div>

      {/* 3) Disabled fieldset */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <fieldset disabled>
          <div className="space-y-2">
            <Input label="Email" placeholder="Readonly" disabled />
            <Button disabled>Submit</Button>
          </div>
        </fieldset>
      </div>
    </div>
  );

  const rowsForm: PropsRow[] = [
    { property: "onSubmit", description: td("props.form.Form.onSubmit"), type: "(data) => void", default: "-" },
    { property: "initialValues", description: td("props.form.Form.initialValues"), type: "Partial<T>", default: "{}" },
    { property: "validationSchema", description: td("props.form.Form.validationSchema"), type: "Record<string, any>", default: "-" },
    { property: "className", description: td("props.form.Form.className"), type: "string", default: "-" },
    { property: "size", description: td("props.form.Form.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
  ];
  const rowsField: PropsRow[] = [
    { property: "name", description: td("props.form.FormField.name"), type: "string", default: "-" },
    { property: "rules", description: td("props.form.FormField.rules"), type: "Validator rules (react-hook-form)", default: "-" },
    { property: "render", description: td("props.form.FormField.render"), type: "({ field, fieldState }) => ReactNode", default: "-" },
  ];
  const rowsOthers: PropsRow[] = [
    { property: "FormItem.className", description: td("props.form.FormItem.className"), type: "string", default: "-" },
    { property: "FormLabel.className", description: td("props.form.FormLabel.className"), type: "string", default: "-" },
    { property: "FormControl", description: td("props.form.FormControl.note"), type: "wrapper", default: "-" },
    { property: "FormMessage.className", description: td("props.form.FormMessage.className"), type: "string", default: "-" },
    { property: "FormInput.name", description: td("props.form.FormInput.name"), type: "string", default: "-" },
    { property: "FormCheckbox.name", description: td("props.form.FormCheckbox.name"), type: "string", default: "-" },
    { property: "FormActions.className", description: td("props.form.FormActions.className"), type: "string", default: "-" },
    { property: "FormSubmitButton.loading", description: td("props.form.FormSubmitButton.loading"), type: "boolean", default: "false" },
  ];

  const docs = (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">Form</p>
        <PropsDocsTable rows={rowsForm} order={rowsForm.map(r=>r.property)} />
      </div>
      <div>
        <p className="text-sm font-medium">FormField</p>
        <PropsDocsTable rows={rowsField} order={rowsField.map(r=>r.property)} />
      </div>
      <div>
        <p className="text-sm font-medium">Others</p>
        <PropsDocsTable rows={rowsOthers} order={rowsOthers.map(r=>r.property)} />
      </div>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: td("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

