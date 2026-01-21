"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronRight } from "lucide-react";

type Variant = "plain" | "outlined" | "soft" | "bordered" | "card" | "flush" | "striped";
type Size = "xs" | "sm" | "md" | "lg";

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  as?: "ul" | "ol" | "div";
  ordered?: boolean;
  variant?: Variant;
  size?: Size;
  divided?: boolean;
  inset?: boolean; // inner padding around items
  hoverable?: boolean;
  /** Show loading skeleton */
  loading?: boolean;
  /** Number of skeleton items to show */
  loadingCount?: number;
  /** Show empty state when no children */
  emptyText?: string;
  /** Make items more compact */
  dense?: boolean;
  /** Class name customization for all list items */
  itemClassName?: string;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  as?: "li" | "div" | "a" | "button";
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  /** Show avatar on the left */
  avatar?: string | React.ReactNode;
  /** Show badge/tag */
  badge?: React.ReactNode;
  /** Badge color variant */
  badgeVariant?: "default" | "success" | "warning" | "error" | "info";
  /** Action button on hover */
  action?: React.ReactNode;
  /** Make item collapsible */
  collapsible?: boolean;
  /** Expanded state for collapsible */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Content to show when expanded */
  expandContent?: React.ReactNode;
  /** Custom class for inner content container (use for padding) */
  contentClassName?: string;
}

// REMOVED 'itemPad' and 'densePad' to allow custom padding
const SIZE_STYLES: Record<Size, { label: string; desc: string; icon: string; avatar: string }> = {
  xs: { label: "text-xs", desc: "text-[11px]", icon: "h-3.5 w-3.5", avatar: "h-6 w-6" },
  sm: { label: "text-[13px]", desc: "text-[12px]", icon: "h-4 w-4", avatar: "h-8 w-8" },
  md: { label: "text-sm", desc: "text-xs", icon: "h-5 w-5", avatar: "h-10 w-10" },
  lg: { label: "text-base", desc: "text-sm", icon: "h-5 w-5", avatar: "h-12 w-12" },
};

const BADGE_VARIANTS = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

// Skeleton component for loading state
const ListItemSkeleton: React.FC<{ size: Size }> = ({ size }) => {
  const sz = SIZE_STYLES[size];
  // Re-added padding for skeleton to look decent, or should we remove it too?
  // Let's keep minimal padding for skeleton or user has to style it?
  // Let's use a default padding for skeleton just so it's visible.
  return (
    <div className={cn("flex items-center gap-3 animate-pulse p-2")}>
      <div className={cn("rounded-full bg-muted shrink-0", sz.avatar)} />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded-md w-3/4" />
        <div className="h-3 bg-muted rounded-md w-1/2" />
      </div>
    </div>
  );
};

const ListRoot = React.forwardRef<HTMLUListElement, ListProps>(
  (
    {
      as = "ul",
      ordered,
      variant = "plain",
      size = "md",
      divided = false,
      inset = false,
      hoverable = true,
      loading = false,
      loadingCount = 3,
      emptyText,
      dense = false,
      className,
      itemClassName, // New prop
      children,
      ...rest
    },
    ref,
  ) => {
    const Comp: any = ordered ? "ol" : as;
    const childCount = React.Children.count(children);
    const hasChildren = childCount > 0;

    // Variant styles
    const variantClasses = {
      plain: "",
      outlined: "rounded-2xl md:rounded-3xl bg-card text-card-foreground border border-border shadow-sm",
      soft: "rounded-2xl md:rounded-3xl bg-muted/40 border border-border/60",
      bordered: "border border-border rounded-2xl md:rounded-3xl",
      card: "rounded-2xl md:rounded-3xl bg-card shadow-md border border-border",
      flush: "",
      striped: "rounded-2xl md:rounded-3xl border border-border overflow-hidden",
    };

    // Loading state
    if (loading) {
      return (
        <Comp
          ref={ref}
          className={cn("group/list", variantClasses[variant], inset && "p-1.5 md:p-2", divided && "divide-y divide-border/60", className)}
          {...rest}
        >
          {Array.from({ length: loadingCount }).map((_, i) => (
            <ListItemSkeleton key={i} size={size} />
          ))}
        </Comp>
      );
    }

    // Empty state
    if (!hasChildren && emptyText) {
      return (
        <Comp ref={ref} className={cn("group/list", variantClasses[variant], inset && "p-1.5 md:p-2", className)} {...rest}>
          <div className="text-center py-8 text-muted-foreground text-sm">{emptyText}</div>
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          "group/list",
          variantClasses[variant],
          inset && "p-1.5 md:p-2",
          divided && "divide-y divide-border/60",
          variant === "striped" && "[&>*:nth-child(even)]:bg-muted/30",
          className,
        )}
        {...rest}
      >
        {React.Children.map(children, (child, idx) => {
          if (!React.isValidElement(child)) return child;
          const childClass = cn(
            (child.props as any)?.className,
            hoverable && variant !== "flush" && "hover:bg-accent/50 focus:bg-accent/60 focus:outline-none transition-colors",
            variant === "flush" && "hover:bg-accent/30",
          );

          // Pass itemClassName to children as contentClassName if it's a ListItem?
          // No, ListItem expects contentClassName for inner.
          // If we pass className to ListItem, it goes to wrapper.
          // Let's assume itemClassName is for the inner content mostly?
          // Or let's pass it as contentClassName to ListItem.

          return React.cloneElement(child as any, {
            className: childClass,
            // Pass global item class to contentClassName of ListItem
            contentClassName: cn(itemClassName, (child.props as any)?.contentClassName),
            "data-first": idx === 0 ? "true" : undefined,
            "data-last": idx === childCount - 1 ? "true" : undefined,
            "data-size": size,
            "data-dense": dense ? "true" : undefined,
          });
        })}
      </Comp>
    );
  },
);

ListRoot.displayName = "List";

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      as = "li",
      selected = false,
      disabled = false,
      href,
      label,
      description,
      leftIcon: Left,
      rightIcon: Right,
      avatar,
      badge,
      badgeVariant = "default",
      action,
      collapsible = false,
      expanded: controlledExpanded,
      onExpandChange,
      expandContent,
      className,
      contentClassName,
      children,
      ...rest
    },
    ref,
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState(false);
    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const sizeAttr = (rest as any)["data-size"] as Size | undefined;
    const resolvedSize: Size = sizeAttr && ["xs", "sm", "md", "lg"].includes(sizeAttr) ? sizeAttr : "md";
    const sz = SIZE_STYLES[resolvedSize];

    // No default padding anymore!
    // User must provide padding via contentClassName

    const toggleExpanded = () => {
      const newExpanded = !isExpanded;
      if (onExpandChange) {
        onExpandChange(newExpanded);
      } else {
        setInternalExpanded(newExpanded);
      }
    };

    const headerProps = collapsible
      ? {
          role: "button" as const,
          tabIndex: disabled ? -1 : 0,
          onClick: disabled ? undefined : () => toggleExpanded(),
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleExpanded();
            }
          },
        }
      : {};

    const inner = (
      <>
        <div className={cn("flex items-center gap-3", contentClassName, "group/item relative")} {...headerProps}>
          {/* Avatar */}
          {avatar && (
            <div className={cn("shrink-0", sz.avatar)}>
              {typeof avatar === "string" ? <img src={avatar} alt="" className={cn("rounded-full object-cover", sz.avatar)} /> : avatar}
            </div>
          )}

          {/* Left Icon */}
          {Left && !avatar && (
            <span className={cn("text-muted-foreground shrink-0", sz.icon)}>
              <Left className={cn(sz.icon)} />
            </span>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {label && <div className={cn(sz.label, "text-foreground font-medium truncate")}>{label}</div>}
              {badge && (
                <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0", BADGE_VARIANTS[badgeVariant])}>{badge}</span>
              )}
            </div>
            {description && <div className={cn(sz.desc, "text-muted-foreground truncate mt-0.5")}>{description}</div>}
            {children && <div className="mt-1">{children}</div>}
          </div>

          {/* Action Button */}
          {action && <div className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">{action}</div>}

          {/* Right Icon or Collapsible Icon */}
          {collapsible ? (
            <span
              className={cn("text-muted-foreground shrink-0 transition-transform cursor-pointer select-none", sz.icon, isExpanded && "rotate-90")}
            >
              <ChevronRight className={cn(sz.icon)} />
            </span>
          ) : (
            Right && (
              <span className={cn("text-muted-foreground shrink-0", sz.icon)}>
                <Right className={cn(sz.icon)} />
              </span>
            )
          )}
        </div>

        {/* Expanded Content - padding also removed here? */}
        {collapsible && isExpanded && expandContent && (
          <div className={cn("border-t border-border/50 bg-muted/20", contentClassName, "pt-3")}>{expandContent}</div>
        )}
      </>
    );

    const baseCls = cn("relative w-full", selected && "bg-primary/10 ring-1 ring-primary/30", disabled && "opacity-60 cursor-not-allowed", className);

    if (href) {
      const A: any = as === "a" ? "a" : "a";
      return (
        <A ref={ref as any} href={href} className={cn(baseCls, "block")} {...(rest as any)}>
          {inner}
        </A>
      );
    }
    if (as === "button" && !collapsible) {
      return (
        <button ref={ref as any} type="button" className={cn(baseCls, "text-left block w-full")} {...(rest as any)}>
          {inner}
        </button>
      );
    }
    if (collapsible) {
      return (
        <div ref={ref as any} className={cn(baseCls, "text-left block w-full")} {...(rest as any)}>
          {inner}
        </div>
      );
    }
    const Comp: any = as;
    return (
      <Comp ref={ref as any} className={baseCls} {...rest}>
        {inner}
      </Comp>
    );
  },
);

ListItem.displayName = "List.Item";

const List = Object.assign(ListRoot, { Item: ListItem });

export default List;
