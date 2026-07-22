export type DocsCategoryKey =
  | "core"
  | "formInputs"
  | "pickers"
  | "feedback"
  | "navigation"
  | "dataDisplay"
  | "layout"
  | "media"
  | "utilities"
  | "theming"
  | "i18n";

export type DocsStatus = "stable" | "new" | "updated" | "beta";

export interface ComponentDocItem {
  slug: string;
  translationKey: string;
  category: DocsCategoryKey;
  importNames: string[];
  sourcePath: string;
  status?: DocsStatus;
}

export const DOCS_CATEGORIES: readonly DocsCategoryKey[] = [
  "core",
  "formInputs",
  "pickers",
  "feedback",
  "navigation",
  "dataDisplay",
  "layout",
  "media",
  "utilities",
  "theming",
  "i18n",
];

const component = (
  slug: string,
  translationKey: string,
  category: DocsCategoryKey,
  importNames: string[],
  sourceFile: string,
  status: DocsStatus = "stable",
): ComponentDocItem => ({
  slug,
  translationKey,
  category,
  importNames,
  sourcePath: `packages/underverse/src/${sourceFile}`,
  status,
});

export const DOCS_REGISTRY: readonly ComponentDocItem[] = [
  component("button", "button", "core", ["Button"], "components/Button.tsx"),
  component("badge", "badge", "core", ["Badge"], "components/Badge.tsx"),
  component("avatar", "avatar", "core", ["Avatar"], "components/Avatar.tsx"),
  component("card", "card", "core", ["Card"], "components/Card.tsx"),
  component("skeleton", "skeleton", "core", ["Skeleton"], "components/Skeleton.tsx"),
  component("progress", "progress", "core", ["Progress"], "components/Progress.tsx"),

  component("input", "input", "formInputs", ["Input", "PasswordInput", "NumberInput"], "components/Input.tsx"),
  component("textarea", "textarea", "formInputs", ["Textarea"], "components/Input.tsx"),
  component("checkbox", "checkbox", "formInputs", ["CheckBox"], "components/CheckBox.tsx"),
  component("switch", "switch", "formInputs", ["Switch"], "components/Switch.tsx"),
  component("radio-group", "radioGroup", "formInputs", ["RadioGroup"], "components/RadioGroup.tsx"),
  component("slider", "slider", "formInputs", ["Slider"], "components/Slider.tsx"),
  component("tag-input", "tagInput", "formInputs", ["TagInput"], "components/TagInput.tsx", "updated"),
  component("ueditor", "ueditor", "formInputs", ["UEditor"], "components/UEditor.tsx", "updated"),

  component("date-picker", "datePicker", "pickers", ["DatePicker"], "components/DatePicker.tsx"),
  component("lunar-date-picker", "lunarDatePicker", "pickers", ["LunarDatePicker"], "components/LunarDatePicker.tsx", "updated"),
  component("time-picker", "timePicker", "pickers", ["TimePicker"], "components/TimePicker.tsx"),
  component("date-time-picker", "dateTimePicker", "pickers", ["DateTimePicker"], "components/DateTimePicker.tsx"),
  component("month-year-picker", "monthYearPicker", "pickers", ["MonthYearPicker"], "components/MonthYearPicker.tsx"),
  component("calendar", "calendar", "pickers", ["Calendar"], "components/Calendar.tsx"),
  component("calendar-timeline", "calendarTimeline", "pickers", ["CalendarTimeline"], "components/CalendarTimeline.tsx", "new"),
  component("color-picker", "colorPicker", "pickers", ["ColorPicker"], "components/ColorPicker.tsx"),
  component("emoji-picker", "emojiPicker", "pickers", ["EmojiPicker"], "components/EmojiPicker.tsx"),
  component("sticker-picker", "stickerPicker", "pickers", ["StickerPicker"], "components/StickerPicker.tsx"),
  component("combobox", "combobox", "pickers", ["Combobox"], "components/Combobox.tsx"),
  component("multi-combobox", "multiCombobox", "pickers", ["MultiCombobox"], "components/MultiCombobox.tsx"),
  component("category-tree-select", "categoryTreeSelect", "pickers", ["CategoryTreeSelect"], "components/CategoryTreeSelect.tsx", "updated"),

  component("modal", "modal", "feedback", ["Modal"], "components/Modal.tsx"),
  component("toast", "toast", "feedback", ["ToastProvider", "useToast"], "components/Toast.tsx"),
  component("alert", "alert", "feedback", ["Alert"], "components/Alert.tsx"),
  component("tooltip", "tooltip", "feedback", ["Tooltip"], "components/Tooltip.tsx"),
  component("popover", "popover", "feedback", ["Popover"], "components/Popover.tsx"),
  component("sheet", "sheet", "feedback", ["Sheet"], "components/Sheet.tsx"),
  component("loading", "loading", "feedback", ["Loading"], "components/Loading.tsx"),
  component("notification-modal", "notificationModal", "feedback", ["NotificationModal"], "components/NotificationModal.tsx"),

  component("breadcrumb", "breadcrumb", "navigation", ["Breadcrumb"], "components/Breadcrumb.tsx"),
  component("tabs", "tabs", "navigation", ["Tabs"], "components/Tab.tsx"),
  component("dropdown-menu", "dropdownMenu", "navigation", ["DropdownMenu"], "components/DropdownMenu.tsx"),
  component("pagination", "pagination", "navigation", ["Pagination"], "components/Pagination.tsx"),
  component("scroll-area", "scrollArea", "navigation", ["ScrollArea"], "components/ScrollArea.tsx"),

  component("table", "table", "dataDisplay", ["Table"], "components/Table.tsx"),
  component("data-table", "dataTable", "dataDisplay", ["DataTable"], "components/DataTable/index.ts", "updated"),
  component("list", "list", "dataDisplay", ["List"], "components/List.tsx"),
  component("grid", "grid", "dataDisplay", ["Grid"], "components/Grid.tsx"),
  component("timeline", "timeline", "dataDisplay", ["Timeline"], "components/Timeline.tsx"),

  component("section", "section", "layout", ["Section"], "components/Section.tsx"),
  component("carousel", "carousel", "layout", ["Carousel"], "components/Carousel.tsx"),
  component("overlay-controls", "overlayControls", "layout", ["OverlayControls"], "components/OverlayControls.tsx"),

  component("smart-image", "smartImage", "media", ["SmartImage"], "components/SmartImage.tsx"),
  component("image-upload", "imageUpload", "media", ["ImageUpload"], "components/ImageUpload.tsx"),
  component("file-upload", "fileUpload", "media", ["FileUpload"], "components/FileUpload.tsx"),
  component("watermark", "watermark", "media", ["Watermark"], "components/Watermark.tsx"),
  component("falling-icons", "fallingIcons", "media", ["FallingIcons"], "components/FallingIcons.tsx"),
  component("music-player", "musicPlayer", "media", ["MusicPlayer"], "components/MusicPlayer.tsx"),

  component("form", "form", "utilities", ["Form"], "components/Form.tsx"),
  component("client-only", "clientOnly", "utilities", ["ClientOnly"], "components/ClientOnly.tsx"),
  component("access-denied", "accessDenied", "utilities", ["AccessDenied"], "components/AccessDenied.tsx"),

  component("config-provider", "configProvider", "theming", ["UnderverseConfigProvider"], "contexts/UnderverseConfigContext.tsx"),
  component("theme-toggle", "themeToggle", "theming", ["ThemeToggle"], "components/ThemeToggleHeadless.tsx"),
  component("theme-toggle-headless", "themeToggleHeadless", "theming", ["ThemeToggleHeadless"], "components/ThemeToggleHeadless.tsx"),
  component("language-switcher-headless", "languageSwitcherHeadless", "theming", ["LanguageSwitcherHeadless"], "components/LanguageSwitcherHeadless.tsx"),

  component("translation-provider", "translationProvider", "i18n", ["TranslationProvider"], "contexts/TranslationContext.tsx"),
  component("date-utils", "dateUtils", "i18n", ["formatDate", "formatDateTime"], "utils/date.ts"),
] as const;

export type DocsSlug = (typeof DOCS_REGISTRY)[number]["slug"];

export const DOCS_BY_CATEGORY = new Map<DocsCategoryKey, readonly ComponentDocItem[]>(
  DOCS_CATEGORIES.map((category) => [
    category,
    DOCS_REGISTRY.filter((item) => item.category === category),
  ]),
);

const DOCS_BY_SLUG = new Map(DOCS_REGISTRY.map((item) => [item.slug, item]));

export function getComponentDocBySlug(slug: string): ComponentDocItem | undefined {
  return DOCS_BY_SLUG.get(slug);
}

export function getComponentImportCode(doc: ComponentDocItem): string {
  return `import { ${doc.importNames.join(", ")} } from '@underverse-ui/underverse';`;
}
