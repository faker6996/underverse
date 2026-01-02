// components/ui/Section.tsx
import React from "react";
import { cn } from "@/lib/utils/cn";

type GradientDirection = "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "accent" | "gradient";
  spacing?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Hiển thị viền mỏng xám nhạt giống Card */
  outlined?: boolean;
  /** Gradient start color (Tailwind class like 'from-purple-500') */
  gradientFrom?: string;
  /** Gradient end color (Tailwind class like 'to-pink-500') */
  gradientTo?: string;
  /** Gradient direction */
  gradientDirection?: GradientDirection;
}

const gradientDirectionMap: Record<GradientDirection, string> = {
  "to-r": "bg-gradient-to-r",
  "to-l": "bg-gradient-to-l",
  "to-b": "bg-gradient-to-b",
  "to-t": "bg-gradient-to-t",
  "to-br": "bg-gradient-to-br",
  "to-bl": "bg-gradient-to-bl",
  "to-tr": "bg-gradient-to-tr",
  "to-tl": "bg-gradient-to-tl",
};

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      className,
      variant = "default",
      spacing = "lg",
      fullWidth = false,
      outlined = false,
      gradientFrom = "from-primary/20",
      gradientTo = "to-accent/20",
      gradientDirection = "to-br",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "bg-background",
      muted: "bg-muted/30",
      primary: "bg-primary/5",
      accent: "bg-accent/10",
      gradient: "",
    };

    const spacingClasses = {
      sm: "py-6",
      md: "py-8",
      lg: "py-12",
      xl: "py-16",
    };

    const getGradientClasses = () => {
      if (variant !== "gradient") return "";
      return cn(gradientDirectionMap[gradientDirection], gradientFrom, gradientTo);
    };

    return (
      <section
        ref={ref}
        className={cn(
          variant === "gradient" ? getGradientClasses() : variantClasses[variant],
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
