"use client";

import * as React from "react";
// Remove radix-ui imports as they are no longer needed
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext, useForm, SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";
import { Label } from "@/components/ui/label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/CheckBox";

// Form wrapper with validation support
interface FormWrapperProps<T extends FieldValues = FieldValues> {
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  initialValues?: Partial<T>;
  validationSchema?: Record<string, any>; // Simple validation schema
  className?: string;
  size?: "sm" | "md" | "lg"; // unify inner control sizes
}

// Provide form-level config (e.g., size) to inner controls
type FormConfig = { size: "sm" | "md" | "lg" };
const FormConfigContext = React.createContext<FormConfig>({ size: "md" });

const FormWrapper = <T extends FieldValues = FieldValues>({
  children,
  onSubmit,
  initialValues,
  validationSchema,
  className,
  size = "md",
  ...props
}: FormWrapperProps<T>) => {
  const methods = useForm<T>({
    defaultValues: initialValues as any,
  });

  // Keep form in sync when initialValues change
  React.useEffect(() => {
    if (initialValues) {
      methods.reset(initialValues as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // Extract DOM-unsafe props  
  const { validationSchema: _, ...formProps } = props as any;

  return (
    <FormProvider {...methods}>
      <FormConfigContext.Provider value={{ size }}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className={className} {...formProps}>
          {children}
        </form>
      </FormConfigContext.Provider>
    </FormProvider>
  );
};

// For backward compatibility, let Form be the wrapper by default
const Form = FormWrapper;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    // Only access i18n when we actually need the message, to avoid
    // requiring the 'Form' namespace in all consumers.
    try {
      const t = useTranslations("Form");
      throw new Error(t("validation.mustBeUsedWithinForm"));
    } catch {
      throw new Error("useFormField must be used within FormField");
    }
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

type FormItemContextValue = {
  id: string;
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  const config = React.useContext(FormConfigContext);
  const sizeClass = config.size === "sm" ? "text-xs" : config.size === "lg" ? "text-base" : "text-sm";

  return <Label ref={ref} className={cn(sizeClass, error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// Additional form components for compatibility
const FormInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { name: string }
>(({ name, ...props }, ref) => (
  <FormConfigContext.Consumer>
    {({ size }) => (
      <FormField
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input size={props.size ?? size} {...field} {...props} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
  </FormConfigContext.Consumer>
));
FormInput.displayName = "FormInput";

const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Checkbox> & { name: string }
>(({ name, ...props }, ref) => (
  <FormConfigContext.Consumer>
    {({ size }) => (
      <FormField
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Checkbox
                ref={ref}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                labelClassName={cn(
                  // align label text size with inputs/buttons by form size
                  size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
                  (props as any).labelClassName
                )}
                {...props}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
  </FormConfigContext.Consumer>
));
FormCheckbox.displayName = "FormCheckbox";

const FormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex gap-2 justify-end", className)} {...props} />
));
FormActions.displayName = "FormActions";

const FormSubmitButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { loading?: boolean }
>(({ children, loading, ...props }, ref) => (
  <FormConfigContext.Consumer>
    {({ size }) => (
      <Button ref={ref} type="submit" size={(props.size as any) ?? size} disabled={loading} {...props}>
        {children}
      </Button>
    )}
  </FormConfigContext.Consumer>
));
FormSubmitButton.displayName = "FormSubmitButton";

export { 
  useFormField, 
  Form, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormMessage,
  FormInput,
  FormCheckbox,
  FormActions,
  FormSubmitButton
};
