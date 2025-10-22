"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormActions, FormSubmitButton } from "@/components/ui/Form";
import Input, { PasswordInput } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";

type Values = {
  name: string;
  email: string;
  password: string;
};

export default function FormAdvancedExample() {
  const methods = useForm<Values>({
    defaultValues: { name: "", email: "", password: "" },
    mode: "onBlur"
  });
  const [size, setSize] = React.useState<"sm"|"md"|"lg">("md");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (v: Values) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    alert(`Submitted: ${JSON.stringify(v, null, 2)}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Form size:</span>
        {(["sm","md","lg"] as const).map(s => (
          <Button key={s} variant={size===s?"primary":"outline"} size="sm" onClick={()=>setSize(s)}>{s}</Button>
        ))}
      </div>

      <Form onSubmit={methods.handleSubmit(onSubmit)} size={size} className="space-y-4">
        <FormField
          control={methods.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your name" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="email"
          rules={{ required: "Email is required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="you@example.com" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
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
          <FormSubmitButton loading={loading} variant="primary">Submit</FormSubmitButton>
        </FormActions>
      </Form>

      <CodeBlock code={`import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@underverse-ui/underverse'\n\n<Form onSubmit={handleSubmit(onSubmit)} size='md'>\n  <FormField name='email' rules={{ required: 'Email is required' }} render={({field}) => (\n    <FormItem>\n      <FormLabel>Email</FormLabel>\n      <FormControl><Input type='email' {...field} /></FormControl>\n      <FormMessage />\n    </FormItem>\n  )} />\n</Form>`} />
    </div>
  );
}

