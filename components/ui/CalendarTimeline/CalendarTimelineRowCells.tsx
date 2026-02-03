"use client";

import * as React from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CalendarTimelineGroup, CalendarTimelineResource } from "./types";
import type { CalendarTimelineSizeConfig } from "./config";

export function DefaultGroupRow(props: {
  group: CalendarTimelineGroup;
  collapsed: boolean;
  toggle: () => void;
  canToggle: boolean;
  ariaLabel: string;
  itemCount: number;
  sizeConfig: CalendarTimelineSizeConfig;
}) {
  const { group, collapsed, toggle, canToggle, ariaLabel, itemCount, sizeConfig } = props;

  return (
    <button
      type="button"
      onClick={canToggle ? toggle : undefined}
      className={cn(
        "w-full h-full flex items-center text-left",
        sizeConfig.groupRowClass,
        "bg-linear-to-r from-muted/40 to-muted/20 border-b border-border/40",
        "backdrop-blur-sm",
        canToggle ? "cursor-pointer hover:from-muted/60 hover:to-muted/30 transition-all duration-200" : "cursor-default",
      )}
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-md bg-card/60 transition-transform duration-200",
          collapsed ? "" : "rotate-180",
        )}
      >
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <span className="font-semibold text-foreground/90">{group.label}</span>
      <span className="ml-auto text-xs text-muted-foreground/60 font-medium">{itemCount} items</span>
    </button>
  );
}

export function ResourceRowCell<TResourceMeta>(props: {
  resource: CalendarTimelineResource<TResourceMeta>;
  sizeConfig: CalendarTimelineSizeConfig;
  canResizeRow: boolean;
  beginResizeResourceRow: (resourceId: string) => (e: React.PointerEvent) => void;
  renderResource?: (resource: CalendarTimelineResource<TResourceMeta>) => React.ReactNode;
}) {
  const { resource, sizeConfig, canResizeRow, beginResizeResourceRow, renderResource } = props;

  return (
    <div
      className={cn(
        "h-full w-full flex items-center border-b border-border/30 bg-linear-to-r from-card to-card/95 relative",
        sizeConfig.resourceRowClass,
        "hover:from-muted/30 hover:to-muted/10 transition-all duration-200 group/uv-ct-row-header",
      )}
    >
      <div className="shrink-0 opacity-0 group-hover/uv-ct-row-header:opacity-60 transition-opacity cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={cn("flex-1 min-w-0", resource.disabled && "opacity-50")}>
        {renderResource ? renderResource(resource) : <span className="font-medium text-sm truncate block">{resource.label}</span>}
      </div>

      {canResizeRow ? (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize row height"
          className={cn(
            "absolute left-0 bottom-0 w-full h-3 cursor-row-resize z-20",
            "bg-transparent hover:bg-primary/10 active:bg-primary/15",
            "transition-all",
            "opacity-0 pointer-events-none",
            "group-hover/uv-ct-row-header:opacity-100 group-hover/uv-ct-row-header:pointer-events-auto",
          )}
          onPointerDown={beginResizeResourceRow(resource.id)}
        >
          <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-border/70" />
          <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-70">
            <GripVertical className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
