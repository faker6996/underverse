import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

type ResponsiveConfig = Partial<{
  columns: number | string;
  rows: number | string;
  minColumnWidth: number | string;
  gap: number | string;
  gapX: number | string;
  gapY: number | string;
}>;

type GridVariant = "default" | "bordered" | "card" | "flat" | "glass";
type GridAutoFlow = "row" | "column" | "row dense" | "column dense";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns or full template string. Default: 12 (1fr each). */
  columns?: number | string;
  /** Number of rows or full template string. */
  rows?: number | string;
  /** Overall gap (shorthand). */
  gap?: number | string;
  /** Horizontal gap. */
  gapX?: number | string;
  /** Vertical gap. */
  gapY?: number | string;
  /** Auto rows value (e.g. 'minmax(100px, auto)'). */
  autoRows?: string;
  /** Auto columns value (e.g. 'minmax(100px, 1fr)'). */
  autoColumns?: string;
  /** Grid auto-flow direction and density. */
  autoFlow?: GridAutoFlow;
  /** Use auto-fit with a min width to create responsive columns. */
  minColumnWidth?: number | string;
  /** CSS grid-template-areas. Provide full string or joined lines. */
  areas?: string | string[];
  /** Item alignment within cells. */
  alignItems?: React.CSSProperties["alignItems"];
  justifyItems?: React.CSSProperties["justifyItems"];
  /** Grid content alignment. */
  alignContent?: React.CSSProperties["alignContent"];
  justifyContent?: React.CSSProperties["justifyContent"];
  /** Responsive overrides by breakpoint (Tailwind defaults). */
  responsive?: Partial<Record<Breakpoint, ResponsiveConfig>>;
  /** Visual variant style. */
  variant?: GridVariant;
  /** Enable smooth animations for grid layout changes. */
  animated?: boolean;
  /** Apply Card-like outline (rounded + border + bg-card). @deprecated Use variant="card" instead */
  outlined?: boolean;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span (e.g., 3 => span 3). */
  colSpan?: number | string;
  /** Row span. */
  rowSpan?: number | string;
  /** Column start line. */
  colStart?: number | string;
  /** Column end line. */
  colEnd?: number | string;
  /** Row start line. */
  rowStart?: number | string;
  /** Row end line. */
  rowEnd?: number | string;
  /** Named area (must match container areas). */
  area?: string;
  /** Item alignment override. */
  alignSelf?: React.CSSProperties["alignSelf"];
  justifySelf?: React.CSSProperties["justifySelf"];
  /** Order of the item in the grid. */
  order?: number;
  /** Add hover effect. */
  hoverable?: boolean;
  /** Add animation delay (in ms). */
  animationDelay?: number;
}

const BP_MIN: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function toTemplateCols(columns?: number | string, minColumnWidth?: number | string) {
  if (minColumnWidth != null) {
    const v = typeof minColumnWidth === "number" ? `${minColumnWidth}px` : String(minColumnWidth);
    return `repeat(auto-fit, minmax(${v}, 1fr))`;
  }
  if (typeof columns === "number") return `repeat(${columns}, minmax(0, 1fr))`;
  if (columns) return String(columns);
  return `repeat(12, minmax(0, 1fr))`;
}

function toTemplateRows(rows?: number | string) {
  if (typeof rows === "number") return `repeat(${rows}, minmax(0, auto))`;
  if (rows) return String(rows);
  return undefined;
}

function joinAreas(areas?: string | string[]) {
  if (!areas) return undefined;
  return Array.isArray(areas) ? areas.join(" ") : areas;
}

function getVariantClasses(variant: GridVariant = "default", outlined?: boolean): string {
  // Handle deprecated outlined prop
  if (outlined) {
    return "rounded-2xl md:rounded-3xl bg-card text-card-foreground border border-border shadow-sm";
  }

  const variants: Record<GridVariant, string> = {
    default: "",
    bordered: "border border-border rounded-2xl md:rounded-3xl",
    card: "rounded-2xl md:rounded-3xl bg-card text-card-foreground border border-border shadow-sm",
    flat: "bg-muted/30 rounded-2xl md:rounded-3xl",
    glass: "bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl md:rounded-3xl shadow-lg",
  };

  return variants[variant] || "";
}

const GridRoot = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns,
      rows,
      gap,
      gapX,
      gapY,
      autoRows,
      autoColumns,
      autoFlow,
      minColumnWidth,
      areas,
      alignItems,
      justifyItems,
      alignContent,
      justifyContent,
      responsive,
      variant = "default",
      animated = false,
      outlined = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const id = useId().replace(/[:]/g, "");
    const baseClass = `uv-grid-${id}`;

    const baseCols = toTemplateCols(columns, minColumnWidth);
    const baseRows = toTemplateRows(rows);
    const baseAreas = joinAreas(areas);

    let css = `.${baseClass}{display:grid;`;
    if (baseCols) css += `grid-template-columns:${baseCols};`;
    if (baseRows) css += `grid-template-rows:${baseRows};`;
    if (baseAreas) css += `grid-template-areas:${baseAreas};`;
    if (autoRows) css += `grid-auto-rows:${autoRows};`;
    if (autoColumns) css += `grid-auto-columns:${autoColumns};`;
    if (autoFlow) css += `grid-auto-flow:${autoFlow};`;
    if (alignItems) css += `align-items:${alignItems};`;
    if (justifyItems) css += `justify-items:${justifyItems};`;
    if (alignContent) css += `align-content:${alignContent};`;
    if (justifyContent) css += `justify-content:${justifyContent};`;
    if (animated) css += `transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
    css += `}`;

    const toVal = (v?: number | string) => (typeof v === "number" ? `${v}px` : v);
    const g = toVal(gap);
    const gx = toVal(gapX);
    const gy = toVal(gapY);
    if (g) css += `.${baseClass}{gap:${g};}`;
    if (gx) css += `.${baseClass}{column-gap:${gx};}`;
    if (gy) css += `.${baseClass}{row-gap:${gy};}`;

    if (responsive) {
      (Object.keys(responsive) as Breakpoint[]).forEach((bp) => {
        const conf = responsive[bp];
        if (!conf) return;
        const cols = toTemplateCols(conf.columns, conf.minColumnWidth);
        const rws = toTemplateRows(conf.rows);
        const rg = toVal(conf.gap);
        const rgx = toVal(conf.gapX);
        const rgy = toVal(conf.gapY);
        css += `@media (min-width:${BP_MIN[bp]}px){.${baseClass}{`;
        if (cols) css += `grid-template-columns:${cols};`;
        if (rws) css += `grid-template-rows:${rws};`;
        if (rg) css += `gap:${rg};`;
        if (rgx) css += `column-gap:${rgx};`;
        if (rgy) css += `row-gap:${rgy};`;
        css += `}}`;
      });
    }

    return (
      <div
        ref={ref}
        className={cn(baseClass, getVariantClasses(variant, outlined), animated && "transition-all duration-300 ease-in-out", className)}
        style={style}
        {...rest}
      >
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {children}
      </div>
    );
  },
);

GridRoot.displayName = "Grid";

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      area,
      alignSelf,
      justifySelf,
      order,
      hoverable = false,
      animationDelay,
      style,
      className,
      ...rest
    },
    ref,
  ) => {
    const st: React.CSSProperties = { ...style };
    if (colSpan != null) st.gridColumn = `span ${colSpan} / span ${colSpan}`;
    if (rowSpan != null) st.gridRow = `span ${rowSpan} / span ${rowSpan}`;
    if (colStart != null) st.gridColumnStart = colStart as any;
    if (colEnd != null) st.gridColumnEnd = colEnd as any;
    if (rowStart != null) st.gridRowStart = rowStart as any;
    if (rowEnd != null) st.gridRowEnd = rowEnd as any;
    if (area) st.gridArea = area;
    if (alignSelf) st.alignSelf = alignSelf;
    if (justifySelf) st.justifySelf = justifySelf;
    if (order != null) st.order = order;
    if (animationDelay != null) {
      st.animationDelay = `${animationDelay}ms`;
      st.opacity = 0;
      st.animation = `uvGridItemFadeIn 0.5s ease-out forwards`;
    }

    return (
      <>
        {animationDelay != null && (
          <style
            dangerouslySetInnerHTML={{
              __html: `@keyframes uvGridItemFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`,
            }}
          />
        )}
        <div
          ref={ref}
          className={cn(
            "rounded-2xl md:rounded-3xl",
            hoverable && "transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer",
            className,
          )}
          style={st}
          {...rest}
        />
      </>
    );
  },
);

GridItem.displayName = "Grid.Item";

const Grid = Object.assign(GridRoot, { Item: GridItem });

export default Grid;
