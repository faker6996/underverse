# Form

Source: `components/ui/Form.tsx`

Exports:
- Form
- FormField
- FormItem
- FormLabel
- FormControl
- FormDescription
- FormMessage
- FormInput
- FormCheckbox
- FormActions
- FormSubmitButton

Note: Usage snippets are minimal; fill required props from the props type below.

## Form

Props type: `FormWrapperProps`

```tsx
import { Form } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Form>
      Content
    </Form>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Form, FormInput, FormSubmitButton } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Form onSubmit={(values) => console.log(values)} className="space-y-3">
      <FormInput name="email" placeholder="Email" />
      <FormInput name="password" placeholder="Mat khau" type="password" />
      <FormSubmitButton variant="primary">Dang nhap</FormSubmitButton>
    </Form>
  );
}
```

```ts
// Form wrapper with validation support
interface FormWrapperProps<T extends FieldValues = FieldValues> {
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  initialValues?: Partial<T>;
  validationSchema?: Record<string, any>; // Simple validation schema
  className?: string;
  size?: "sm" | "md" | "lg"; // unify inner control sizes
}
```

## FormField

Props type: `ControllerProps<TFieldValues, TName>`

```tsx
import { FormField } from "@underverse-ui/underverse";

export function Example() {
  return <FormField />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@underverse-ui/underverse";
import { Input } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Form onSubmit={() => {}}>
      <FormField
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="Ho va ten" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

## FormItem

Props type: `React.HTMLAttributes<HTMLDivElement>`

```tsx
import { FormItem } from "@underverse-ui/underverse";

export function Example() {
  return <FormItem />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FormItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FormItem />
  );
}
```

## FormLabel

Props type: `React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }`

```tsx
import { FormLabel } from "@underverse-ui/underverse";

export function Example() {
  return <FormLabel />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FormLabel } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FormLabel />
  );
}
```

## FormControl

Props type: `React.HTMLAttributes<HTMLDivElement>`

```tsx
import { FormControl } from "@underverse-ui/underverse";

export function Example() {
  return <FormControl />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FormControl } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FormControl />
  );
}
```

## FormDescription

Props type: `React.HTMLAttributes<HTMLParagraphElement>`

```tsx
import { FormDescription } from "@underverse-ui/underverse";

export function Example() {
  return <FormDescription />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FormDescription } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FormDescription />
  );
}
```

## FormMessage

Props type: `React.HTMLAttributes<HTMLParagraphElement>`

```tsx
import { FormMessage } from "@underverse-ui/underverse";

export function Example() {
  return <FormMessage />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FormMessage } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FormMessage />
  );
}
```

## FormInput

Props type: `React.ComponentProps<typeof Input> & { name: string }`

```tsx
import { FormInput } from "@underverse-ui/underverse";

export function Example() {
  return <FormInput />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Form, FormInput } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Form onSubmit={() => {}}>
      <FormInput name="email" placeholder="Email" />
    </Form>
  );
}
```

## FormCheckbox

Props type: `React.ComponentProps<typeof Checkbox> & { name: string }`

```tsx
import { FormCheckbox } from "@underverse-ui/underverse";

export function Example() {
  return <FormCheckbox />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Form, FormCheckbox } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Form onSubmit={() => {}}>
      <FormCheckbox name="agree" label="Toi dong y dieu khoan" />
    </Form>
  );
}
```

## FormActions

Props type: `React.HTMLAttributes<HTMLDivElement>`

```tsx
import { FormActions } from "@underverse-ui/underverse";

export function Example() {
  return <FormActions />;
}
```

Vi du day du:

```tsx
import React from "react";
import { FormActions } from "@underverse-ui/underverse";

export function Example() {
  return (
    <FormActions />
  );
}
```

## FormSubmitButton

Props type: `React.ComponentProps<typeof Button> & { loading?: boolean }`

```tsx
import { FormSubmitButton } from "@underverse-ui/underverse";

export function Example() {
  return <FormSubmitButton />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Form, FormSubmitButton } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Form onSubmit={() => {}}>
      <FormSubmitButton variant="primary">Luu</FormSubmitButton>
    </Form>
  );
}
```
