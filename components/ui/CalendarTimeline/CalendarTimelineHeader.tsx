"use client";

import * as React from "react";
import { Calendar, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocale, useTranslations } from "@/lib/i18n/translation-adapter";
import Button from "../Button";
import CalendarComponent from "../Calendar";
import { Popover } from "../Popover";
import TimePicker from "../TimePicker";
import type { CalendarTimelineView } from "./types";
import type { CalendarTimelineSizeConfig } from "./config";

const VIEW_ICONS: Record<CalendarTimelineView, React.ReactNode> = {
  month: <CalendarRange className="h-4 w-4" />,
  week: <CalendarDays className="h-4 w-4" />,
  day: <Calendar className="h-4 w-4" />,
  sprint: <CalendarDays className="h-4 w-4" />,
};

export function CalendarTimelineHeader(props: {
  title: string;
  resourcesHeaderLabel: string;
  labels: { today: string; prev: string; next: string; month: string; week: string; day: string; sprint: string };
  newEventLabel: string;
  newEventDisabled?: boolean;
  onNewEventClick?: () => void;
  activeView: CalendarTimelineView;
  availableViews?: CalendarTimelineView[];
  showResourceColumn?: boolean;
  sizeConfig: CalendarTimelineSizeConfig;
  navigate: (dir: -1 | 1) => void;
  now: Date;
  onApplyDateTime: (date: Date) => void;
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
    newEventLabel,
    newEventDisabled,
    onNewEventClick,
    activeView,
    availableViews,
    showResourceColumn,
    sizeConfig,
    navigate,
    now,
    onApplyDateTime,
    setView,
    effectiveResourceColumnWidth,
    canResizeColumn,
    beginResizeColumn,
    headerRef,
    slotHeaderNodes,
  } = props;

  const resolvedAvailableViews = React.useMemo(
    () => (availableViews?.length ? availableViews : (["month", "week", "day", "sprint"] as CalendarTimelineView[])),
    [availableViews],
  );
  const showViewSwitcher = resolvedAvailableViews.length > 1;
  const showLeftColumn = showResourceColumn ?? true;

  const dt = useTranslations("DateTimePicker");
  const locale = useLocale();

  const [todayOpen, setTodayOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(() => now);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(() => now);

  React.useEffect(() => {
    if (!todayOpen) return;
    setTempDate(now);
    setCalendarMonth(now);
  }, [now, todayOpen]);

  const monthLabel = React.useCallback(
    (date: Date) =>
      date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        month: "long",
        year: "numeric",
      }),
    [locale],
  );

  const weekdays = React.useMemo(() => {
    switch (locale) {
      case "vi":
        return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      case "ko":
        return ["일", "월", "화", "수", "목", "금", "토"];
      case "ja":
        return ["日", "月", "火", "水", "木", "金", "土"];
      default:
        return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    }
  }, [locale]);

  const getTimeString = React.useCallback((date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }, []);

  const handleDateSelect = React.useCallback((date: Date | Date[] | { start?: Date; end?: Date }) => {
    if (!(date instanceof Date)) return;
    setTempDate((prev) => {
      const next = new Date(date);
      next.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds());
      return next;
    });
  }, []);

  const handleTimeChange = React.useCallback((timeStr: string | undefined) => {
    if (!timeStr) return;
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return;
    setTempDate((prev) => {
      const next = new Date(prev);
      next.setHours(h, m, prev.getSeconds());
      return next;
    });
  }, []);

  const applyDateTime = React.useCallback(() => {
    onApplyDateTime(tempDate);
    setTodayOpen(false);
  }, [onApplyDateTime, tempDate]);

  return (
    <div className="sticky top-0 z-30 bg-linear-to-b from-card via-card to-card/95 border-b border-border/40 backdrop-blur-xl">
      <div className={cn("flex items-center justify-between gap-4", sizeConfig.headerPaddingClass)}>
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center bg-muted/40 rounded-full p-1 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label={labels.prev}
              className={cn(sizeConfig.controlButtonIconClass, "rounded-full hover:bg-card/80 transition-all duration-200")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover
              open={todayOpen}
              onOpenChange={setTodayOpen}
              placement="bottom-start"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(sizeConfig.controlButtonTextClass, "rounded-full hover:bg-card/80 font-medium transition-all duration-200")}
                >
                  {labels.today}
                </Button>
              }
              contentClassName={cn(
                "w-auto p-0 rounded-2xl md:rounded-3xl overflow-hidden",
              )}
            >
              <div className="max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-auto">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
                  <div className="p-2">
                    <CalendarComponent
                      value={tempDate}
                      onSelect={handleDateSelect}
                      selectMode="single"
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      className="border-0 shadow-none w-auto"
                      size="sm"
                      labels={{
                        month: monthLabel,
                        weekdays,
                      }}
                    />
                  </div>
                  <div className="p-2 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-muted-foreground">{dt?.("time") || "Time"}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => setTempDate(now)}
                      >
                        {labels.today}
                      </Button>
                    </div>
                    <TimePicker
                      variant="inline"
                      value={getTimeString(tempDate)}
                      onChange={handleTimeChange}
                      format="24"
                      includeSeconds={false}
                      clearable={false}
                      className="border-0 shadow-none p-0 bg-transparent rounded-none"
                      size="sm"
                    />
                  </div>
                </div>
                <div className="p-3 border-t border-border flex justify-between items-center bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setTempDate(now);
                      setCalendarMonth(now);
                    }}
                  >
                    {labels.today}
                  </Button>
                  <Button size="sm" onClick={applyDateTime} className="rounded-full">
                    {dt?.("done") || "Done"}
                  </Button>
                </div>
              </div>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
              aria-label={labels.next}
              className={cn(sizeConfig.controlButtonIconClass, "rounded-full hover:bg-card/80 transition-all duration-200")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className={cn("ml-3 font-semibold tracking-tight truncate text-foreground", sizeConfig.titleClass)}>{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {onNewEventClick ? (
            <Button
              variant="default"
              size="sm"
              icon={Plus}
              disabled={newEventDisabled}
              onClick={onNewEventClick}
              className={cn(sizeConfig.controlButtonTextClass, "rounded-full font-medium transition-all duration-200 gap-1.5")}
            >
              <span className="hidden sm:inline">{newEventLabel}</span>
            </Button>
          ) : null}

          {/* View Switcher */}
          {showViewSwitcher ? (
            <div className="flex items-center bg-muted/40 rounded-full p-1 gap-0.5">
              {resolvedAvailableViews.map((v) => (
                <Button
                  key={v}
                  variant={activeView === v ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView(v)}
                  className={cn(
                  sizeConfig.controlButtonTextClass,
                  "rounded-full font-medium transition-all duration-200 gap-1.5",
                  activeView === v
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "hover:bg-card/80 text-muted-foreground hover:text-foreground",
                )}
              >
                {VIEW_ICONS[v]}
                <span className="hidden sm:inline">{labels[v]}</span>
              </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Slot Headers */}
      <div className="flex border-t border-border/20">
        {showLeftColumn ? (
          <div
            className="shrink-0 border-r border-border/30 bg-card/60 flex items-center justify-center relative group/uv-ct-top-left"
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
        ) : null}
        <div ref={headerRef} className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden">
          {slotHeaderNodes}
        </div>
      </div>
    </div>
  );
}
