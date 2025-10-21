"use client";

import React from "react";
export const dynamic = "force-dynamic";
import ToastProvider from "@/components/ui/Toast";
import IntlDemoProvider from "./_components/IntlDemoProvider";
import CodeBlock from "./_components/CodeBlock";
import DocSection from "./_components/DocSection";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ButtonExample from "./_examples/ButtonExample";
import ButtonAdvancedExample from "./_examples/ButtonAdvancedExample";
import BadgeExample from "./_examples/BadgeExample";
import ModalExample from "./_examples/ModalExample";
import TabsExample from "./_examples/TabsExample";
import ToastExample from "./_examples/ToastExample";
import AvatarExample from "./_examples/AvatarExample";
import BreadcrumbExample from "./_examples/BreadcrumbExample";
import CardExample from "./_examples/CardExample";
import CheckboxExample from "./_examples/CheckboxExample";
import TextareaExample from "./_examples/TextareaExample";
import TooltipExample from "./_examples/TooltipExample";
import PopoverExample from "./_examples/PopoverExample";
import SheetExample from "./_examples/SheetExample";
import SwitchExample from "./_examples/SwitchExample";
import SliderExample from "./_examples/SliderExample";
import RadioGroupExample from "./_examples/RadioGroupExample";
import ScrollAreaExample from "./_examples/ScrollAreaExample";
import TableExample from "./_examples/TableExample";
import ProgressExample from "./_examples/ProgressExample";
import SkeletonExample from "./_examples/SkeletonExample";
import CarouselExample from "./_examples/CarouselExample";
import DropdownMenuExample from "./_examples/DropdownMenuExample";
import ComboboxExample from "./_examples/ComboboxExample";
import MultiComboboxExample from "./_examples/MultiComboboxExample";
import SectionExample from "./_examples/SectionExample";
import SmartImageExample from "./_examples/SmartImageExample";
import CategoryTreeSelectExample from "./_examples/CategoryTreeSelectExample";
import InputExample from "./_examples/InputExample";
import DatePickerExample from "./_examples/DatePickerExample";
import PaginationExample from "./_examples/PaginationExample";
import ImageUploadExample from "./_examples/ImageUploadExample";
import AlertExample from "./_examples/AlertExample";
import AccessDeniedExample from "./_examples/AccessDeniedExample";
import ClientOnlyExample from "./_examples/ClientOnlyExample";
import LoadingExample from "./_examples/LoadingExample";
import NotificationModalExample from "./_examples/NotificationModalExample";
import DataTableExample from "./_examples/DataTableExample";

export default function UnderverseGuidePage() {
  return (
    <IntlDemoProvider>
    <ToastProvider>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Underverse UI – Hướng dẫn sử dụng</h1>
        <p className="text-muted-foreground">
          Trang này minh họa cách dùng các UI component có sẵn trong dự án. Bạn có thể import trực tiếp từ
          <code className="mx-1">components/ui</code> trong dự án, hoặc từ gói <code className="mx-1">@underverse-ui/underverse</code> sau khi publish.
        </p>

        <DocSection id="install" title="Cài đặt">
          <CodeBlock code={`# Cài qua npm\nnpm i @underverse-ui/underverse\n\n# Peer deps (nếu chưa có)\nnpm i react react-dom next next-intl --save`} />
          <CodeBlock code={`// Sử dụng trong dự án\nimport { Button, Badge, Modal, Tabs, ToastProvider, useToast } from '@underverse-ui/underverse';`} />
        </DocSection>

        <DocSection id="button" title="Button">
          <ButtonExample />
          <div className="mt-4">
            <ButtonAdvancedExample />
          </div>
        </DocSection>

        <DocSection id="badge" title="Badge">
          <BadgeExample />
        </DocSection>

        <DocSection id="avatar" title="Avatar">
          <AvatarExample />
        </DocSection>

        <DocSection id="breadcrumb" title="Breadcrumb">
          <BreadcrumbExample />
        </DocSection>

        <DocSection id="card" title="Card">
          <CardExample />
        </DocSection>

        <DocSection id="checkbox" title="Checkbox">
          <CheckboxExample />
        </DocSection>

        <DocSection id="textarea" title="Textarea">
          <TextareaExample />
        </DocSection>

        <DocSection id="modal" title="Modal">
          <ModalExample />
        </DocSection>

        <DocSection id="tabs" title="Tabs">
          <TabsExample />
        </DocSection>

        <DocSection id="toast" title="Toast">
          <p className="text-muted-foreground">Các nút dưới đây sẽ hiển thị toast.</p>
          <ToastExample />
        </DocSection>

        <DocSection id="imports" title="Import paths">
          <CodeBlock code={`import { Button, Badge, Modal, Tabs, ToastProvider, useToast } from '@underverse-ui/underverse';`} />
          <h3 className="text-lg font-medium">Hoặc import nội bộ dự án</h3>
          <CodeBlock code={`import Button from '@/components/ui/Button'\nimport Badge from '@/components/ui/Badge'\nimport Modal from '@/components/ui/Modal'\nimport { Tabs } from '@/components/ui/Tab'\nimport ToastProvider, { useToast } from '@/components/ui/Toast'`} />
        </DocSection>

        <DocSection id="alert" title="Alert (with i18n)">
          <AlertExample />
        </DocSection>

        <DocSection id="access-denied" title="AccessDenied">
          <AccessDeniedExample />
        </DocSection>

        <DocSection id="client-only" title="ClientOnly">
          <ClientOnlyExample />
        </DocSection>

        <DocSection id="loading" title="Loading / GlobalLoading">
          <LoadingExample />
        </DocSection>

        <DocSection id="tooltip" title="Tooltip">
          <TooltipExample />
        </DocSection>

        <DocSection id="popover" title="Popover">
          <PopoverExample />
        </DocSection>

        <DocSection id="sheet" title="Sheet">
          <SheetExample />
        </DocSection>

        <DocSection id="switch" title="Switch">
          <SwitchExample />
        </DocSection>

        <DocSection id="slider" title="Slider">
          <SliderExample />
        </DocSection>

        <DocSection id="radio-group" title="RadioGroup">
          <RadioGroupExample />
        </DocSection>

        <DocSection id="scroll-area" title="ScrollArea">
          <ScrollAreaExample />
        </DocSection>

        <DocSection id="table" title="Table">
          <TableExample />
        </DocSection>

        <DocSection id="progress" title="Progress">
          <ProgressExample />
        </DocSection>

        <DocSection id="skeleton" title="Skeleton">
          <SkeletonExample />
        </DocSection>

        <DocSection id="carousel" title="Carousel">
          <CarouselExample />
        </DocSection>

        <DocSection id="dropdown-menu" title="DropdownMenu">
          <DropdownMenuExample />
        </DocSection>

        <DocSection id="combobox" title="Combobox">
          <ComboboxExample />
        </DocSection>

        <DocSection id="multi-combobox" title="MultiCombobox">
          <MultiComboboxExample />
        </DocSection>

        <DocSection id="section" title="Section">
          <SectionExample />
        </DocSection>

        <DocSection id="smart-image" title="SmartImage">
          <SmartImageExample />
        </DocSection>

        <DocSection id="category-tree-select" title="CategoryTreeSelect">
          <CategoryTreeSelectExample />
        </DocSection>

        <DocSection id="image-upload" title="ImageUpload">
          <ImageUploadExample />
        </DocSection>

        <DocSection id="notification-modal" title="NotificationModal (with i18n)">
          <NotificationModalExample />
        </DocSection>

        <DocSection id="data-table" title="DataTable (with i18n)">
          <DataTableExample />
        </DocSection>

        <DocSection id="input" title="Input (with i18n)">
          <InputExample />
        </DocSection>

        <DocSection id="date-picker" title="DatePicker (with i18n)">
          <DatePickerExample />
        </DocSection>

        <DocSection id="pagination" title="Pagination (with i18n)">
          <PaginationExample />
        </DocSection>
      </div>
    </ToastProvider>
    </IntlDemoProvider>
  );
}
