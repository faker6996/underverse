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
}

const SIZE_STYLES: Record<Size, { itemPad: string; densePad: string; label: string; desc: string; icon: string; avatar: string }> = {
  xs: { itemPad: "px-2 py-1.5", densePad: "px-2 py-1", label: "text-xs", desc: "text-[11px]", icon: "h-3.5 w-3.5", avatar: "h-6 w-6" },
  sm: { itemPad: "px-3 py-2", densePad: "px-3 py-1.5", label: "text-[13px]", desc: "text-[12px]", icon: "h-4 w-4", avatar: "h-8 w-8" },
  md: { itemPad: "px-4 py-2.5", densePad: "px-4 py-2", label: "text-sm", desc: "text-xs", icon: "h-5 w-5", avatar: "h-10 w-10" },
  lg: { itemPad: "px-5 py-3", densePad: "px-5 py-2.5", label: "text-base", desc: "text-sm", icon: "h-5 w-5", avatar: "h-12 w-12" },
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
  return (
    <div className={cn("flex items-center gap-3 animate-pulse", sz.itemPad)}>
      <div className={cn("rounded-full bg-muted shrink-0", sz.avatar)} />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
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
      children,
      ...rest
    },
    ref
  ) => {
    const Comp: any = ordered ? "ol" : as;
    const childCount = React.Children.count(children);
    const hasChildren = childCount > 0;

    // Variant styles
    const variantClasses = {
      plain: "",
      outlined: "rounded-lg md:rounded-xl bg-card text-card-foreground border border-border shadow-sm",
      soft: "rounded-lg bg-muted/40 border border-border/60",
      bordered: "border border-border rounded-lg",
      card: "rounded-lg bg-card shadow-md border border-border",
      flush: "",
      striped: "rounded-lg border border-border overflow-hidden",
    };

    // Loading state
    if (loading) {
      return (
        <Comp ref={ref} className={cn("group/list", variantClasses[variant], inset && "p-1.5 md:p-2", divided && "divide-y divide-border/60", className)} {...rest}>
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
          className
        )}
        {...rest}
      >
        {React.Children.map(children, (child, idx) => {
          if (!React.isValidElement(child)) return child;
          const childClass = cn(
            (child.props as any)?.className,
            hoverable && variant !== "flush" && "hover:bg-accent/50 focus:bg-accent/60 focus:outline-none transition-colors",
            variant === "flush" && "hover:bg-accent/30"
          );
          return React.cloneElement(child as any, {
            className: childClass,
            "data-first": idx === 0 ? "true" : undefined,
            "data-last": idx === childCount - 1 ? "true" : undefined,
            "data-size": size,
            "data-dense": dense ? "true" : undefined,
          });
        })}
      </Comp>
    );
  }
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
      children,
      ...rest
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState(false);
    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const sizeAttr = (rest as any)["data-size"] as Size | undefined;
    const denseAttr = (rest as any)["data-dense"] as string | undefined;
    const isDense = denseAttr === "true";
    const resolvedSize: Size = sizeAttr && (sizeAttr === "xs" || sizeAttr === "sm" || sizeAttr === "md" || sizeAttr === "lg") ? sizeAttr : "md";
    const sz = SIZE_STYLES[resolvedSize];
    const padding = isDense ? sz.densePad : sz.itemPad;

    const toggleExpanded = () => {
      const newExpanded = !isExpanded;
      if (onExpandChange) {
        onExpandChange(newExpanded);
      } else {
        setInternalExpanded(newExpanded);
      }
    };

    const inner = (
      <>
        <div className={cn("flex items-center gap-3", padding, "group/item relative")}>
          {/* Avatar */}
          {avatar && (
            <div className={cn("shrink-0", sz.avatar)}>
              {typeof avatar === "string" ? (
                <img src={avatar} alt="" className={cn("rounded-full object-cover", sz.avatar)} />
              ) : (
                avatar
              )}
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
              role="button"
              aria-label="Toggle"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded();
                }
              }}
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

        {/* Expanded Content */}
        {collapsible && isExpanded && expandContent && (
          <div className={cn("border-t border-border/50 bg-muted/20", padding, "pt-3")}>{expandContent}</div>
        )}
      </>
    );

    const baseCls = cn(
      "relative w-full",
      selected && "bg-primary/10 ring-1 ring-primary/30",
      disabled && "opacity-60 cursor-not-allowed",
      className
    );

    if (href) {
      const A: any = as === "a" ? "a" : "a";
      return (
        <A ref={ref as any} href={href} className={cn(baseCls, "block")} {...(rest as any)}>
          {inner}
        </A>
      );
    }
    if (as === "button" || collapsible) {
      return (
        <button
          ref={ref as any}
          type="button"
          className={cn(baseCls, "text-left block w-full")}
          onClick={collapsible ? toggleExpanded : undefined}
          {...(rest as any)}
        >
          {inner}
        </button>
      );
    }
    const Comp: any = as;
    return (
      <Comp ref={ref as any} className={baseCls} {...rest}>
        {inner}
      </Comp>
    );
  }
);

ListItem.displayName = "List.Item";

const List = Object.assign(ListRoot, { Item: ListItem });

export default List;
