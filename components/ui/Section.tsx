// components/ui/Section.tsx
import React from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  spacing?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Hiển thị viền mỏng xám nhạt giống Card */
  outlined?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      className,
      variant = "default",
      spacing = "lg",
      fullWidth = false,
      outlined = false,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "bg-background",
      muted: "bg-muted/30",
      primary: "bg-primary/5",
      accent: "bg-accent/10",
    };

    const spacingClasses = {
      sm: "py-6",
      md: "py-8",
      lg: "py-12",
      xl: "py-16",
    };

    return (
      <section
        ref={ref}
        className={cn(
          variantClasses[variant],
          spacingClasses[spacing],
          outlined && "rounded-lg border border-border/60",
          !fullWidth && "container mx-auto px-4 md:px-6",
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export default Section;
