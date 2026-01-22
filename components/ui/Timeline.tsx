"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

type Align = "left" | "right" | "alternate";
type Variant = "default" | "outlined" | "card" | "minimal" | "modern" | "gradient";
type Size = "sm" | "md" | "lg" | "xl";
type Mode = "vertical" | "horizontal";
type LineStyle = "solid" | "dashed" | "dotted";

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: Align;
  variant?: Variant;
  size?: Size;
  mode?: Mode;
  lineColor?: string;
  lineStyle?: LineStyle;
  items?: TimelineItemProps[];
  itemClassName?: string;
  /** Animate items on mount */
  animate?: boolean;
  /** Compact spacing */
  dense?: boolean;
  /** Show connecting line */
  showLine?: boolean;
}

export interface TimelineItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  status?: "default" | "primary" | "success" | "warning" | "error" | "info";
  // Override dot and line color
  color?: string;
  // Mark current/active step
  active?: boolean;
  /** Custom dot content */
  dot?: React.ReactNode;
  /** Make item collapsible */
  collapsible?: boolean;
  /** Expanded state for collapsible */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Content to show when expanded */
  expandContent?: React.ReactNode;
  /** Custom badge/tag */
  badge?: React.ReactNode;
}

const SIZE_STYLE: Record<
  Size,
  { dot: string; iconDot: string; padY: string; densePadY: string; title: string; desc: string; time: string; icon: string }
> = {
  sm: {
    dot: "h-2.5 w-2.5",
    iconDot: "h-6 w-6",
    padY: "py-3",
    densePadY: "py-2",
    title: "text-sm",
    desc: "text-xs",
    time: "text-[11px]",
    icon: "h-3.5 w-3.5",
  },
  md: {
    dot: "h-3 w-3",
    iconDot: "h-8 w-8",
    padY: "py-4",
    densePadY: "py-2.5",
    title: "text-base",
    desc: "text-sm",
    time: "text-xs",
    icon: "h-4 w-4",
  },
  lg: {
    dot: "h-3.5 w-3.5",
    iconDot: "h-10 w-10",
    padY: "py-5",
    densePadY: "py-3",
    title: "text-lg",
    desc: "text-sm",
    time: "text-xs",
    icon: "h-5 w-5",
  },
  xl: {
    dot: "h-4 w-4",
    iconDot: "h-12 w-12",
    padY: "py-6",
    densePadY: "py-3.5",
    title: "text-xl",
    desc: "text-base",
    time: "text-sm",
    icon: "h-6 w-6",
  },
};

const STATUS_COLOR: Record<NonNullable<TimelineItemProps["status"]>, string> = {
  default: "bg-muted/60",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  info: "bg-info",
};

const TimelineContext = React.createContext<{
  align: Align;
  variant: Variant;
  size: Size;
  mode: Mode;
  lineColor?: string;
  lineStyle: LineStyle;
  itemClassName?: string;
  animate: boolean;
  dense: boolean;
  showLine: boolean;
} | null>(null);

const LINE_STYLE_MAP: Record<LineStyle, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

const Marker: React.FC<{
  index: number;
  last: boolean;
  size: Size;
  color?: string;
  status?: TimelineItemProps["status"];
  lineColor?: string;
  lineStyle: LineStyle;
  active?: boolean;
  dot?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  showLine: boolean;
}> = ({ index, last, size, color, status = "default", lineColor, lineStyle, active, dot, icon: Icon, showLine }) => {
  const sz = SIZE_STYLE[size];
  const dotColor = color ? `background:${color}` : undefined;
  const cls = color ? undefined : STATUS_COLOR[status];

  return (
    <div className="flex flex-col items-center">
      {/* Dot */}
      {dot ? (
        <div className="flex items-center justify-center">{dot}</div>
      ) : Icon ? (
        <div
          className={cn("rounded-full ring-2 ring-background flex items-center justify-center", sz.iconDot, cls, active && "ring-primary/40 ring-4")}
          style={dotColor ? ({ background: color } as React.CSSProperties) : undefined}
        >
          <Icon className={cn("text-white", sz.icon)} />
        </div>
      ) : (
        <div
          className={cn("rounded-full ring-2 ring-background", sz.dot, cls, active && "ring-primary/40 ring-4 scale-125")}
          style={dotColor ? ({ background: color } as React.CSSProperties) : undefined}
        />
      )}
      {/* Line */}
      {!last && showLine && (
        <div className={cn("flex-1 border-l-2", LINE_STYLE_MAP[lineStyle])} style={{ borderColor: lineColor || "hsl(var(--border))" }} />
      )}
    </div>
  );
};

const TimelineRoot = React.forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      align = "left",
      variant = "default",
      size = "md",
      mode = "vertical",
      lineColor,
      lineStyle = "solid",
      items,
      itemClassName,
      animate = false,
      dense = false,
      showLine = true,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const content = items
      ? items.map((it, i) => (
          <TimelineItem key={i} {...it} className={cn(itemClassName, it.className)} data-index={i} data-last={i === (items?.length ?? 0) - 1} />
        ))
      : children;

    return (
      <TimelineContext.Provider value={{ align, variant, size, mode, lineColor, lineStyle, itemClassName, animate, dense, showLine }}>
        <div
          ref={ref}
          className={cn("relative", mode === "horizontal" && "flex gap-4 overflow-x-auto", mode === "vertical" && "space-y-0", className)}
          {...rest}
        >
          {mode === "vertical" ? <div className="space-y-0">{content}</div> : content}
        </div>
      </TimelineContext.Provider>
    );
  },
);

TimelineRoot.displayName = "Timeline";

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  (
    {
      title,
      description,
      time,
      icon: Icon,
      status = "default",
      color,
      active = false,
      dot,
      collapsible = false,
      expanded: controlledExpanded,
      onExpandChange,
      expandContent,
      badge,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const ctx = React.useContext(TimelineContext)!;
    const idx = (rest as any)["data-index"] as number | undefined;
    const isLast = Boolean((rest as any)["data-last"]);
    const sz = SIZE_STYLE[ctx.size];
    const [internalExpanded, setInternalExpanded] = React.useState(false);
    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const toggleExpanded = () => {
      const newExpanded = !isExpanded;
      if (onExpandChange) {
        onExpandChange(newExpanded);
      } else {
        setInternalExpanded(newExpanded);
      }
    };

    const padding = ctx.dense ? sz.densePadY : sz.padY;

    // Variant styles for content box
    const variantClasses = {
      default: "",
      outlined: "rounded-xl border border-border bg-card shadow-sm px-4 py-3",
      card: "rounded-2xl border border-border bg-card shadow-md px-5 py-4",
      minimal: "border-l-2 pl-4 py-2",
      modern: "rounded-xl bg-linear-to-r from-card to-muted/20 border border-border/50 px-5 py-4 backdrop-blur-sm",
      gradient: "rounded-2xl bg-linear-to-br from-primary/10 via-card to-accent/10 border border-primary/20 px-5 py-4 shadow-lg",
    };

    const contentBox = (
      <div className={cn("min-w-0 flex-1", variantClasses[ctx.variant])}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {title && (
              <div className="flex items-center gap-2">
                <div className={cn("font-semibold text-foreground", sz.title)}>{title}</div>
                {badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">{badge}</span>}
              </div>
            )}
            {description && <div className={cn("text-muted-foreground mt-1", sz.desc)}>{description}</div>}
            {children && <div className="mt-2">{children}</div>}
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={toggleExpanded}
              className={cn("text-muted-foreground hover:text-foreground transition-transform p-1", isExpanded && "rotate-180")}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
        {time && <div className={cn("mt-2 text-muted-foreground flex items-center gap-1", sz.time)}>{time}</div>}
        {/* Expanded Content */}
        {collapsible && isExpanded && expandContent && <div className="mt-3 pt-3 border-t border-border/50 text-sm">{expandContent}</div>}
      </div>
    );

    const markerWidth = Icon || dot ? "w-auto" : "w-6";

    const leftSide = (
      <div
        className={cn("flex items-stretch gap-4", padding, ctx.animate && "animate-in slide-in-from-left duration-500")}
        style={{ animationDelay: ctx.animate ? `${(idx ?? 0) * 100}ms` : undefined }}
      >
        <div className={cn("shrink-0 flex items-stretch", markerWidth)}>
          <Marker
            index={idx ?? 0}
            last={isLast}
            size={ctx.size}
            color={color}
            status={status}
            lineColor={ctx.lineColor}
            lineStyle={ctx.lineStyle}
            active={active}
            dot={dot}
            icon={Icon}
            showLine={ctx.showLine}
          />
        </div>
        <div className="flex-1">{contentBox}</div>
      </div>
    );

    const rightSide = (
      <div
        className={cn("flex items-stretch gap-4", padding, ctx.animate && "animate-in slide-in-from-right duration-500")}
        style={{ animationDelay: ctx.animate ? `${(idx ?? 0) * 100}ms` : undefined }}
      >
        <div className="flex-1 flex justify-end">{contentBox}</div>
        <div className={cn("shrink-0 flex items-stretch", markerWidth)}>
          <Marker
            index={idx ?? 0}
            last={isLast}
            size={ctx.size}
            color={color}
            status={status}
            lineColor={ctx.lineColor}
            lineStyle={ctx.lineStyle}
            active={active}
            dot={dot}
            icon={Icon}
            showLine={ctx.showLine}
          />
        </div>
      </div>
    );

    const horizontalItem = (
      <div
        className={cn("flex flex-col items-center gap-2 min-w-[200px]", ctx.animate && "animate-in fade-in-50 zoom-in-95 duration-500")}
        style={{ animationDelay: ctx.animate ? `${(idx ?? 0) * 100}ms` : undefined }}
      >
        <Marker
          index={idx ?? 0}
          last={isLast}
          size={ctx.size}
          color={color}
          status={status}
          lineColor={ctx.lineColor}
          lineStyle={ctx.lineStyle}
          active={active}
          dot={dot}
          icon={Icon}
          showLine={false}
        />
        {!isLast && ctx.showLine && (
          <div
            className={cn("h-px w-full border-t-2", LINE_STYLE_MAP[ctx.lineStyle])}
            style={{ borderColor: ctx.lineColor || "hsl(var(--border))" }}
          />
        )}
        {contentBox}
      </div>
    );

    if (ctx.mode === "horizontal") {
      return (
        <div ref={ref} className={cn("relative", className)} {...rest}>
          {horizontalItem}
        </div>
      );
    }

    let row = leftSide;
    if (ctx.align === "right") row = rightSide;
    if (ctx.align === "alternate") row = (idx ?? 0) % 2 === 0 ? leftSide : rightSide;

    return (
      <div ref={ref} className={cn("relative", className)} {...rest}>
        {row}
      </div>
    );
  },
);

TimelineItem.displayName = "Timeline.Item";

const Timeline = Object.assign(TimelineRoot, { Item: TimelineItem });

export default Timeline;
