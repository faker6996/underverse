"use client";

import * as React from "react";

/**
 * Flat i18n config for overriding built-in English labels across all components.
 * Pass this via the `i18n` prop on `UnderverseNextIntlProvider` or `TranslationProvider`.
 *
 * Component-level props (e.g. `searchPlaceholder` on `<Combobox />`) still take
 * precedence over this global config — this only sets the global default.
 *
 * @example
 * ```tsx
 * <UnderverseNextIntlProvider
 *   i18n={{
 *     searchPlaceholder: "Tìm kiếm...",
 *     selectPlaceholder: "Chọn...",
 *     noResults: "Không có kết quả",
 *     clearAll: "Xóa tất cả",
 *     selectedCount: (n) => `Đã chọn ${n}`,
 *     moreCount: (n) => `+${n} khác`,
 *   }}
 * >
 *   <App />
 * </UnderverseNextIntlProvider>
 * ```
 */
export interface GlobalI18nConfig {
  // ── Inputs / search ──────────────────────────────────────────────────────
  /** Placeholder for search inputs inside dropdowns. Default: "Search..." */
  searchPlaceholder?: string;
  /** Placeholder shown on trigger button/input when nothing is selected. Default: "Select..." */
  selectPlaceholder?: string;
  /** Placeholder for CategoryTreeSelect trigger when nothing is selected. Falls back to `selectPlaceholder`. */
  selectCategoryPlaceholder?: string;

  // ── Empty / loading states ────────────────────────────────────────────────
  /** Text shown when a search returns no results. Default: "No results found" */
  noResults?: string;
  /** Text shown when a category tree has no items. Default: "No categories" */
  noCategories?: string;
  /** Loading indicator text. Default: "Loading..." */
  loading?: string;

  // ── Actions ───────────────────────────────────────────────────────────────
  /** "Clear all" button label (MultiCombobox dropdown header + trigger). Default: "Clear all" */
  clearAll?: string;
  /** aria-label for the × button that clears a search input. Default: "Clear search" */
  clearSearch?: string;
  /** aria-label for the × button that clears the current selection. Default: "Clear selection" */
  clearSelection?: string;
  /** Suggestion shown in empty search state. Default: "Try a different keyword" */
  tryDifferentSearch?: string;

  // ── Date / time ───────────────────────────────────────────────────────────
  /** "Today" button label in DatePicker / CalendarTimeline. Default: "Today" */
  today?: string;
  /** "Clear" button label in DatePicker / TimePicker. Default: "Clear" */
  clear?: string;
  /** aria-label announced when a valid time is selected in TimePicker. Default: "Valid time selected" */
  validTimeSelected?: string;

  // ── Dynamic / count labels ────────────────────────────────────────────────
  /**
   * Summary shown in the MultiCombobox trigger when items are selected and
   * there is no `maxSelected` limit. Default: `(n) => \`${n} items selected\``
   */
  selectedCount?: (count: number) => string;
  /**
   * Summary shown in the MultiCombobox trigger when `maxSelected` is set.
   * Default: `(count, max) => \`${count}/${max} selected\``
   */
  selectedCountWithMax?: (count: number, max: number) => string;
  /**
   * Compact summary used in the MultiCombobox dropdown header.
   * Default: `(n) => \`${n} selected\``
   */
  itemSelectedCount?: (count: number) => string;
  /**
   * Overflow pill shown when visible tags exceed `maxTagsVisible`.
   * Default: `(n) => \`+${n} more\``
   */
  moreCount?: (count: number) => string;

  // ── Close / dismiss ───────────────────────────────────────────────────────
  /** aria-label for the × button that closes a modal. Default: "Close modal" */
  closeModal?: string;
  /** aria-label for the × button that dismisses a toast. Default: "Close toast" */
  closeToast?: string;

  // ── Input field actions ───────────────────────────────────────────────────
  /** aria-label for the × button inside a text input. Default: "Clear input" */
  clearInput?: string;
  /** aria-label for the eye button when password is hidden. Default: "Show password" */
  showPassword?: string;
  /** aria-label for the eye button when password is visible. Default: "Hide password" */
  hidePassword?: string;
  /** aria-label for the + stepper button on a number input. Default: "Increase value" */
  increaseValue?: string;
  /** aria-label for the − stepper button on a number input. Default: "Decrease value" */
  decreaseValue?: string;

  // ── TimePicker ────────────────────────────────────────────────────────────
  /** aria-label for the TimePicker trigger button. Default: "Select time" */
  selectTime?: string;
  /** aria-label for the inline time text input. Default: "Edit time value" */
  editTimeValue?: string;
  /** aria-label for the editable selected-time display. Default: "Edit selected time" */
  editSelectedTime?: string;
  /** aria-label for the AM/PM toggle. Default: "Select AM or PM" */
  selectAmPm?: string;
  /** aria-label for the "now" button in TimePicker. Default: "Set current time" */
  setCurrentTime?: string;
  /** aria-label for the clear button in TimePicker. Default: "Clear selected time" */
  clearTime?: string;

  // ── FileUpload ────────────────────────────────────────────────────────────
  /** title/aria-label for the download button on an uploaded file. Default: "Download" */
  download?: string;
  /** title/aria-label for the remove button on an uploaded file. Default: "Remove" */
  removeFile?: string;

  // ── Tags / Badge ──────────────────────────────────────────────────────────
  /**
   * aria-label for the × button that removes a tag from TagInput.
   * Default: `(tag) => \`Remove ${tag}\``
   */
  removeTag?: (tag: string) => string;
  /** aria-label for the × button that removes a dismissible Badge. Default: "Remove badge" */
  removeBadge?: string;

  // ── Carousel ─────────────────────────────────────────────────────────────
  /** aria-label for the ‹ button that goes to the previous slide. Default: "Previous slide" */
  prevSlide?: string;
  /** aria-label for the › button that goes to the next slide. Default: "Next slide" */
  nextSlide?: string;
  /**
   * aria-label for a dot/tab button in the Carousel pagination strip.
   * Default: `(n) => \`Go to slide ${n}\``
   */
  goToSlide?: (n: number) => string;
  /**
   * aria-label for a thumbnail button in the Carousel thumbnail strip.
   * Default: `(n) => \`Thumbnail ${n}\``
   */
  carouselThumbnail?: (n: number) => string;

  // ── DataTable ─────────────────────────────────────────────────────────────
  /**
   * aria-label for the filter icon in a DataTable column header.
   * Default: `(column) => \`Filter by ${column}\``
   */
  filterByColumn?: (column: string) => string;
  /**
   * aria-label for the auto-fit icon in a DataTable column header.
   * Default: `(column) => \`Auto fit ${column}\``
   */
  autoFitColumn?: (column: string) => string;
  /** Fallback label for the "Sort by" button when no `sortByLabel` prop is provided. Default: "Sort by" */
  sortBy?: string;

  // ── Misc component labels ─────────────────────────────────────────────────
  /** aria-label for the ColorPicker trigger button. Default: "Open color picker" */
  openColorPicker?: string;
  /** aria-label for the MonthYearPicker trigger button. Default: "Select month and year" */
  selectMonthYear?: string;
  /** aria-label for the minimum-value thumb on a Slider. Default: "Minimum value" */
  minimumValue?: string;
  /** aria-label for the maximum-value thumb on a Slider. Default: "Maximum value" */
  maximumValue?: string;
  /** aria-label for the "show all" button inside a collapsed Breadcrumb. Default: "Show all breadcrumb items" */
  showAllBreadcrumbs?: string;
  /** aria-label for the Carousel dots / pagination nav. Default: "Carousel pagination" */
  carouselPagination?: string;
  /** aria-label for the resize handle on a Sheet panel. Default: "Resize sheet" */
  resizeSheet?: string;
  /** aria-label for the row-height resize handle in CalendarTimeline. Default: "Resize row height" */
  resizeRowHeight?: string;
  /** aria-label for the resource-column resize handle in CalendarTimeline. Default: "Resize resource column" */
  resizeResourceColumn?: string;
  /** aria-label for the battery-level Progress bar. Default: "Battery level" */
  batteryLevel?: string;
  /** aria-label for the Breadcrumb `<nav>` landmark. Default: "Breadcrumb navigation" */
  breadcrumbNavigation?: string;
  /** aria-label for the step-list container in a Progress component. Default: "Progress steps" */
  progressSteps?: string;
  /** title for the preview button on an uploaded file. Default: "Preview" */
  previewFile?: string;
  /** title for the retry button on a failed upload. Default: "Retry" */
  retryUpload?: string;
  /**
   * aria-label for the expand/collapse button on a CategoryTreeSelect item.
   * Receives the category name and the current expanded state.
   * Default: `(name, expanded) => expanded ? \`Collapse ${name}\` : \`Expand ${name}\``
   */
  toggleCategory?: (name: string, expanded: boolean) => string;
  /** Column header label for the "Hour" spinner in TimePicker. Default: "Hour" */
  hourLabel?: string;
  /** Column header label for the "Min" spinner in TimePicker. Default: "Min" */
  minuteLabel?: string;
  /** Column header label for the "Sec" spinner in TimePicker. Default: "Sec" */
  secondLabel?: string;
  /** Label for the alpha (opacity) slider in ColorPicker. Default: "Alpha" */
  alphaLabel?: string;

  // ── Calendar names ────────────────────────────────────────────────────────
  /** 12 full month names starting from January. */
  monthNames?: [string, string, string, string, string, string, string, string, string, string, string, string];
  /** 7 weekday names starting from Sunday. */
  weekdayNames?: [string, string, string, string, string, string, string];
}

const GlobalI18nContext = React.createContext<GlobalI18nConfig | null>(null);

/** Read the nearest `GlobalI18nConfig`. Returns `{}` when no provider is present. */
export function useGlobalI18n(): GlobalI18nConfig {
  return React.useContext(GlobalI18nContext) ?? {};
}

export interface GlobalI18nProviderProps {
  children: React.ReactNode;
  i18n?: GlobalI18nConfig;
}

export function GlobalI18nProvider({ children, i18n }: GlobalI18nProviderProps) {
  if (!i18n) return <>{children}</>;
  return <GlobalI18nContext.Provider value={i18n}>{children}</GlobalI18nContext.Provider>;
}
