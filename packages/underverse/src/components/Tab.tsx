"use client";

import * as React from "react";
import { cn } from "../utils/cn";

interface Tab {
  label: string;
  value: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "pills" | "underline" | "card" | "underline-card";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  onTabChange?: (value: string) => void;
  stretch?: boolean; // evenly distribute tabs (horizontal)
  noContentCard?: boolean;
  noContentPadding?: boolean;
  animateContent?: boolean;
}

const sizeStyles = {
  sm: {
    tab: "py-1.5 px-3 text-xs",
    contentGap: "mt-3",
    contentPadding: "p-3",
  },
  md: {
    tab: "py-2.5 px-4 text-sm",
    contentGap: "mt-4",
    contentPadding: "p-4",
  },
  lg: {
    tab: "py-3 px-6 text-base",
    contentGap: "mt-6",
    contentPadding: "p-6",
  },
};

const variantStyles = {
  default: {
    container: "border-b border-border/60 bg-muted/30 p-1 rounded-t-2xl",
    tab: "rounded-full border-b-2 border-transparent hover:bg-accent/40",
    activeTab: "border-primary bg-background text-primary shadow-sm",
    inactiveTab: "text-muted-foreground hover:text-foreground",
  },
  pills: {
    container: "bg-muted/50 backdrop-blur-sm p-1.5 rounded-2xl border border-border/40",
    tab: "rounded-full transition-all duration-200",
    activeTab: "bg-background text-foreground shadow-md border border-border/50",
    inactiveTab: "text-muted-foreground hover:text-foreground hover:bg-background/50",
  },
  underline: {
    container: "relative border-b border-border/60",
    tab: "relative transition-colors duration-200 pb-3 border-b-2 border-transparent hover:border-primary/30",
    activeTab: "text-primary border-primary font-semibold",
    inactiveTab: "text-muted-foreground hover:text-foreground",
  },
  card: {
    container: "space-y-1.5 bg-muted/20 p-2 rounded-2xl border border-border/30",
    tab: "rounded-xl border border-transparent transition-all duration-200",
    activeTab: "bg-primary text-primary-foreground border-primary shadow-md",
    inactiveTab: "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-border/50",
  },
  "underline-card": {
    container: "border-b border-border/60 bg-card/80 backdrop-blur-sm rounded-t-2xl p-1",
    tab: "relative transition-all duration-200 pb-3 px-4 rounded-t-xl border-b-2 border-transparent hover:border-primary/30 hover:bg-accent/30",
    activeTab: "text-primary border-primary font-semibold bg-accent/30",
    inactiveTab: "text-muted-foreground hover:text-foreground",
  },
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  className,
  contentClassName,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  onTabChange,
  stretch = false,
  noContentCard = false,
  noContentPadding = false,
  animateContent = true,
}) => {
  const [active, setActive] = React.useState<string>(defaultValue || tabs[0]?.value);
  const [underlineStyle, setUnderlineStyle] = React.useState<React.CSSProperties>({});
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  // Generate a deterministic base id from tab values to avoid SSR/client mismatch
  const baseId = React.useMemo(() => {
    const key = tabs.map((t) => t.value).join("-");
    return `tabs-${key || "default"}`;
  }, [tabs]);

  const handleTabChange = (value: string) => {
    setActive(value);
    onTabChange?.(value);
  };

  // Update underline position for underline variant
  React.useEffect(() => {
    if (variant === "underline" && orientation === "horizontal") {
      const activeIndex = tabs.findIndex((tab) => tab.value === active);
      const activeTab = tabRefs.current[activeIndex];

      if (activeTab) {
        const { offsetLeft, offsetWidth } = activeTab;
        setUnderlineStyle({
          left: offsetLeft,
          width: offsetWidth,
        });
      }
    }
  }, [active, variant, orientation, tabs]);

  const containerClasses = cn(
    "relative",
    orientation === "horizontal" ? "w-full flex space-x-1 overflow-x-auto" : "flex flex-col space-y-1 shrink-0",
    variantStyles[variant].container,
    className,
  );

  const activeIndex = tabs.findIndex((tab) => tab.value === active);
  const activeTab = activeIndex >= 0 ? tabs[activeIndex] : tabs[0];
  const panelId = `${baseId}-panel-${activeIndex >= 0 ? activeIndex : 0}`;
  const tabId = `${baseId}-tab-${activeIndex >= 0 ? activeIndex : 0}`;
  const contentWrapperClasses = cn(
    orientation === "horizontal" && sizeStyles[size].contentGap,
    orientation === "vertical" && "flex-1 min-w-0",
    !noContentPadding && sizeStyles[size].contentPadding,
    !noContentCard
      ? "bg-card rounded-2xl md:rounded-3xl border border-border/60 shadow-sm text-card-foreground backdrop-blur-sm"
      : "text-foreground",
    contentClassName,
  );

  return (
    <div className={cn("w-full", orientation === "vertical" && "flex items-start gap-6")}>
      {/* Tab List */}
      <div className={containerClasses} role="tablist" aria-orientation={orientation}>
        {tabs.map((tab, index) => {
          const isActive = active === tab.value;
          const Icon = tab.icon;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;

          return (
            <button
              key={tab.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => !tab.disabled && handleTabChange(tab.value)}
              disabled={tab.disabled}
              style={{
                boxShadow: "none",
                transform: "none",
                outline: "none",
                border: "none",
              }}
              className={cn(
                "font-medium transition-all duration-200 cursor-pointer flex items-center gap-2",
                "focus:outline-none focus-visible:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-0 bg-transparent outline-none", // Reset button default styles
                sizeStyles[size].tab,
                variantStyles[variant].tab,
                isActive ? variantStyles[variant].activeTab : variantStyles[variant].inactiveTab,
                orientation === "vertical" && "justify-start w-full",
                stretch && orientation === "horizontal" && "flex-1 justify-center",
              )}
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => {
                const count = tabs.length;
                const idx = tabs.findIndex((t) => t.value === active);
                let next = idx;
                if (orientation === "horizontal") {
                  if (e.key === "ArrowRight") next = (idx + 1) % count;
                  if (e.key === "ArrowLeft") next = (idx - 1 + count) % count;
                } else {
                  if (e.key === "ArrowDown") next = (idx + 1) % count;
                  if (e.key === "ArrowUp") next = (idx - 1 + count) % count;
                }
                if (e.key === "Home") next = 0;
                if (e.key === "End") next = count - 1;
                if (next !== idx) {
                  e.preventDefault();
                  const nextVal = tabs[next].value;
                  handleTabChange(nextVal);
                  tabRefs.current[next]?.focus();
                }
              }}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </button>
          );
        })}

        {/* Underline indicator for underline variant */}
        {variant === "underline" && orientation === "horizontal" && (
          <div className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out" style={underlineStyle} />
        )}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        className={cn("transition-all duration-200", contentWrapperClasses)}
      >
        {animateContent ? (
          <div key={activeTab?.value} className="animate-fade-in">
            {activeTab?.content}
          </div>
        ) : (
          activeTab?.content
        )}
      </div>
    </div>
  );
};

// Additional Tab components for specific use cases
interface SimpleTabsProps {
  tabs: Array<{
    label: string;
    value: string;
    content: React.ReactNode;
  }>;
  defaultValue?: string;
  className?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({ tabs, defaultValue, className }) => {
  return <Tabs tabs={tabs} defaultValue={defaultValue} className={className} variant="default" size="sm" />;
};

interface PillTabsProps extends TabsProps {
  contained?: boolean;
}

export const PillTabs: React.FC<PillTabsProps> = ({ contained = true, ...props }) => {
  return <Tabs {...props} variant="pills" className={cn(contained && "max-w-fit", props.className)} />;
};

interface VerticalTabsProps extends TabsProps {
  sidebarWidth?: string;
}

export const VerticalTabs: React.FC<VerticalTabsProps> = ({ sidebarWidth = "w-48", className, ...props }) => {
  return (
    <div className={cn("w-full", className)}>
      <Tabs {...props} orientation="vertical" variant="card" className={sidebarWidth} />
    </div>
  );
};
