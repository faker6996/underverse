export type FormControlSize = "sm" | "md" | "lg";

export const formControlSizeStyles = {
  sm: {
    control: "h-8 px-3 text-sm leading-none md:h-7 md:text-xs",
    compactControl: "h-8 px-2.5 text-sm leading-none md:h-7 md:text-xs",
    input: "h-8 px-3 text-sm leading-none md:h-7 md:text-xs",
    label: "text-xs",
    icon: "h-4 w-4 md:h-3.5 md:w-3.5",
    iconButton: "h-7 w-7 md:h-6 md:w-6",
    tag: "h-5 max-w-24 px-2 text-[10px] leading-none",
  },
  md: {
    control: "h-10 px-3 text-sm leading-none",
    compactControl: "h-10 px-3 text-sm leading-none",
    input: "h-10 px-4 text-sm leading-none",
    label: "text-sm",
    icon: "h-4 w-4",
    iconButton: "h-8 w-8",
    tag: "h-6 max-w-28 px-2 text-xs leading-none",
  },
  lg: {
    control: "h-12 px-4 text-base leading-none",
    compactControl: "h-12 px-4 text-base leading-none",
    input: "h-12 px-5 text-base leading-none",
    label: "text-base",
    icon: "h-5 w-5",
    iconButton: "h-10 w-10",
    tag: "h-7 max-w-32 px-2.5 text-sm leading-none",
  },
} as const;

export const formControlFixedClass = "min-h-0 overflow-hidden";
export const formControlValueClass = "max-h-full min-w-0 flex-1 truncate whitespace-nowrap";
