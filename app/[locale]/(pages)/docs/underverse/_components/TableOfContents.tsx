"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { useActiveSection } from "./ActiveSectionContext";

interface TocSection {
  id: string;
  labelKey: string;
}

const sections: TocSection[] = [
  { id: "install", labelKey: "sections.install.title" },
  { id: "button", labelKey: "sections.button.title" },
  { id: "badge", labelKey: "sections.badge.title" },
  { id: "avatar", labelKey: "sections.avatar.title" },
  { id: "breadcrumb", labelKey: "sections.breadcrumb.title" },
  { id: "card", labelKey: "sections.card.title" },
  { id: "checkbox", labelKey: "sections.checkbox.title" },
  { id: "textarea", labelKey: "sections.textarea.title" },
  { id: "modal", labelKey: "sections.modal.title" },
  { id: "tabs", labelKey: "sections.tabs.title" },
  { id: "toast", labelKey: "sections.toast.title" },
  { id: "imports", labelKey: "sections.imports.title" },
  { id: "alert", labelKey: "sections.alert.title" },
  { id: "access-denied", labelKey: "sections.accessDenied.title" },
  { id: "client-only", labelKey: "sections.clientOnly.title" },
  { id: "loading", labelKey: "sections.loading.title" },
  { id: "tooltip", labelKey: "sections.tooltip.title" },
  { id: "popover", labelKey: "sections.popover.title" },
  { id: "sheet", labelKey: "sections.sheet.title" },
  { id: "switch", labelKey: "sections.switch.title" },
  { id: "slider", labelKey: "sections.slider.title" },
  { id: "overlay-controls", labelKey: "sections.overlayControls.title" },
  { id: "radio-group", labelKey: "sections.radioGroup.title" },
  { id: "scroll-area", labelKey: "sections.scrollArea.title" },
  { id: "table", labelKey: "sections.table.title" },
  { id: "progress", labelKey: "sections.progress.title" },
  { id: "skeleton", labelKey: "sections.skeleton.title" },
  { id: "carousel", labelKey: "sections.carousel.title" },
  { id: "dropdown-menu", labelKey: "sections.dropdownMenu.title" },
  { id: "combobox", labelKey: "sections.combobox.title" },
  { id: "multi-combobox", labelKey: "sections.multiCombobox.title" },
  { id: "section", labelKey: "sections.section.title" },
  { id: "grid", labelKey: "sections.grid.title" },
  { id: "list", labelKey: "sections.list.title" },
  { id: "watermark", labelKey: "sections.watermark.title" },
  { id: "timeline", labelKey: "sections.timeline.title" },
  { id: "smart-image", labelKey: "sections.smartImage.title" },
  { id: "falling-icons", labelKey: "sections.fallingIcons.title" },
  { id: "category-tree-select", labelKey: "sections.categoryTreeSelect.title" },
  { id: "image-upload", labelKey: "sections.imageUpload.title" },
  { id: "notification-modal", labelKey: "sections.notificationModal.title" },
  { id: "data-table", labelKey: "sections.dataTable.title" },
  { id: "input", labelKey: "sections.input.title" },
  { id: "date-picker", labelKey: "sections.datePicker.title" },
  { id: "tag-input", labelKey: "sections.tagInput.title" },
  { id: "calendar", labelKey: "sections.calendar.title" },
  { id: "color-picker", labelKey: "sections.colorPicker.title" },
  { id: "time-picker", labelKey: "sections.timePicker.title" },
  { id: "pagination", labelKey: "sections.pagination.title" },
  { id: "form", labelKey: "sections.form.title" },
  { id: "theme-toggle", labelKey: "sections.themeToggle.title" },
  { id: "notification-bell", labelKey: "sections.notificationBell.title" },
  { id: "floating-contacts", labelKey: "sections.floatingContacts.title" },
];

export default function TableOfContents() {
  const t = useTranslations("DocsUnderverse");
  const { activeId, setActiveId } = useActiveSection();
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastUserScrollTs = useRef<number>(0);
  const scrollPauseMs = 400;

  // On first load: focus Install (or hash target if present)
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    const target = hash || 'install';
    setActiveId(target);
    // If no hash, optionally align content to Install section
    if (!hash) {
      const el = document.getElementById('install');
      el?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [setActiveId]);

  // Auto-scroll to active item, but don't fight user scroll
  useEffect(() => {
    const item = activeItemRef.current;
    const container = navRef.current;
    if (!activeId || !item || !container) return;

    // Skip if user scrolled the TOC recently
    if (Date.now() - lastUserScrollTs.current < scrollPauseMs) return;

    const cRect = container.getBoundingClientRect();
    const iRect = item.getBoundingClientRect();
    const padding = 8; // small viewport padding
    const isAbove = iRect.top < cRect.top + padding;
    const isBelow = iRect.bottom > cRect.bottom - padding;

    if (isAbove || isBelow) {
      item.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
    }
  }, [activeId]);

  // Note: intentionally removed IntersectionObserver auto-activating logic.
  // Active item only changes when user clicks a TOC entry.

  const handleClick = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <nav
      ref={navRef}
      onScroll={() => { lastUserScrollTs.current = Date.now(); }}
      className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pb-4"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold mb-4 text-foreground/70">
          {t("tableOfContents")}
        </h3>
        <ul className="space-y-1 border-l border-border/40">
          {sections.map(({ id, labelKey }) => (
            <li key={id}>
              <button
                ref={activeId === id ? activeItemRef : null}
                onClick={() => handleClick(id)}
                className={cn(
                  "block w-full text-left text-sm py-1.5 px-3 -ml-px border-l-2 transition-all",
                  "hover:text-primary hover:border-primary/50",
                  activeId === id
                    ? "border-primary text-primary font-medium bg-primary/5"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {t(labelKey)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
