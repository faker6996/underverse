export const formControlSizeStyles = {
  xs: {
    control: "h-6 px-2 text-xs leading-none",
    compactControl: "h-6 px-2 text-xs leading-none",
    input: "h-6 px-2 text-xs leading-none",
    label: "text-xs",
    icon: "h-3.5 w-3.5",
    iconButton: "h-6 w-6",
    tag: "h-4 max-w-20 px-1.5 text-[10px] leading-none",
  },
  sm: {
    control: "h-8 px-3 text-sm leading-none",
    compactControl: "h-8 px-2.5 text-sm leading-none",
    input: "h-8 px-3 text-sm leading-none",
    label: "text-xs",
    icon: "h-4 w-4 md:h-3.5 md:w-3.5",
    iconButton: "h-7 w-7 md:h-6 md:w-6",
    tag: "h-5 max-w-24 px-2 text-[10px] leading-none",
  },
  md: {
    control: "h-10 px-4 text-sm leading-none",
    compactControl: "h-10 px-3 text-sm leading-none",
    input: "h-10 px-4 text-sm leading-none",
    label: "text-sm",
    icon: "h-4 w-4",
    iconButton: "h-8 w-8",
    tag: "h-6 max-w-28 px-2 text-xs leading-none",
  },
  lg: {
    control: "h-12 px-6 text-base leading-none",
    compactControl: "h-12 px-4 text-base leading-none",
    input: "h-12 px-5 text-base leading-none",
    label: "text-base",
    icon: "h-5 w-5",
    iconButton: "h-10 w-10",
    tag: "h-7 max-w-32 px-2.5 text-sm leading-none",
  },
  xl: {
    control: "h-14 px-8 text-base leading-none",
    compactControl: "h-14 px-5 text-base leading-none",
    input: "h-14 px-6 text-base leading-none",
    label: "text-base",
    icon: "h-5 w-5",
    iconButton: "h-12 w-12",
    tag: "h-8 max-w-36 px-3 text-sm leading-none",
  },
} as const;

export type FormControlSize = keyof typeof formControlSizeStyles;

/**
 * Shared visual weight for labels attached to form controls.
 *
 * Keep this separate from the size map so every label renderer—including
 * inline control labels that cannot render the shared `<Label>` primitive—
 * follows the same typography contract.
 */
export const formControlLabelClass = "font-medium";

export const formControlFixedClass = "min-h-0 overflow-hidden";
export const formControlValueClass = "max-h-full min-w-0 flex-1 truncate whitespace-nowrap";
export const formControlOutlineClass = "border border-input hover:border-primary/40 focus-visible:outline-none focus-visible:border-ring";
export const formControlGroupOutlineClass = "border border-input hover:border-primary/40 focus-within:border-ring";
