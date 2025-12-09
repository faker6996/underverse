"use client";

import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormActions, FormSubmitButton } from "@/components/ui/Form";
import Input, { PasswordInput } from "@/components/ui/Input";
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

type AdvancedValues = {
  name: string;
  email: string;
  password: string;
};

export default function FormExample() {
  const td = useTranslations("DocsUnderverse");
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [advancedSize, setAdvancedSize] = React.useState<"sm" | "md" | "lg">("md");
  const [advancedLoading, setAdvancedLoading] = React.useState(false);

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
    `      <FormLabel required>Email</FormLabel>\n` +
    `      <FormControl><Input {...field} type='email' placeholder='Enter your email' error={fieldState.error?.message} /></FormControl>\n` +
    `      <FormMessage />\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <FormField name='password' rules={{ required: 'Password is required', minLength: { value: 6, message: 'At least 6 chars' } }} render={({ field, fieldState }) => (\n` +
    `    <FormItem>\n` +
    `      <FormLabel required>Password</FormLabel>\n` +
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
    `        <FormLabel required>Email</FormLabel>\n` +
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
    `</fieldset>\n\n` +
    `// 4) Advanced form with size + FormActions / FormSubmitButton\n` +
    `<Form<AdvancedValues> onSubmit={onSubmit} initialValues={{ name: '', email: '', password: '' }} size={advancedSize}>\n` +
    `  <FormField name='name' rules={{ required: 'Name is required' }} render={({ field }) => (\n` +
    `    <FormItem>\n` +
    `      <FormLabel required>Name</FormLabel>\n` +
    `      <FormControl><Input {...field} placeholder='Your name' required /></FormControl>\n` +
    `      <FormMessage />\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <FormField name='email' rules={{ required: 'Email is required' }} render={({ field }) => (\n` +
    `    <FormItem>\n` +
    `      <FormLabel required>Email</FormLabel>\n` +
    `      <FormControl><Input type='email' {...field} placeholder='you@example.com' required /></FormControl>\n` +
    `      <FormMessage />\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <FormField name='password' rules={{ required: 'Password is required' }} render={({ field }) => (\n` +
    `    <FormItem>\n` +
    `      <FormLabel>Password</FormLabel>\n` +
    `      <FormControl><PasswordInput {...field} placeholder='••••••' /></FormControl>\n` +
    `      <FormMessage />\n` +
    `    </FormItem>\n` +
    `  )} />\n` +
    `  <FormActions>\n` +
    `    <FormSubmitButton loading={advancedLoading} variant='primary'>Submit</FormSubmitButton>\n` +
    `  </FormActions>\n` +
    `</Form>`;

  const demo = (
    <div className="space-y-10">
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
                <FormLabel required>Email</FormLabel>
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
                <FormLabel required>Password</FormLabel>
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
                  <FormLabel required>Email</FormLabel>
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

      {/* 4) Advanced form: size + FormActions / FormSubmitButton */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Advanced Form</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Form size:</span>
          {(["sm", "md", "lg"] as const).map((s) => (
            <Button key={s} variant={advancedSize === s ? "primary" : "outline"} size="sm" onClick={() => setAdvancedSize(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Form<AdvancedValues>
          onSubmit={async (v) => {
            setAdvancedLoading(true);
            await new Promise((r) => setTimeout(r, 800));
            setAdvancedLoading(false);
            alert(`Submitted: ${JSON.stringify(v, null, 2)}`);
          }}
          initialValues={{ name: "", email: "", password: "" }}
          size={advancedSize}
          className="space-y-4 max-w-md"
        >
          <FormField
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your name" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            rules={{ required: "Email is required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="you@example.com" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            rules={{ required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="••••••" showStrength />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormActions>
            <FormSubmitButton loading={advancedLoading} variant="primary">
              Submit
            </FormSubmitButton>
          </FormActions>
        </Form>
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
