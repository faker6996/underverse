"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../utils/cn"
import { formControlLabelClass } from "../constants/form-control-size"

const labelVariants = cva(
  `text-sm ${formControlLabelClass} leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`
)

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
