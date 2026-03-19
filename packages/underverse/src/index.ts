// Re-export UI components from the app source so we can bundle them here.
// Note: Components that are coupled to app-specific APIs are intentionally excluded.

// Core primitives
export { default as Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";
export { default as Badge } from "./components/Badge";
export {
  Badge as BadgeBase,
  NotificationBadge,
  StatusBadge,
  TagBadge,
  InteractiveBadge,
  GradientBadge,
  PulseBadge,
} from "./components/Badge";
export { default as Card } from "./components/Card";
export type { CardProps } from "./components/Card";
export { Checkbox } from "./components/CheckBox";
export type { CheckboxProps } from "./components/CheckBox";
export { default as Input } from "./components/Input";
export type { InputProps, SearchInputProps, PasswordInputProps, NumberInputProps, TextareaProps } from "./components/Input";
export { PasswordInput, NumberInput, SearchInput, Textarea } from "./components/Input";
export { default as TagInput, TagInput as TagInputBase } from "./components/TagInput";
export type { TagInputProps } from "./components/TagInput";
export { default as Switch } from "./components/Switch";
export { Label } from "./components/label";
export { default as Avatar } from "./components/Avatar";
export { default as Skeleton } from "./components/Skeleton";
export * from "./components/Skeleton";
export * from "./components/Progress";

// Feedback / overlays
export { default as Modal } from "./components/Modal";
export { default as ToastProvider, useToast } from "./components/Toast";
export { Tooltip } from "./components/Tooltip";
export { Popover } from "./components/Popover";
export { Sheet, Drawer, SlideOver, BottomSheet, SidebarSheet } from "./components/Sheet";
export { default as Alert } from "./components/Alert";
export { GlobalLoading, PageLoading, InlineLoading, ButtonLoading } from "./components/GlobalLoading";

// Navigation / structure
export { default as Breadcrumb } from "./components/Breadcrumb";
export { Tabs, SimpleTabs, PillTabs, VerticalTabs } from "./components/Tab";
export { default as DropdownMenu } from "./components/DropdownMenu";
export { DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from "./components/DropdownMenu";
export { Pagination, SimplePagination, CompactPagination } from "./components/Pagination";
export type { PaginationProps, SimplePaginationProps, CompactPaginationProps } from "./components/Pagination";
export { default as Section } from "./components/Section";
export { ScrollArea } from "./components/ScrollArea";
export type { ScrollAreaProps } from "./components/ScrollArea";
export { OverlayScrollArea } from "./components/OverlayScrollArea";
export type { OverlayScrollAreaProps } from "./components/OverlayScrollArea";

// Pickers / inputs
export { DatePicker, DateRangePicker, CompactDatePicker } from "./components/DatePicker";
export type { DatePickerProps, DateRangePickerProps } from "./components/DatePicker";
export { DateTimePicker } from "./components/DateTimePicker";
export type { DateTimePickerProps } from "./components/DateTimePicker";
export { default as TimePicker } from "./components/TimePicker";
export type { TimePickerProps } from "./components/TimePicker";
export { default as MonthYearPicker, MonthYearPicker as MonthYearPickerBase } from "./components/MonthYearPicker";
export type { MonthYearPickerProps } from "./components/MonthYearPicker";
export { default as Calendar, VIETNAM_HOLIDAYS } from "./components/Calendar";
export type { CalendarProps, CalendarEvent, CalendarHoliday } from "./components/Calendar";
export { default as CalendarTimeline } from "./components/CalendarTimeline";
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
export { Combobox } from "./components/Combobox";
export type { ComboboxOption, ComboboxProps } from "./components/Combobox";
export { MultiCombobox } from "./components/MultiCombobox";
export type { MultiComboboxOption, MultiComboboxProps } from "./components/MultiCombobox";
export { RadioGroup, RadioGroupItem } from "./components/RadioGroup";
export { Slider } from "./components/Slider";
export type { SliderProps } from "./components/Slider";
export { default as OverlayControls } from "./components/OverlayControls";
export type { OverlayControlsProps } from "./components/OverlayControls";
export { CategoryTreeSelect } from "./components/CategoryTreeSelect";
export type {
  Category,
  CategoryTreeSelectLabels,
  CategoryTreeSelectBaseProps,
  CategoryTreeSelectMultiProps,
  CategoryTreeSelectSingleProps,
  CategoryTreeSelectProps,
} from "./components/CategoryTreeSelect";

// Media
export { default as SmartImage } from "./components/SmartImage";
export { default as ImageUpload } from "./components/ImageUpload";
export type { ImageUploadProps, UploadedImage } from "./components/ImageUpload";
export { default as FileUpload } from "./components/FileUpload";
export type { FileUploadProps, UploadedFile } from "./components/FileUpload";
export { Carousel } from "./components/Carousel";
export { default as FallingIcons } from "./components/FallingIcons";
export { default as List } from "./components/List";
export { ListItem } from "./components/List";
export { default as Watermark } from "./components/Watermark";
export type { WatermarkProps } from "./components/Watermark";
export { default as Timeline } from "./components/Timeline";
export { TimelineItem } from "./components/Timeline";
export { default as ColorPicker } from "./components/ColorPicker";
export type { ColorPickerProps } from "./components/ColorPicker";
export { MusicPlayer, default as MusicPlayerDefault } from "./components/MusicPlayer";
export type { Song, MusicPlayerProps } from "./components/MusicPlayer";
export { default as Grid } from "./components/Grid";
export { GridItem } from "./components/Grid";
export type { GridProps, GridItemProps } from "./components/Grid";

// Misc
export { default as ClientOnly } from "./components/ClientOnly";
export * from "./components/Loading";
export * from "./components/GlobalLoading";
export { loading } from "./utils/loading";
export type { LoadingState } from "./utils/loading";
export { default as OverlayScrollbarProvider } from "./components/OverlayScrollbarProvider";
export type { OverlayScrollbarProviderProps } from "./components/OverlayScrollbarProvider";
export { useOverlayScrollbarTarget } from "./components/OverlayScrollbarProvider";
export type { UseOverlayScrollbarTargetOptions } from "./components/OverlayScrollbarProvider";
// ThemeToggle depends on app-specific ThemeContext, not exported to keep package neutral
export { default as DataTable } from "./components/DataTable";
export type { DataTableColumn, DataTableDensity, DataTableLabels, DataTableProps, DataTableQuery, DataTableSize, FilterType, Sorter } from "./components/DataTable";
export * from "./components/Table";
export * from "./components/Form";
export { default as NotificationModal } from "./components/NotificationModal";
export { default as AccessDenied } from "./components/AccessDenied";
export type { AccessDeniedProps } from "./components/AccessDenied";

// Headless, package-safe utilities
// Export headless components under simple names
export { default as ThemeToggle } from "./components/ThemeToggleHeadless";
export type { ThemeToggleHeadlessProps as ThemeToggleProps, ThemeMode } from "./components/ThemeToggleHeadless";
export { default as LanguageSwitcher } from "./components/LanguageSwitcherHeadless";
export type { LanguageSwitcherHeadlessProps as LanguageSwitcherProps, LanguageOption } from "./components/LanguageSwitcherHeadless";

// Back-compat (optional): keep headless aliases
export { default as ThemeToggleHeadless } from "./components/ThemeToggleHeadless";
export type { ThemeToggleHeadlessProps } from "./components/ThemeToggleHeadless";
export { default as LanguageSwitcherHeadless } from "./components/LanguageSwitcherHeadless";
export type { LanguageSwitcherHeadlessProps } from "./components/LanguageSwitcherHeadless";

// ============================================================================
// UTILITIES (standalone, no Next.js dependencies)
// ============================================================================

// Class name utility (cn)
export { cn } from "../../../lib/utils/cn";
export { cn as cnLocal } from "./utils/cn";

// Date utilities with locale support (standalone)
export * as DateUtils from "./utils/date";
export type { SupportedLocale } from "./utils/date";

// Animation utilities
export { shadcnAnimationStyles, useShadCNAnimations, injectAnimationStyles, getAnimationStyles } from "./utils/animations";

// Constants for styling
export { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "./constants/button";
export { VARIANT_STYLES_ALERT } from "../../../lib/constants/constants-ui/alert";

// ============================================================================
// TRANSLATION SYSTEM (for React/Next.js without next-intl)
// ============================================================================
// TranslationProvider - Optional context for i18n support
// When not wrapped in TranslationProvider, components use English fallback texts
export { TranslationProvider, useUnderverseTranslations, useUnderverseLocale } from "./contexts/TranslationContext";
export type { Locale, Translations, TranslationProviderProps } from "./contexts/TranslationContext";

// UnderverseProvider - Alternative name for TranslationProvider (for standalone React usage)
export {
  UnderverseProvider,
  useTranslations as useUnderverseI18n,
  useLocale as useUnderverseI18nLocale,
} from "../../../lib/i18n/translation-adapter";
export type { UnderverseProviderProps } from "../../../lib/i18n/translation-adapter";

// Smart hooks that auto-detect next-intl or fallback to internal translations
export { useSmartTranslations, useSmartLocale, ForceInternalTranslationsProvider } from "./hooks/useSmartTranslations";

// Excluded: NotificationBell (depends on project-specific API, auth, and sockets)
export { default as UEditor } from "./components/UEditor";
export {
  extractImageSrcsFromHtml,
  normalizeImageUrl,
  prepareUEditorContentForSave,
  UEditorPrepareContentForSaveError,
} from "./components/UEditor";
export type {
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
export type UnderverseLocale = keyof typeof underverseMessages;
export function getUnderverseMessages(locale: UnderverseLocale = "en") {
  return underverseMessages[locale] || underverseMessages.en;
}
