// Re-export UI components from the app source so we can bundle them here.
// Note: Components that are coupled to app-specific APIs are intentionally excluded.

// Core primitives
/** Button component for actions, icon buttons, loading states, and submit flows. */
export { default as Button } from "./components/Button";
/** Public props for the `Button` component. */
export type { ButtonProps } from "./components/Button";
/** Badge component for status chips, counters, and compact labels. */
export { default as Badge } from "./components/Badge";
/** Specialized badge variants built on top of the base `Badge` component. */
export {
  Badge as BadgeBase,
  NotificationBadge,
  StatusBadge,
  TagBadge,
  InteractiveBadge,
  GradientBadge,
  PulseBadge,
} from "./components/Badge";
/** Surface container with optional header, footer, and visual variants. */
export { default as Card } from "./components/Card";
/** Public props for the `Card` component. */
export type { CardProps } from "./components/Card";
/** Checkbox input for boolean and multi-select form flows. */
export { Checkbox } from "./components/CheckBox";
/** Public props for the `Checkbox` component. */
export type { CheckboxProps } from "./components/CheckBox";
/** Text input family including search, password, number, and textarea variants. */
export { default as Input } from "./components/Input";
/** Public props for `Input` and its specialized input variants. */
export type { InputProps, SearchInputProps, PasswordInputProps, NumberInputProps, TextareaProps } from "./components/Input";
export { PasswordInput, NumberInput, SearchInput, Textarea } from "./components/Input";
/** Emoji picker with search, category navigation, and recent selections. */
export { default as EmojiPicker } from "./components/EmojiPicker";
/** Public props for the `EmojiPicker` component. */
export type { EmojiPickerProps } from "./components/EmojiPicker";
/** Tag input for editable token lists with keyboard-friendly entry and removal. */
export { default as TagInput, TagInput as TagInputBase } from "./components/TagInput";
/** Public props for the `TagInput` component. */
export type { TagInputProps } from "./components/TagInput";
/** Toggle switch for binary on/off states. */
export { default as Switch } from "./components/Switch";
/** Label primitive used by input-like controls. */
export { Label } from "./components/label";
/** Avatar component for profile photos, initials, and fallback states. */
export { default as Avatar } from "./components/Avatar";
/** Skeleton loaders for content placeholders while data is loading. */
export { default as Skeleton } from "./components/Skeleton";
export * from "./components/Skeleton";
/** Progress indicators including bars, circles, steps, and segmented states. */
export * from "./components/Progress";

// Feedback / overlays
/** Modal dialog for centered overlay workflows. */
export { default as Modal } from "./components/Modal";
/** Toast provider and hook for transient notification messages. */
export { default as ToastProvider, useToast } from "./components/Toast";
/** Tooltip overlay for contextual hints and microcopy. */
export { Tooltip } from "./components/Tooltip";
/** Popover overlay anchored to a trigger element. */
export { Popover } from "./components/Popover";
/** Sheet-style overlay panels for side, bottom, and drawer interactions. */
export { Sheet, Drawer, SlideOver, BottomSheet, SidebarSheet } from "./components/Sheet";
/** Alert banner for inline feedback and callout messages. */
export { default as Alert } from "./components/Alert";
/** Full-page and inline loading overlays for async states. */
export { GlobalLoading, PageLoading, InlineLoading, ButtonLoading } from "./components/GlobalLoading";

// Navigation / structure
/** Breadcrumb navigation trail for hierarchical routes or resources. */
export { default as Breadcrumb } from "./components/Breadcrumb";
/** Tabs component family for segmented content switching and tabbed layouts. */
export { Tabs, SimpleTabs, PillTabs, VerticalTabs } from "./components/Tab";
/** Dropdown menu for action lists, context menus, and select-like popups. */
export { default as DropdownMenu } from "./components/DropdownMenu";
export { DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from "./components/DropdownMenu";
/** Pagination components for standard, simple, and compact paging UIs. */
export { Pagination, SimplePagination, CompactPagination } from "./components/Pagination";
/** Public props for the pagination component family. */
export type { PaginationProps, SimplePaginationProps, CompactPaginationProps } from "./components/Pagination";
/** Section wrapper for grouped content areas with optional decoration. */
export { default as Section } from "./components/Section";
/** Scroll container primitive with configurable wrapper and viewport styling. */
export { ScrollArea } from "./components/ScrollArea";
/** Public props for the `ScrollArea` component. */
export type { ScrollAreaProps } from "./components/ScrollArea";
/** OverlayScrollbars-powered scroll container. */
export { OverlayScrollArea } from "./components/OverlayScrollArea";
/** Public props for the `OverlayScrollArea` component. */
export type { OverlayScrollAreaProps } from "./components/OverlayScrollArea";

// Pickers / inputs
/** Date picker components for single-date, range, and compact date selection. */
export { DatePicker, DateRangePicker, CompactDatePicker } from "./components/DatePicker";
/** Public props for single-date and date-range picker components. */
export type { DatePickerProps, DateRangePickerProps } from "./components/DatePicker";
/** Combined date and time picker. */
export { DateTimePicker } from "./components/DateTimePicker";
/** Public props for the `DateTimePicker` component. */
export type { DateTimePickerProps } from "./components/DateTimePicker";
/** Time picker with inline and dropdown presentation modes. */
export { default as TimePicker } from "./components/TimePicker";
/** Public props for the `TimePicker` component. */
export type { TimePickerProps } from "./components/TimePicker";
/** Month/year picker for calendar-month selection flows. */
export { default as MonthYearPicker, MonthYearPicker as MonthYearPickerBase } from "./components/MonthYearPicker";
/** Public props for the `MonthYearPicker` component. */
export type { MonthYearPickerProps } from "./components/MonthYearPicker";
/** Calendar view with events, holidays, and month navigation. */
export { default as Calendar, VIETNAM_HOLIDAYS } from "./components/Calendar";
/** Public props and event models for the `Calendar` component. */
export type { CalendarProps, CalendarEvent, CalendarHoliday } from "./components/Calendar";
/** Resource timeline calendar for schedules, bookings, and planning UIs. */
export { default as CalendarTimeline } from "./components/CalendarTimeline";
/** Public props and domain types for the `CalendarTimeline` component family. */
export type {
  CalendarTimelineProps,
  CalendarTimelineView,
  CalendarTimelineDayRangeMode,
  CalendarTimelineSize,
  CalendarTimelineDateInput,
  CalendarTimelineGroup,
  CalendarTimelineResource,
  CalendarTimelineEvent,
  CalendarTimelineLabels,
  CalendarTimelineFormatters,
  CalendarTimelineInteractions,
  CalendarTimelineVirtualization,
} from "./components/CalendarTimeline";
/** Single-select combobox with search and rich option rendering. */
export { Combobox } from "./components/Combobox";
/** Public option and props types for the `Combobox` component. */
export type { ComboboxOption, ComboboxProps } from "./components/Combobox";
/** Multi-select combobox with chips and search. */
export { MultiCombobox } from "./components/MultiCombobox";
/** Public option and props types for the `MultiCombobox` component. */
export type { MultiComboboxOption, MultiComboboxProps } from "./components/MultiCombobox";
/** Radio-group family for mutually-exclusive choices. */
export { RadioGroup, RadioGroupItem } from "./components/RadioGroup";
/** Slider input for numeric ranges and scrubber-style controls. */
export { Slider } from "./components/Slider";
/** Public props for the `Slider` component. */
export type { SliderProps } from "./components/Slider";
/** Playback and seek overlay controls for media experiences. */
export { default as OverlayControls } from "./components/OverlayControls";
/** Public props for the `OverlayControls` component. */
export type { OverlayControlsProps } from "./components/OverlayControls";
/** Tree-based category selector with single, multi, inline, and view-only modes. */
export { CategoryTreeSelect } from "./components/CategoryTreeSelect";
/** Public data and props types for the `CategoryTreeSelect` component family. */
export type {
  Category,
  CategoryTreeSelectLabels,
  CategoryTreeSelectBaseProps,
  CategoryTreeSelectMultiProps,
  CategoryTreeSelectSingleProps,
  CategoryTreeSelectProps,
} from "./components/CategoryTreeSelect";

// Media
/** Smart image renderer with fallback handling and fit controls. */
export { default as SmartImage } from "./components/SmartImage";
/** Image upload component with preview and upload-state helpers. */
export { default as ImageUpload } from "./components/ImageUpload";
/** Public props and uploaded-file model for the `ImageUpload` component. */
export type { ImageUploadProps, UploadedImage } from "./components/ImageUpload";
/** File upload component for generic documents and attachments. */
export { default as FileUpload } from "./components/FileUpload";
/** Public props and uploaded-file model for the `FileUpload` component. */
export type { FileUploadProps, UploadedFile } from "./components/FileUpload";
/** Carousel for slides, cards, and hero content. */
export { Carousel } from "./components/Carousel";
/** Public effect configuration types for the `Carousel` component. */
export type { CarouselEffectOptions, CarouselEffectPreset } from "./components/Carousel";
/** Decorative falling icon animation component. */
export { default as FallingIcons } from "./components/FallingIcons";
/** List component family with styled list items and variants. */
export { default as List } from "./components/List";
export { ListItem } from "./components/List";
/** Watermark overlay for branding or confidentiality marks. */
export { default as Watermark } from "./components/Watermark";
/** Public props for the `Watermark` component. */
export type { WatermarkProps } from "./components/Watermark";
/** Timeline component for chronological milestones or event histories. */
export { default as Timeline } from "./components/Timeline";
export { TimelineItem } from "./components/Timeline";
/** Color picker for palette and custom color selection. */
export { default as ColorPicker } from "./components/ColorPicker";
/** Public props for the `ColorPicker` component. */
export type { ColorPickerProps } from "./components/ColorPicker";
/** Music player widget with playlist, transport, and volume controls. */
export { MusicPlayer, default as MusicPlayerDefault } from "./components/MusicPlayer";
/** Public song model and props for the `MusicPlayer` component. */
export type { Song, MusicPlayerProps } from "./components/MusicPlayer";
/** Grid layout component and grid item primitive. */
export { default as Grid } from "./components/Grid";
export { GridItem } from "./components/Grid";
/** Public props for `Grid` and `GridItem`. */
export type { GridProps, GridItemProps } from "./components/Grid";

// Misc
/** Client-only wrapper for deferring render until after hydration. */
export { default as ClientOnly } from "./components/ClientOnly";
/** Loading primitives such as spinners, bars, and animated dots. */
export * from "./components/Loading";
export * from "./components/GlobalLoading";
/** Imperative loading state helper. */
export { loading } from "./utils/loading";
/** Shape of the imperative loading controller state. */
export type { LoadingState } from "./utils/loading";
/** Provider configuring OverlayScrollbars behavior across descendants. */
export { default as OverlayScrollbarProvider } from "./components/OverlayScrollbarProvider";
/** Public props for `OverlayScrollbarProvider`. */
export type { OverlayScrollbarProviderProps } from "./components/OverlayScrollbarProvider";
export { useOverlayScrollbarTarget } from "./components/OverlayScrollbarProvider";
/** Public options for `useOverlayScrollbarTarget`. */
export type { UseOverlayScrollbarTargetOptions } from "./components/OverlayScrollbarProvider";
// ThemeToggle depends on app-specific ThemeContext, not exported to keep package neutral
/** Data table with sorting, filtering, density, sticky header, and server-query support. */
export { default as DataTable } from "./components/DataTable";
/** Public table column, query, sorting, density, and labels types for `DataTable`. */
export type { DataTableColumn, DataTableDensity, DataTableLabels, DataTableProps, DataTableQuery, DataTableSize, FilterType, Sorter } from "./components/DataTable";
/** Low-level table primitives for custom table composition. */
export * from "./components/Table";
/** Form primitives integrating labels, messages, and validation helpers. */
export * from "./components/Form";
/** Notification modal for announcement-style overlays. */
export { default as NotificationModal } from "./components/NotificationModal";
/** Access denied panel for authorization and permission states. */
export { default as AccessDenied } from "./components/AccessDenied";
/** Public props for the `AccessDenied` component. */
export type { AccessDeniedProps } from "./components/AccessDenied";

// Headless, package-safe utilities
// Export headless components under simple names
/** Headless theme toggle for apps that own their theme state. */
export { default as ThemeToggle } from "./components/ThemeToggleHeadless";
/** Public props and mode type for the headless `ThemeToggle` component. */
export type { ThemeToggleHeadlessProps as ThemeToggleProps, ThemeMode } from "./components/ThemeToggleHeadless";
/** Headless language switcher for apps that own locale state. */
export { default as LanguageSwitcher } from "./components/LanguageSwitcherHeadless";
/** Public props and option type for the headless `LanguageSwitcher` component. */
export type { LanguageSwitcherHeadlessProps as LanguageSwitcherProps, LanguageOption } from "./components/LanguageSwitcherHeadless";

// Back-compat (optional): keep headless aliases
export { default as ThemeToggleHeadless } from "./components/ThemeToggleHeadless";
/** Back-compat props type for `ThemeToggleHeadless`. */
export type { ThemeToggleHeadlessProps } from "./components/ThemeToggleHeadless";
export { default as LanguageSwitcherHeadless } from "./components/LanguageSwitcherHeadless";
/** Back-compat props type for `LanguageSwitcherHeadless`. */
export type { LanguageSwitcherHeadlessProps } from "./components/LanguageSwitcherHeadless";

// ============================================================================
// UTILITIES (standalone, no Next.js dependencies)
// ============================================================================

// Class name utility (cn)
/** Utility for merging Tailwind and conditional class names. */
export { cn } from "./utils/cn";
export { cn as cnLocal } from "./utils/cn";

// Date utilities with locale support (standalone)
/** Standalone date helpers with locale-aware formatting and date math utilities. */
export * as DateUtils from "./utils/date";
/** Supported locale union used by standalone date helpers. */
export type { SupportedLocale } from "./utils/date";

// Animation utilities
/** Shared animation helpers used by package components. */
export { shadcnAnimationStyles, useShadCNAnimations, injectAnimationStyles, getAnimationStyles } from "./utils/animations";

// Constants for styling
/** Button style maps reused by button-like components. */
export { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "./constants/button";
export { VARIANT_STYLES_ALERT } from "./constants/alert";

// ============================================================================
// TRANSLATION SYSTEM (for React/Next.js without next-intl)
// ============================================================================
// TranslationProvider - Optional context for i18n support
// When not wrapped in TranslationProvider, components use English fallback texts
/** Translation provider and hooks for standalone React usage without `next-intl`. */
export { TranslationProvider, useUnderverseTranslations, useUnderverseLocale } from "./contexts/TranslationContext";
/** Bridge connecting Underverse translations to `next-intl`. */
export { NextIntlAdapter, UnderverseNextIntlProvider } from "./contexts/NextIntlAdapter";
/** Public locale, messages, and provider props for the translation system. */
export type { Locale, Translations, TranslationProviderProps } from "./contexts/TranslationContext";

// UnderverseProvider - Alternative name for TranslationProvider (for standalone React usage)
export {
  UnderverseProvider,
  useTranslations as useUnderverseI18n,
  useLocale as useUnderverseI18nLocale,
} from "./contexts/translation-adapter";
/** Public props for the standalone `UnderverseProvider` alias. */
export type { UnderverseProviderProps } from "./contexts/translation-adapter";

// Smart hooks that read NextIntlAdapter or fallback to internal translations
/** Smart translation hooks that prefer `next-intl` and fall back to internal messages. */
export { useSmartTranslations, useSmartLocale, ForceInternalTranslationsProvider } from "./hooks/useSmartTranslations";

// Excluded: NotificationBell (depends on project-specific API, auth, and sockets)
/** Rich-text editor built on Tiptap with uploads, slash commands, and table tools. */
export { default as UEditor } from "./components/UEditor";
export {
  extractImageSrcsFromHtml,
  normalizeImageUrl,
  prepareUEditorContentForSave,
  UEditorPrepareContentForSaveError,
} from "./components/UEditor";
/** Public props, ref, upload helpers, and formatting option types for `UEditor`. */
export type {
  UEditorFontFamilyOption,
  UEditorFontSizeOption,
  UEditorLetterSpacingOption,
  UEditorLineHeightOption,
  UEditorInlineUploadedItem,
  UEditorPrepareContentForSaveOptions,
  UEditorPrepareContentForSaveResult,
  UEditorProps,
  UEditorRef,
  UEditorUploadImageForSave,
  UEditorUploadImageForSaveResult,
  UEditorVariant,
} from "./components/UEditor";

// i18n messages for next-intl consumers
// Provide ready-to-merge messages so apps can easily integrate underverse UI texts.
import en from "../locales/en.json";
import vi from "../locales/vi.json";
import ko from "../locales/ko.json";
import ja from "../locales/ja.json";

export const underverseMessages = { en, vi, ko, ja } as const;
/** Supported locale keys available in `underverseMessages`. */
export type UnderverseLocale = keyof typeof underverseMessages;
export function getUnderverseMessages(locale: UnderverseLocale = "en") {
  return underverseMessages[locale] || underverseMessages.en;
}
