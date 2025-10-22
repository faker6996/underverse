"use client";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/CheckBox";
import { useToast } from "@/components/ui/Toast";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function FormExample() {
  const { addToast } = useToast();

  const handleSubmit = (data: LoginFormData) => {
    console.log("Form submitted:", data);
    addToast({
      type: "success",
      title: "Form Submitted",
      message: `Email: ${data.email}, Remember Me: ${data.rememberMe}`,
    });
  };

  const code =
    `import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@underverse-ui/underverse'\n` +
    `import Input from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { Checkbox } from '@underverse-ui/underverse'\n` +
    `import { useToast } from '@underverse-ui/underverse'\n\n` +
    `interface LoginFormData {\n` +
    `  email: string\n` +
    `  password: string\n` +
    `  rememberMe: boolean\n` +
    `}\n\n` +
    `const { addToast } = useToast()\n\n` +
    `const handleSubmit = (data: LoginFormData) => {\n` +
    `  console.log("Form submitted:", data)\n` +
    `  addToast({ type: "success", title: "Form Submitted", message: \`Email: \${data.email}\` })\n` +
    `}\n\n` +
    `<Form<LoginFormData>\n` +
    `  onSubmit={handleSubmit}\n` +
    `  initialValues={{ email: "", password: "", rememberMe: false }}\n` +
    `  className="space-y-4 max-w-md"\n` +
    `>\n` +
    `  <FormField\n` +
    `    name="email"\n` +
    `    rules={{ required: "Email is required" }}\n` +
    `    render={({ field, fieldState }) => (\n` +
    `      <FormItem>\n` +
    `        <FormLabel>Email</FormLabel>\n` +
    `        <FormControl>\n` +
    `          <Input {...field} type="email" placeholder="Enter your email" error={fieldState.error?.message} />\n` +
    `        </FormControl>\n` +
    `        <FormMessage />\n` +
    `      </FormItem>\n` +
    `    )}\n` +
    `  />\n` +
    `  <FormField name="password" rules={{ required: "Password is required", minLength: { value: 6, message: "At least 6 chars" } }} ... />\n` +
    `  <FormField name="rememberMe" ... />\n` +
    `  <Button type="submit" className="w-full">Submit</Button>\n` +
    `</Form>`;

  const demo = (
    <div className="space-y-8">
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
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    error={fieldState.error?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            rules={{
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            }}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    error={fieldState.error?.message}
                  />
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
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Remember me</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </Form>
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
