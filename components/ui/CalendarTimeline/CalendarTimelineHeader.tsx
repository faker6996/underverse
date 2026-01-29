"use client";

import * as React from "react";
import { Calendar, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Button from "../Button";
import type { CalendarTimelineView } from "./types";
import type { CalendarTimelineSizeConfig } from "./config";

const VIEW_ICONS: Record<CalendarTimelineView, React.ReactNode> = {
  month: <CalendarRange className="h-4 w-4" />,
  week: <CalendarDays className="h-4 w-4" />,
  day: <Calendar className="h-4 w-4" />,
};

export function CalendarTimelineHeader(props: {
  title: string;
  resourcesHeaderLabel: string;
  labels: { today: string; prev: string; next: string; month: string; week: string; day: string };
  activeView: CalendarTimelineView;
  sizeConfig: CalendarTimelineSizeConfig;
  navigate: (dir: -1 | 1) => void;
  goToday: () => void;
  setView: (view: CalendarTimelineView) => void;
  effectiveResourceColumnWidth: number | string;
  canResizeColumn: boolean;
  beginResizeColumn: (e: React.PointerEvent) => void;
  headerRef: React.RefObject<HTMLDivElement | null>;
  slotHeaderNodes: React.ReactNode;
}) {
  const {
    title,
    resourcesHeaderLabel,
    labels,
    activeView,
    sizeConfig,
    navigate,
    goToday,
    setView,
    effectiveResourceColumnWidth,
    canResizeColumn,
    beginResizeColumn,
    headerRef,
    slotHeaderNodes,
  } = props;

  return (
    <div className="sticky top-0 z-30 bg-linear-to-b from-background via-background to-background/95 border-b border-border/40 backdrop-blur-xl">
      <div className={cn("flex items-center justify-between gap-4", sizeConfig.headerPaddingClass)}>
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center bg-muted/40 rounded-xl p-1 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label={labels.prev}
              className={cn(sizeConfig.controlButtonIconClass, "rounded-lg hover:bg-background/80 transition-all duration-200")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToday}
              className={cn(sizeConfig.controlButtonTextClass, "rounded-lg hover:bg-background/80 font-medium transition-all duration-200")}
            >
              {labels.today}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
              aria-label={labels.next}
              className={cn(sizeConfig.controlButtonIconClass, "rounded-lg hover:bg-background/80 transition-all duration-200")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className={cn("ml-3 font-semibold tracking-tight truncate text-foreground", sizeConfig.titleClass)}>{title}</h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-muted/40 rounded-xl p-1 gap-0.5">
          {(["month", "week", "day"] as CalendarTimelineView[]).map((v) => (
            <Button
              key={v}
              variant={activeView === v ? "default" : "ghost"}
              size="sm"
              onClick={() => setView(v)}
              className={cn(
                sizeConfig.controlButtonTextClass,
                "rounded-lg font-medium transition-all duration-200 gap-1.5",
                activeView === v
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "hover:bg-background/80 text-muted-foreground hover:text-foreground",
              )}
            >
              {VIEW_ICONS[v]}
              <span className="hidden sm:inline">{labels[v]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Slot Headers */}
      <div className="flex border-t border-border/20">
        <div
          className="shrink-0 border-r border-border/30 bg-muted/20 flex items-center justify-center relative group/uv-ct-top-left"
          style={{ width: effectiveResourceColumnWidth, minWidth: effectiveResourceColumnWidth }}
        >
          <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{resourcesHeaderLabel}</span>
          {canResizeColumn && typeof effectiveResourceColumnWidth === "number" ? (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize resource column"
              className={cn(
                "absolute right-0 top-0 h-full w-3 cursor-col-resize z-20",
                "bg-transparent hover:bg-primary/10 active:bg-primary/15",
                "transition-all",
                "opacity-0 pointer-events-none",
                "group-hover/uv-ct-top-left:opacity-100 group-hover/uv-ct-top-left:pointer-events-auto",
              )}
              onPointerDown={beginResizeColumn}
            >
              <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-border/70" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ) : null}
        </div>
        <div ref={headerRef} className="overflow-x-auto overflow-y-hidden scrollbar-none">
          {slotHeaderNodes}
        </div>
      </div>
    </div>
  );
}

