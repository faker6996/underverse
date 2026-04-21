import React from "react";
import { cn } from "../utils/cn";

type GradientDirection = "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl";

/** Public props for the `Section` component. */
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  /** Override tag. Default: "section" */
  as?: React.ElementType;
  variant?: "default" | "muted" | "primary" | "accent" | "gradient";
  /** Vertical padding (py). Default: "none" */
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Horizontal padding (px). Default: "none" */
  paddingX?: "none" | "sm" | "md" | "lg" | "xl";
  /** Thêm inner container wrapper với mx-auto – background vẫn full-width */
  contained?: boolean;
  /** className áp lên inner container khi contained=true */
  containerClassName?: string;
  /** Hiển thị viền mỏng xám nhạt giống Card */
  outlined?: boolean;
  /** Gradient start color (CSS color value, e.g. "oklch(0.7 0.15 280 / 20%)") */
  gradientFrom?: string;
  /** Gradient end color */
  gradientTo?: string;
  /** Gradient direction */
  gradientDirection?: GradientDirection;
}

const gradientDirectionMap: Record<GradientDirection, string> = {
  "to-r":  "to right",
  "to-l":  "to left",
  "to-b":  "to bottom",
  "to-t":  "to top",
  "to-br": "to bottom right",
  "to-bl": "to bottom left",
  "to-tr": "to top right",
  "to-tl": "to top left",
};

const spacingClasses = {
  none: "",
  sm: "py-6 max-md:py-4",
  md: "py-8 max-md:py-6",
  lg: "py-12 max-md:py-8",
  xl: "py-16 max-md:py-10",
};

const paddingXClasses = {
  none: "",
  sm: "px-3 md:px-4",
  md: "px-4 md:px-6",
  lg: "px-5 md:px-8",
  xl: "px-6 md:px-12",
};

const variantClasses = {
  default: "bg-background",
  muted:   "bg-muted/30",
  primary: "bg-primary/5",
  accent:  "bg-accent/10",
  gradient: "",
};

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      className,
      as: Tag = "section",
      variant = "default",
      spacing = "none",
      paddingX = "none",
      contained = false,
      containerClassName,
      outlined = false,
      gradientFrom = "oklch(0.7 0.15 280 / 20%)",
      gradientTo   = "oklch(0.7 0.2 200 / 20%)",
      gradientDirection = "to-br",
      style,
      ...props
    },
    ref,
  ) => {
    const gradientStyle: React.CSSProperties =
      variant === "gradient"
        ? { backgroundImage: `linear-gradient(${gradientDirectionMap[gradientDirection]}, ${gradientFrom}, ${gradientTo})` }
        : {};

    return (
      <Tag
        ref={ref}
        className={cn(
          variant !== "gradient" && variantClasses[variant],
          spacingClasses[spacing],
          !contained && paddingXClasses[paddingX],
          outlined && "rounded-2xl md:rounded-3xl border border-border/60 max-md:rounded-xl",
          className,
        )}
        style={{ ...gradientStyle, ...style }}
        {...props}
      >
        {contained ? (
          <div className={cn("container mx-auto", paddingXClasses[paddingX], containerClassName)}>
            {children}
          </div>
        ) : (
          children
        )}
      </Tag>
    );
  },
);

Section.displayName = "Section";

export default Section;
