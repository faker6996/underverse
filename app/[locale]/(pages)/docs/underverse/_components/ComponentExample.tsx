"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import type { DocsSlug } from "../_data/docs-registry";

function ExampleLoading() {
  const t = useTranslations("DocsUnderverse.docs");

  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">{t("loadingDemo")}</span>
      <div className="h-10 w-56 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      <div className="min-h-56 animate-pulse rounded-2xl border border-border/60 bg-muted/30 motion-reduce:animate-none" />
    </div>
  );
}

const load = (loader: () => Promise<{ default: ComponentType }>) =>
  dynamic(loader, { ssr: false, loading: ExampleLoading });

const EXAMPLES: Record<DocsSlug, ComponentType> = {
  button: load(() => import("../_examples/ButtonExample")),
  badge: load(() => import("../_examples/BadgeExample")),
  avatar: load(() => import("../_examples/AvatarExample")),
  card: load(() => import("../_examples/CardExample")),
  skeleton: load(() => import("../_examples/SkeletonExample")),
  progress: load(() => import("../_examples/ProgressExample")),
  input: load(() => import("../_examples/InputExample")),
  textarea: load(() => import("../_examples/TextareaExample")),
  checkbox: load(() => import("../_examples/CheckboxExample")),
  switch: load(() => import("../_examples/SwitchExample")),
  "radio-group": load(() => import("../_examples/RadioGroupExample")),
  slider: load(() => import("../_examples/SliderExample")),
  "tag-input": load(() => import("../_examples/TagInputExample")),
  ueditor: load(() => import("../_examples/UEditorExample")),
  "date-picker": load(() => import("../_examples/DatePickerExample")),
  "lunar-date-picker": load(() => import("../_examples/LunarDatePickerExample")),
  "time-picker": load(() => import("../_examples/TimePickerExample")),
  "date-time-picker": load(() => import("../_examples/DateTimePickerExample")),
  "month-year-picker": load(() => import("../_examples/MonthYearPickerExample")),
  calendar: load(() => import("../_examples/CalendarExample")),
  "calendar-timeline": load(() => import("../_examples/CalendarTimelineExample")),
  "color-picker": load(() => import("../_examples/ColorPickerExample")),
  "emoji-picker": load(() => import("../_examples/EmojiPickerExample")),
  "sticker-picker": load(() => import("../_examples/StickerPickerExample")),
  combobox: load(() => import("../_examples/ComboboxExample")),
  "multi-combobox": load(() => import("../_examples/MultiComboboxExample")),
  "category-tree-select": load(() => import("../_examples/CategoryTreeSelectExample")),
  modal: load(() => import("../_examples/ModalExample")),
  toast: load(() => import("../_examples/ToastExample")),
  alert: load(() => import("../_examples/AlertExample")),
  tooltip: load(() => import("../_examples/TooltipExample")),
  popover: load(() => import("../_examples/PopoverExample")),
  sheet: load(() => import("../_examples/SheetExample")),
  loading: load(() => import("../_examples/LoadingExample")),
  "notification-modal": load(() => import("../_examples/NotificationModalExample")),
  breadcrumb: load(() => import("../_examples/BreadcrumbExample")),
  tabs: load(() => import("../_examples/TabsExample")),
  "dropdown-menu": load(() => import("../_examples/DropdownMenuExample")),
  pagination: load(() => import("../_examples/PaginationExample")),
  "scroll-area": load(() => import("../_examples/ScrollAreaExample")),
  table: load(() => import("../_examples/TableExample")),
  "data-table": load(() => import("../_examples/DataTableExample")),
  list: load(() => import("../_examples/ListExample")),
  grid: load(() => import("../_examples/GridExample")),
  timeline: load(() => import("../_examples/TimelineExample")),
  section: load(() => import("../_examples/SectionExample")),
  carousel: load(() => import("../_examples/CarouselExample")),
  "overlay-controls": load(() => import("../_examples/OverlayControlsExample")),
  "smart-image": load(() => import("../_examples/SmartImageExample")),
  "image-upload": load(() => import("../_examples/ImageUploadExample")),
  "file-upload": load(() => import("../_examples/FileUploadExample")),
  watermark: load(() => import("../_examples/WatermarkExample")),
  "falling-icons": load(() => import("../_examples/FallingIconsExample")),
  "music-player": load(() => import("../_examples/MusicPlayerExample")),
  form: load(() => import("../_examples/FormExample")),
  "client-only": load(() => import("../_examples/ClientOnlyExample")),
  "access-denied": load(() => import("../_examples/AccessDeniedExample")),
  "config-provider": load(() => import("../_examples/ConfigProviderExample")),
  "theme-toggle": load(() => import("../_examples/ThemeToggleExample")),
  "theme-toggle-headless": load(() => import("../_examples/ThemeToggleHeadlessExample")),
  "language-switcher-headless": load(() => import("../_examples/LanguageSwitcherHeadlessExample")),
  "translation-provider": load(() => import("../_examples/TranslationProviderExample")),
  "date-utils": load(() => import("../_examples/DateUtilsExample")),
};

export default function ComponentExample({ slug }: { slug: DocsSlug }) {
  const Example = EXAMPLES[slug];
  return <Example />;
}
