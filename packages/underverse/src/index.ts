// Re-export UI components from the app source so we can bundle them here.
// Note: Components that are coupled to app-specific APIs are intentionally excluded.

// Core primitives
export { default as Button } from "../../../components/ui/Button";
export type { ButtonProps } from "../../../components/ui/Button";
export { default as Badge } from "../../../components/ui/Badge";
export { Badge as BadgeBase, NotificationBadge, StatusBadge, TagBadge, InteractiveBadge, GradientBadge, PulseBadge } from "../../../components/ui/Badge";
export { default as Card } from "../../../components/ui/Card";
export { Checkbox } from "../../../components/ui/CheckBox";
export type { CheckboxProps } from "../../../components/ui/CheckBox";
export { default as Input } from "../../../components/ui/Input";
export type { InputProps } from "../../../components/ui/Input";
export { PasswordInput, NumberInput, SearchInput } from "../../../components/ui/Input";
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
export { default as TimePicker } from "../../../components/ui/TimePicker";
export type { TimePickerProps } from "../../../components/ui/TimePicker";
export { default as Calendar } from "../../../components/ui/Calendar";
export type { CalendarProps, CalendarEvent } from "../../../components/ui/Calendar";
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
export { default as Grid } from "../../../components/ui/Grid";
export { GridItem } from "../../../components/ui/Grid";
export type { GridProps, GridItemProps } from "../../../components/ui/Grid";

// Misc
export { default as ClientOnly } from "../../../components/ui/ClientOnly";
export * from "../../../components/ui/Loading";
// ThemeToggle depends on app-specific ThemeContext, not exported to keep package neutral
export { default as DataTable } from "../../../components/ui/DataTable";
export type { DataTableColumn, DataTableQuery, Sorter } from "../../../components/ui/DataTable";
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

// Utilities needed by components (optional public re-exports)
export { cn } from "../../../lib/utils/cn";
export * as DateUtils from "../../../lib/utils/date";
export { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "../../../lib/constants/constants-ui/button";
export { VARIANT_STYLES_ALERT } from "../../../lib/constants/constants-ui/alert";

// Excluded: NotificationBell (depends on project-specific API, auth, and sockets)

// i18n messages for next-intl consumers
// Provide ready-to-merge messages so apps can easily integrate underverse UI texts.
import en from "../locales/en.json";
import vi from "../locales/vi.json";

export const underverseMessages = { en, vi } as const;
export type UnderverseLocale = keyof typeof underverseMessages;
export function getUnderverseMessages(locale: UnderverseLocale = 'en') {
  return underverseMessages[locale] || underverseMessages.en;
}
