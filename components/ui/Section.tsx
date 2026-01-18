// components/ui/Section.tsx
import React from "react";
import { cn } from "@/lib/utils/cn";

type GradientDirection = "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "accent" | "gradient";
  /** Vertical padding (py). Default: "none" - không thêm padding dọc */
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Horizontal padding (px). Default: "none" - không thêm padding ngang */
  paddingX?: "none" | "sm" | "md" | "lg" | "xl";
  /** Thêm container wrapper với mx-auto. Default: false */
  contained?: boolean;
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
  "to-r": "bg-linear-to-r",
  "to-l": "bg-linear-to-l",
  "to-b": "bg-linear-to-b",
  "to-t": "bg-linear-to-t",
  "to-br": "bg-linear-to-br",
  "to-bl": "bg-linear-to-bl",
  "to-tr": "bg-linear-to-tr",
  "to-tl": "bg-linear-to-tl",
};

const spacingClasses = {
  none: "",
  sm: "py-6",
  md: "py-8",
  lg: "py-12",
  xl: "py-16",
};

const paddingXClasses = {
  none: "",
  sm: "px-2 md:px-4",
  md: "px-4 md:px-6",
  lg: "px-6 md:px-8",
  xl: "px-8 md:px-12",
};

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      className,
      variant = "default",
      spacing = "none",
      paddingX = "none",
      contained = false,
      outlined = false,
      gradientFrom = "from-primary/20",
      gradientTo = "to-accent/20",
      gradientDirection = "to-br",
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      default: "bg-background",
      muted: "bg-muted/30",
      primary: "bg-primary/5",
      accent: "bg-accent/10",
      gradient: "",
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
          paddingXClasses[paddingX],
          outlined && "rounded-lg border border-border/60",
          contained && "container mx-auto",
          className,
        )}
        {...props}
      >
        {children}
      </section>
    );
  },
);

Section.displayName = "Section";

export default Section;
