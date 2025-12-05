"use client";

import React from "react";
export const dynamic = "force-dynamic";
import dynamicImport from "next/dynamic";
const IntlDemoProvider = dynamicImport(() => import("./_components/IntlDemoProvider"));
const CodeBlock = dynamicImport(() => import("./_components/CodeBlock"));
const DocSection = dynamicImport(() => import("./_components/DocSection"));
const ToastProvider = dynamicImport(() => import("@/components/ui/Toast"), { ssr: false });
import { ActiveSectionProvider } from "./_components/ActiveSectionContext";
import { Sheet } from "@/components/ui/Sheet";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Lazy-load interactive examples to avoid SSR side effects during build
const ButtonExample = dynamicImport(() => import("./_examples/ButtonExample"), { ssr: false });
const BadgeExample = dynamicImport(() => import("./_examples/BadgeExample"), { ssr: false });
const ModalExample = dynamicImport(() => import("./_examples/ModalExample"), { ssr: false });
const TabsExample = dynamicImport(() => import("./_examples/TabsExample"), { ssr: false });
const ToastExample = dynamicImport(() => import("./_examples/ToastExample"), { ssr: false });
const AvatarExample = dynamicImport(() => import("./_examples/AvatarExample"), { ssr: false });
const BreadcrumbExample = dynamicImport(() => import("./_examples/BreadcrumbExample"), { ssr: false });
const CardExample = dynamicImport(() => import("./_examples/CardExample"), { ssr: false });
const CheckboxExample = dynamicImport(() => import("./_examples/CheckboxExample"), { ssr: false });
const TextareaExample = dynamicImport(() => import("./_examples/TextareaExample"), { ssr: false });
const TooltipExample = dynamicImport(() => import("./_examples/TooltipExample"), { ssr: false });
const PopoverExample = dynamicImport(() => import("./_examples/PopoverExample"), { ssr: false });
const SheetExample = dynamicImport(() => import("./_examples/SheetExample"), { ssr: false });
const SwitchExample = dynamicImport(() => import("./_examples/SwitchExample"), { ssr: false });
const SliderExample = dynamicImport(() => import("./_examples/SliderExample"), { ssr: false });
const OverlayControlsExample = dynamicImport(() => import("./_examples/OverlayControlsExample"), { ssr: false });
const RadioGroupExample = dynamicImport(() => import("./_examples/RadioGroupExample"), { ssr: false });
const ScrollAreaExample = dynamicImport(() => import("./_examples/ScrollAreaExample"), { ssr: false });
const TableExample = dynamicImport(() => import("./_examples/TableExample"), { ssr: false });
const ProgressExample = dynamicImport(() => import("./_examples/ProgressExample"), { ssr: false });
const SkeletonExample = dynamicImport(() => import("./_examples/SkeletonExample"), { ssr: false });
const CarouselExample = dynamicImport(() => import("./_examples/CarouselExample"), { ssr: false });
const DropdownMenuExample = dynamicImport(() => import("./_examples/DropdownMenuExample"), { ssr: false });
const ComboboxExample = dynamicImport(() => import("./_examples/ComboboxExample"), { ssr: false });
const MultiComboboxExample = dynamicImport(() => import("./_examples/MultiComboboxExample"), { ssr: false });
const SectionExample = dynamicImport(() => import("./_examples/SectionExample"), { ssr: false });
const GridExample = dynamicImport(() => import("./_examples/GridExample"), { ssr: false });
const ListExample = dynamicImport(() => import("./_examples/ListExample"), { ssr: false });
const WatermarkExample = dynamicImport(() => import("./_examples/WatermarkExample"), { ssr: false });
const TimelineExample = dynamicImport(() => import("./_examples/TimelineExample"), { ssr: false });
const SmartImageExample = dynamicImport(() => import("./_examples/SmartImageExample"), { ssr: false });
const FallingIconsExample = dynamicImport(() => import("./_examples/FallingIconsExample"), { ssr: false });
const CategoryTreeSelectExample = dynamicImport(() => import("./_examples/CategoryTreeSelectExample"), { ssr: false });
const InputExample = dynamicImport(() => import("./_examples/InputExample"), { ssr: false });
const DatePickerExample = dynamicImport(() => import("./_examples/DatePickerExample"), { ssr: false });
const ColorPickerExample = dynamicImport(() => import("./_examples/ColorPickerExample"), { ssr: false });
const TimePickerExample = dynamicImport(() => import("./_examples/TimePickerExample"), { ssr: false });
const CalendarExample = dynamicImport(() => import("./_examples/CalendarExample"), { ssr: false });
const PaginationExample = dynamicImport(() => import("./_examples/PaginationExample"), { ssr: false });
const ImageUploadExample = dynamicImport(() => import("./_examples/ImageUploadExample"), { ssr: false });
const AlertExample = dynamicImport(() => import("./_examples/AlertExample"), { ssr: false });
const AccessDeniedExample = dynamicImport(() => import("./_examples/AccessDeniedExample"), { ssr: false });
const ClientOnlyExample = dynamicImport(() => import("./_examples/ClientOnlyExample"), { ssr: false });
const LoadingExample = dynamicImport(() => import("./_examples/LoadingExample"), { ssr: false });
const NotificationModalExample = dynamicImport(() => import("./_examples/NotificationModalExample"), { ssr: false });
const DataTableExample = dynamicImport(() => import("./_examples/DataTableExample"), { ssr: false });
const FormExample = dynamicImport(() => import("./_examples/FormExample"), { ssr: false });
const ThemeToggleExample = dynamicImport(() => import("./_examples/ThemeToggleExample"), { ssr: false });
const NotificationBellExample = dynamicImport(() => import("./_examples/NotificationBellExample"), { ssr: false });
const FloatingContactsExample = dynamicImport(() => import("./_examples/FloatingContactsExample"), { ssr: false });
const TableOfContents = dynamicImport(() => import("./_components/TableOfContents"), { ssr: false });
const DocsHeader = dynamicImport(() => import("./_components/DocsHeader"), { ssr: false });
const ThemeToggleHeadlessExample = dynamicImport(() => import("./_examples/ThemeToggleHeadlessExample"), { ssr: false });
const LanguageSwitcherHeadlessExample = dynamicImport(() => import("./_examples/LanguageSwitcherHeadlessExample"), { ssr: false });

export default function UnderverseGuidePage() {
  return <DocsContent />;
}

function DocsContent() {
  return (
    <ThemeProvider>
      <IntlDemoProvider>
        <ToastProvider>
          <ActiveSectionProvider>
            <DocsInner />
          </ActiveSectionProvider>
        </ToastProvider>
      </IntlDemoProvider>
    </ThemeProvider>
  );
}

function DocsInner() {
  const { useTranslations } = require("next-intl");
  const t = useTranslations("DocsUnderverse");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen">
      <DocsHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl space-y-10">
            <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
            <p className="text-muted-foreground">
              {t.rich("pageDescription", {
                componentsPath: (chunks: React.ReactNode) => <code className="mx-1">{chunks}</code>,
                packageName: (chunks: React.ReactNode) => <code className="mx-1">{chunks}</code>,
              })}
            </p>

            <DocSection id="install" title={t("sections.install.title")}>
              <CodeBlock
                code={`# ${t("sections.install.npmComment")}\nnpm i @underverse-ui/underverse\n\n# ${t(
                  "sections.install.peerDepsComment"
                )}\nnpm i react react-dom next next-intl --save`}
              />
              <CodeBlock
                code={`// ${t(
                  "sections.install.usageComment"
                )}\nimport { Button, Badge, Modal, Tabs, ToastProvider, useToast } from '@underverse-ui/underverse';`}
              />
            </DocSection>

            <DocSection id="button" title={t("sections.button.title")}>
              <ButtonExample />
            </DocSection>

            <DocSection id="badge" title={t("sections.badge.title")}>
              <BadgeExample />
            </DocSection>

            <DocSection id="avatar" title={t("sections.avatar.title")}>
              <AvatarExample />
            </DocSection>

            <DocSection id="breadcrumb" title={t("sections.breadcrumb.title")}>
              <BreadcrumbExample />
            </DocSection>

            <DocSection id="card" title={t("sections.card.title")}>
              <CardExample />
            </DocSection>

            <DocSection id="checkbox" title={t("sections.checkbox.title")}>
              <CheckboxExample />
            </DocSection>

            <DocSection id="textarea" title={t("sections.textarea.title")}>
              <TextareaExample />
            </DocSection>

            <DocSection id="modal" title={t("sections.modal.title")}>
              <ModalExample />
            </DocSection>

            <DocSection id="tabs" title={t("sections.tabs.title")}>
              <TabsExample />
            </DocSection>

            <DocSection id="toast" title={t("sections.toast.title")}>
              <p className="text-muted-foreground">{t("sections.toast.description")}</p>
              <ToastExample />
            </DocSection>

            <DocSection id="imports" title={t("sections.imports.title")}>
              <CodeBlock code={`import { Button, Badge, Modal, Tabs, ToastProvider, useToast } from '@underverse-ui/underverse';`} />
              <h3 className="text-lg font-medium">{t("sections.imports.orInternalImport")}</h3>
              <CodeBlock
                code={`import Button from '@/components/ui/Button'\nimport Badge from '@/components/ui/Badge'\nimport Modal from '@/components/ui/Modal'\nimport { Tabs } from '@/components/ui/Tab'\nimport ToastProvider, { useToast } from '@/components/ui/Toast'`}
              />
            </DocSection>

            <DocSection id="alert" title={t("sections.alert.title")}>
              <AlertExample />
            </DocSection>

            <DocSection id="access-denied" title={t("sections.accessDenied.title")}>
              <AccessDeniedExample />
            </DocSection>

            <DocSection id="client-only" title={t("sections.clientOnly.title")}>
              <ClientOnlyExample />
            </DocSection>

            <DocSection id="loading" title={t("sections.loading.title")}>
              <LoadingExample />
            </DocSection>

            <DocSection id="tooltip" title={t("sections.tooltip.title")}>
              <TooltipExample />
            </DocSection>

            <DocSection id="popover" title={t("sections.popover.title")}>
              <PopoverExample />
            </DocSection>

            <DocSection id="sheet" title={t("sections.sheet.title")}>
              <SheetExample />
            </DocSection>

            <DocSection id="switch" title={t("sections.switch.title")}>
              <SwitchExample />
            </DocSection>

            <DocSection id="slider" title={t("sections.slider.title")}>
              <SliderExample />
            </DocSection>

            <DocSection id="overlay-controls" title={t("sections.overlayControls.title")}>
              <OverlayControlsExample />
            </DocSection>

            <DocSection id="radio-group" title={t("sections.radioGroup.title")}>
              <RadioGroupExample />
            </DocSection>

            <DocSection id="scroll-area" title={t("sections.scrollArea.title")}>
              <ScrollAreaExample />
            </DocSection>

            <DocSection id="table" title={t("sections.table.title")}>
              <TableExample />
            </DocSection>

            <DocSection id="progress" title={t("sections.progress.title")}>
              <ProgressExample />
            </DocSection>

            <DocSection id="skeleton" title={t("sections.skeleton.title")}>
              <SkeletonExample />
            </DocSection>

            <DocSection id="carousel" title={t("sections.carousel.title")}>
              <CarouselExample />
            </DocSection>

            <DocSection id="dropdown-menu" title={t("sections.dropdownMenu.title")}>
              <DropdownMenuExample />
            </DocSection>

            <DocSection id="combobox" title={t("sections.combobox.title")}>
              <ComboboxExample />
            </DocSection>

            <DocSection id="multi-combobox" title={t("sections.multiCombobox.title")}>
              <MultiComboboxExample />
            </DocSection>

            <DocSection id="section" title={t("sections.section.title")}>
              <SectionExample />
            </DocSection>

            <DocSection id="grid" title={t("sections.grid.title")}>
              <GridExample />
            </DocSection>

            <DocSection id="list" title={t("sections.list.title")}>
              <ListExample />
            </DocSection>

            <DocSection id="watermark" title={t("sections.watermark.title")}>
              <WatermarkExample />
            </DocSection>

            <DocSection id="timeline" title={t("sections.timeline.title")}>
              <TimelineExample />
            </DocSection>

            <DocSection id="smart-image" title={t("sections.smartImage.title")}>
              <SmartImageExample />
            </DocSection>

            <DocSection id="falling-icons" title={t("sections.fallingIcons.title")}>
              <FallingIconsExample />
            </DocSection>

            <DocSection id="category-tree-select" title={t("sections.categoryTreeSelect.title")}>
              <CategoryTreeSelectExample />
            </DocSection>

            <DocSection id="image-upload" title={t("sections.imageUpload.title")}>
              <ImageUploadExample />
            </DocSection>

            <DocSection id="notification-modal" title={t("sections.notificationModal.title")}>
              <NotificationModalExample />
            </DocSection>

            <DocSection id="data-table" title={t("sections.dataTable.title")}>
              <DataTableExample />
            </DocSection>

            <DocSection id="input" title={t("sections.input.title")}>
              <InputExample />
            </DocSection>

            <DocSection id="date-picker" title={t("sections.datePicker.title")}>
              <DatePickerExample />
            </DocSection>

            <DocSection id="calendar" title={t("sections.calendar.title")}>
              <CalendarExample />
            </DocSection>

            <DocSection id="color-picker" title={t("sections.colorPicker.title")}>
              <ColorPickerExample />
            </DocSection>

            <DocSection id="time-picker" title={t("sections.timePicker.title")}>
              <TimePickerExample />
            </DocSection>

            <DocSection id="pagination" title={t("sections.pagination.title")}>
              <PaginationExample />
            </DocSection>

            <DocSection id="form" title={t("sections.form.title")}>
              <FormExample />
            </DocSection>

            <DocSection id="theme-toggle" title={t("sections.themeToggle.title")}>
              <ThemeToggleExample />
            </DocSection>

            <DocSection id="language-switcher-headless" title={t("sections.languageSwitcherHeadless.title")}>
              <div className="mt-4">
                <LanguageSwitcherHeadlessExample />
              </div>
            </DocSection>

            <DocSection id="notification-bell" title={t("sections.notificationBell.title")}>
              <NotificationBellExample />
            </DocSection>

            <DocSection id="floating-contacts" title={t("sections.floatingContacts.title")}>
              <FloatingContactsExample />
            </DocSection>
          </main>

          {/* Mobile Sheet for Table of Contents */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} side="left">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t("tableOfContents") || "Table of Contents"}</h2>
              <TableOfContents />
            </div>
          </Sheet>

          {/* Desktop Sidebar - Table of Contents on the right (sticky) */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-auto">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </div>
  );
}
