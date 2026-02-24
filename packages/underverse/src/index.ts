// Re-export UI components from the app source so we can bundle them here.
// Note: Components that are coupled to app-specific APIs are intentionally excluded.

// Core primitives
export { default as Button } from "../../../components/ui/Button";
export type { ButtonProps } from "../../../components/ui/Button";
export { default as Badge } from "../../../components/ui/Badge";
export {
  Badge as BadgeBase,
  NotificationBadge,
  StatusBadge,
  TagBadge,
  InteractiveBadge,
  GradientBadge,
  PulseBadge,
} from "../../../components/ui/Badge";
export { default as Card } from "../../../components/ui/Card";
export { Checkbox } from "../../../components/ui/CheckBox";
export type { CheckboxProps } from "../../../components/ui/CheckBox";
export { default as Input } from "../../../components/ui/Input";
export type { InputProps } from "../../../components/ui/Input";
export { PasswordInput, NumberInput, SearchInput } from "../../../components/ui/Input";
export { default as TagInput, TagInput as TagInputBase } from "../../../components/ui/TagInput";
export type { TagInputProps } from "../../../components/ui/TagInput";
export { default as Textarea } from "../../../components/ui/Textarea";
export { default as Switch } from "../../../components/ui/Switch";
export { Label } from "../../../components/ui/label";
export { default as Avatar } from "../../../components/ui/Avatar";
export { default as Skeleton } from "../../../components/ui/Skeleton";
export * from "../../../components/ui/Skeleton";
export * from "../../../components/ui/Progress";

// Feedback / overlays
export { default as Modal } from "../../../components/ui/Modal";
export { default as ToastProvider, useToast } from "../../../components/ui/Toast";
export { Tooltip } from "../../../components/ui/Tooltip";
export { Popover } from "../../../components/ui/Popover";
export { Sheet, Drawer, SlideOver, BottomSheet, SidebarSheet } from "../../../components/ui/Sheet";
export { default as Alert } from "../../../components/ui/Alert";
export { GlobalLoading, PageLoading, InlineLoading, ButtonLoading } from "../../../components/ui/GlobalLoading";

// Navigation / structure
export { default as Breadcrumb } from "../../../components/ui/Breadcrumb";
export { Tabs, SimpleTabs, PillTabs, VerticalTabs } from "../../../components/ui/Tab";
export { default as DropdownMenu } from "../../../components/ui/DropdownMenu";
export { DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from "../../../components/ui/DropdownMenu";
export { Pagination, SimplePagination, CompactPagination } from "../../../components/ui/Pagination";
export type { PaginationProps, SimplePaginationProps, CompactPaginationProps } from "../../../components/ui/Pagination";
export { default as Section } from "../../../components/ui/Section";
export { ScrollArea } from "../../../components/ui/ScrollArea";

// Pickers / inputs
export { DatePicker, DateRangePicker } from "../../../components/ui/DatePicker";
export type { DatePickerProps } from "../../../components/ui/DatePicker";
export { DateTimePicker } from "../../../components/ui/DateTimePicker";
export type { DateTimePickerProps } from "../../../components/ui/DateTimePicker";
export { default as TimePicker } from "../../../components/ui/TimePicker";
export type { TimePickerProps } from "../../../components/ui/TimePicker";
export { default as MonthYearPicker, MonthYearPicker as MonthYearPickerBase } from "../../../components/ui/MonthYearPicker";
export type { MonthYearPickerProps } from "../../../components/ui/MonthYearPicker";
export { default as Calendar } from "../../../components/ui/Calendar";
export type { CalendarProps, CalendarEvent } from "../../../components/ui/Calendar";
export { default as CalendarTimeline } from "../../../components/ui/CalendarTimeline";
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
} from "../../../components/ui/CalendarTimeline";
export { Combobox } from "../../../components/ui/Combobox";
export type { ComboboxProps } from "../../../components/ui/Combobox";
export { MultiCombobox } from "../../../components/ui/MultiCombobox";
export type { MultiComboboxProps } from "../../../components/ui/MultiCombobox";
export { RadioGroup, RadioGroupItem } from "../../../components/ui/RadioGroup";
export { Slider } from "../../../components/ui/Slider";
export { default as OverlayControls } from "../../../components/ui/OverlayControls";
export { CategoryTreeSelect } from "../../../components/ui/CategoryTreeSelect";

// Media
export { default as SmartImage } from "../../../components/ui/SmartImage";
export { default as ImageUpload } from "../../../components/ui/ImageUpload";
export { default as FileUpload } from "../../../components/ui/FileUpload";
export type { FileUploadProps, UploadedFile } from "../../../components/ui/FileUpload";
export { Carousel } from "../../../components/ui/Carousel";
export { default as FallingIcons } from "../../../components/ui/FallingIcons";
export { default as List } from "../../../components/ui/List";
export { ListItem } from "../../../components/ui/List";
export { default as Watermark } from "../../../components/ui/Watermark";
export type { WatermarkProps } from "../../../components/ui/Watermark";
export { default as Timeline } from "../../../components/ui/Timeline";
export { TimelineItem } from "../../../components/ui/Timeline";
export { default as ColorPicker } from "../../../components/ui/ColorPicker";
export type { ColorPickerProps } from "../../../components/ui/ColorPicker";
export { MusicPlayer, default as MusicPlayerDefault } from "../../../components/ui/MusicPlayer";
export type { Song, MusicPlayerProps } from "../../../components/ui/MusicPlayer";
export { default as Grid } from "../../../components/ui/Grid";
export { GridItem } from "../../../components/ui/Grid";
export type { GridProps, GridItemProps } from "../../../components/ui/Grid";

// Charts (pure SVG, no external dependencies)
export { LineChart } from "../../../components/ui/LineChart";
export type { LineChartProps, LineChartDataPoint, LineChartSeries } from "../../../components/ui/LineChart";
export { BarChart } from "../../../components/ui/BarChart";
export type { BarChartProps, BarChartDataPoint, BarChartSeries } from "../../../components/ui/BarChart";
export { PieChart } from "../../../components/ui/PieChart";
export type { PieChartProps, PieChartDataPoint } from "../../../components/ui/PieChart";
export { AreaChart } from "../../../components/ui/AreaChart";
export type { AreaChartProps, AreaChartDataPoint, AreaChartSeries } from "../../../components/ui/AreaChart";
export { Sparkline } from "../../../components/ui/Sparkline";
export type { SparklineProps, SparklineDataPoint } from "../../../components/ui/Sparkline";
export { RadarChart } from "../../../components/ui/RadarChart";
export type { RadarChartProps, RadarChartDataPoint, RadarChartSeries } from "../../../components/ui/RadarChart";
export { GaugeChart } from "../../../components/ui/GaugeChart";
export type { GaugeChartProps } from "../../../components/ui/GaugeChart";

// Misc
export { default as ClientOnly } from "../../../components/ui/ClientOnly";
export * from "../../../components/ui/Loading";
export { default as OverlayScrollbarProvider } from "../../../components/ui/OverlayScrollbarProvider";
export type { OverlayScrollbarProviderProps } from "../../../components/ui/OverlayScrollbarProvider";
// ThemeToggle depends on app-specific ThemeContext, not exported to keep package neutral
export { default as DataTable } from "../../../components/ui/DataTable";
export type { DataTableColumn, DataTableDensity, DataTableQuery, DataTableSize, Sorter } from "../../../components/ui/DataTable";
export * from "../../../components/ui/Table";
export * from "../../../components/ui/Form";
export { default as NotificationModal } from "../../../components/ui/NotificationModal";
export { default as FloatingContacts } from "../../../components/ui/FloatingContacts";
export { default as AccessDenied } from "../../../components/ui/AccessDenied";

// Headless, package-safe utilities
// Export headless components under simple names
export { default as ThemeToggle } from "../../../components/ui/ThemeToggleHeadless";
export type { ThemeToggleHeadlessProps as ThemeToggleProps, ThemeMode } from "../../../components/ui/ThemeToggleHeadless";
export { default as LanguageSwitcher } from "../../../components/ui/LanguageSwitcherHeadless";
export type { LanguageSwitcherHeadlessProps as LanguageSwitcherProps, LanguageOption } from "../../../components/ui/LanguageSwitcherHeadless";

// Back-compat (optional): keep headless aliases
export { default as ThemeToggleHeadless } from "../../../components/ui/ThemeToggleHeadless";
export type { ThemeToggleHeadlessProps } from "../../../components/ui/ThemeToggleHeadless";
export { default as LanguageSwitcherHeadless } from "../../../components/ui/LanguageSwitcherHeadless";
export type { LanguageSwitcherHeadlessProps } from "../../../components/ui/LanguageSwitcherHeadless";

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
export { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "../../../lib/constants/constants-ui/button";
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
export { default as UEditor } from "../../../components/ui/UEditor";
export {
  extractImageSrcsFromHtml,
  normalizeImageUrl,
  prepareUEditorContentForSave,
  UEditorPrepareContentForSaveError,
} from "../../../components/ui/UEditor";
export type {
  UEditorInlineUploadedItem,
  UEditorPrepareContentForSaveOptions,
  UEditorPrepareContentForSaveResult,
  UEditorProps,
  UEditorRef,
  UEditorUploadImageForSave,
  UEditorUploadImageForSaveResult,
  UEditorVariant,
} from "../../../components/ui/UEditor";

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
