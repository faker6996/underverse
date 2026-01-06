"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { useActiveSection } from "./ActiveSectionContext";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

interface TocSection {
  id: string;
  labelKey: string;
}

interface TocGroup {
  key: string;
  labelKey: string;
  sections: TocSection[];
  defaultOpen?: boolean;
}

// Grouped sections for better organization
const tocGroups: TocGroup[] = [
  {
    key: "getting-started",
    labelKey: "tocGroups.gettingStarted",
    defaultOpen: true,
    sections: [
      { id: "install", labelKey: "sections.install.title" },
      { id: "imports", labelKey: "sections.imports.title" },
    ],
  },
  {
    key: "core",
    labelKey: "tocGroups.core",
    defaultOpen: true,
    sections: [
      { id: "button", labelKey: "sections.button.title" },
      { id: "badge", labelKey: "sections.badge.title" },
      { id: "avatar", labelKey: "sections.avatar.title" },
      { id: "card", labelKey: "sections.card.title" },
      { id: "skeleton", labelKey: "sections.skeleton.title" },
      { id: "progress", labelKey: "sections.progress.title" },
    ],
  },
  {
    key: "form-inputs",
    labelKey: "tocGroups.formInputs",
    sections: [
      { id: "input", labelKey: "sections.input.title" },
      { id: "textarea", labelKey: "sections.textarea.title" },
      { id: "checkbox", labelKey: "sections.checkbox.title" },
      { id: "switch", labelKey: "sections.switch.title" },
      { id: "radio-group", labelKey: "sections.radioGroup.title" },
      { id: "slider", labelKey: "sections.slider.title" },
      { id: "tag-input", labelKey: "sections.tagInput.title" },
    ],
  },
  {
    key: "pickers",
    labelKey: "tocGroups.pickers",
    sections: [
      { id: "date-picker", labelKey: "sections.datePicker.title" },
      { id: "time-picker", labelKey: "sections.timePicker.title" },
      { id: "calendar", labelKey: "sections.calendar.title" },
      { id: "color-picker", labelKey: "sections.colorPicker.title" },
      { id: "combobox", labelKey: "sections.combobox.title" },
      { id: "multi-combobox", labelKey: "sections.multiCombobox.title" },
      { id: "category-tree-select", labelKey: "sections.categoryTreeSelect.title" },
    ],
  },
  {
    key: "feedback",
    labelKey: "tocGroups.feedback",
    sections: [
      { id: "modal", labelKey: "sections.modal.title" },
      { id: "toast", labelKey: "sections.toast.title" },
      { id: "alert", labelKey: "sections.alert.title" },
      { id: "tooltip", labelKey: "sections.tooltip.title" },
      { id: "popover", labelKey: "sections.popover.title" },
      { id: "sheet", labelKey: "sections.sheet.title" },
      { id: "loading", labelKey: "sections.loading.title" },
      { id: "notification-modal", labelKey: "sections.notificationModal.title" },
    ],
  },
  {
    key: "navigation",
    labelKey: "tocGroups.navigation",
    sections: [
      { id: "breadcrumb", labelKey: "sections.breadcrumb.title" },
      { id: "tabs", labelKey: "sections.tabs.title" },
      { id: "dropdown-menu", labelKey: "sections.dropdownMenu.title" },
      { id: "pagination", labelKey: "sections.pagination.title" },
      { id: "scroll-area", labelKey: "sections.scrollArea.title" },
    ],
  },
  {
    key: "data-display",
    labelKey: "tocGroups.dataDisplay",
    sections: [
      { id: "table", labelKey: "sections.table.title" },
      { id: "data-table", labelKey: "sections.dataTable.title" },
      { id: "list", labelKey: "sections.list.title" },
      { id: "grid", labelKey: "sections.grid.title" },
      { id: "timeline", labelKey: "sections.timeline.title" },
    ],
  },
  {
    key: "layout",
    labelKey: "tocGroups.layout",
    sections: [
      { id: "section", labelKey: "sections.section.title" },
      { id: "carousel", labelKey: "sections.carousel.title" },
      { id: "overlay-controls", labelKey: "sections.overlayControls.title" },
    ],
  },
  {
    key: "media",
    labelKey: "tocGroups.media",
    sections: [
      { id: "smart-image", labelKey: "sections.smartImage.title" },
      { id: "image-upload", labelKey: "sections.imageUpload.title" },
      { id: "watermark", labelKey: "sections.watermark.title" },
      { id: "falling-icons", labelKey: "sections.fallingIcons.title" },
    ],
  },
  {
    key: "utilities",
    labelKey: "tocGroups.utilities",
    sections: [
      { id: "form", labelKey: "sections.form.title" },
      { id: "client-only", labelKey: "sections.clientOnly.title" },
      { id: "access-denied", labelKey: "sections.accessDenied.title" },
      { id: "floating-contacts", labelKey: "sections.floatingContacts.title" },
    ],
  },
  {
    key: "theming",
    labelKey: "tocGroups.theming",
    sections: [
      { id: "theme-toggle", labelKey: "sections.themeToggle.title" },
      { id: "language-switcher-headless", labelKey: "sections.languageSwitcherHeadless.title" },
    ],
  },
  {
    key: "i18n",
    labelKey: "tocGroups.i18n",
    sections: [
      { id: "translation-provider", labelKey: "sections.translationProvider.title" },
      { id: "date-utils", labelKey: "sections.dateUtils.title" },
    ],
  },
];

// Flatten for search
const allSections = tocGroups.flatMap((g) => g.sections);

export default function TableOfContents() {
  const t = useTranslations("DocsUnderverse");
  const { activeId, setActiveId } = useActiveSection();
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastUserScrollTs = useRef<number>(0);
  const lastClickTs = useRef<number>(0);
  const scrollPauseMs = 400;
  const clickPauseMs = 800; // Pause observer for longer after click

  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    tocGroups.forEach((g) => {
      if (g.defaultOpen) initial.add(g.key);
    });
    return initial;
  });

  // Filter sections by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return tocGroups;
    const q = search.toLowerCase();
    return tocGroups
      .map((group) => ({
        ...group,
        sections: group.sections.filter((s) => {
          const label = t(s.labelKey).toLowerCase();
          return label.includes(q) || s.id.includes(q);
        }),
      }))
      .filter((g) => g.sections.length > 0);
  }, [search, t]);

  // Auto-expand group containing active item
  useEffect(() => {
    if (!activeId) return;
    const group = tocGroups.find((g) => g.sections.some((s) => s.id === activeId));
    if (group && !expandedGroups.has(group.key)) {
      setExpandedGroups((prev) => new Set([...prev, group.key]));
    }
  }, [activeId, expandedGroups]);

  // IntersectionObserver to auto-activate section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Skip if user just clicked a TOC item (content is still scrolling)
        if (Date.now() - lastClickTs.current < clickPauseMs) return;

        // Find the first visible section
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    allSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setActiveId]);

  // On first load: clear hash and scroll to top (install section)
  useEffect(() => {
    // Clear hash from URL on page load/refresh
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // Always start at install section
    setActiveId("install");
    const el = document.getElementById("install");
    el?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [setActiveId]);

  // Auto-scroll to active item in TOC
  useEffect(() => {
    const item = activeItemRef.current;
    const container = navRef.current;
    if (!activeId || !item || !container) return;
    if (Date.now() - lastUserScrollTs.current < scrollPauseMs) return;

    const cRect = container.getBoundingClientRect();
    const iRect = item.getBoundingClientRect();
    const padding = 8;
    const isAbove = iRect.top < cRect.top + padding;
    const isBelow = iRect.bottom > cRect.bottom - padding;

    if (isAbove || isBelow) {
      item.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeId]);

  const handleClick = useCallback(
    (id: string) => {
      lastClickTs.current = Date.now(); // Mark click time to pause observer
      setActiveId(id);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${id}`);
      }
    },
    [setActiveId]
  );

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const isSearching = search.trim().length > 0;

  return (
    <nav
      ref={navRef}
      onScroll={() => {
        lastUserScrollTs.current = Date.now();
      }}
      className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pb-4"
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground/70">{t("tableOfContents")}</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchComponents") || "Search..."}
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grouped Sections */}
        <div className="space-y-1 mt-3">
          {filteredGroups.map((group) => {
            const isExpanded = isSearching || expandedGroups.has(group.key);
            const hasActiveItem = group.sections.some((s) => s.id === activeId);

            return (
              <div key={group.key} className="border-l border-border/40">
                {/* Group Header */}
                <button
                  onClick={() => !isSearching && toggleGroup(group.key)}
                  className={cn(
                    "flex items-center gap-1.5 w-full text-left text-xs font-medium py-1.5 px-2 -ml-px border-l-2 transition-all",
                    "hover:text-foreground",
                    hasActiveItem ? "border-primary/50 text-foreground" : "border-transparent text-muted-foreground"
                  )}
                >
                  {!isSearching && (isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
                  <span>{t(group.labelKey) || group.key}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/70">{group.sections.length}</span>
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <ul className="ml-3 space-y-0.5">
                    {group.sections.map(({ id, labelKey }) => (
                      <li key={id}>
                        <button
                          ref={activeId === id ? activeItemRef : null}
                          onClick={() => handleClick(id)}
                          className={cn(
                            "block w-full text-left text-xs py-1 px-2 -ml-px border-l-2 transition-all rounded-r-sm",
                            "hover:text-primary hover:border-primary/50 hover:bg-primary/5",
                            activeId === id ? "border-primary text-primary font-medium bg-primary/10" : "border-transparent text-muted-foreground"
                          )}
                        >
                          {t(labelKey)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredGroups.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">{t("noResults") || "No results found"}</div>}
      </div>
    </nav>
  );
}
