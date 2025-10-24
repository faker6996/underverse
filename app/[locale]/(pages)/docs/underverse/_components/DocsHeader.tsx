"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ColorThemeCustomizer from "@/components/ui/ColorThemeCustomizer";
import { cn } from "@/lib/utils/cn";
import { SearchInput } from "@/components/ui/Input";
import { useActiveSection } from "./ActiveSectionContext";

const NPM_PACKAGE = process.env.NEXT_PUBLIC_NPM_PACKAGE || "@underverse-ui/underverse";
const NPM_VERSION = process.env.NEXT_PUBLIC_NPM_VERSION || "0.1.7";
const GITHUB_URL = "https://github.com/faker6996/underverse";

export default function DocsHeader() {
  const t = useTranslations("DocsUnderverse");
  const { setActiveId } = useActiveSection();

  const sections: { id: string; labelKey: string }[] = [
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
    { id: "smart-image", labelKey: "sections.smartImage.title" },
    { id: "category-tree-select", labelKey: "sections.categoryTreeSelect.title" },
    { id: "image-upload", labelKey: "sections.imageUpload.title" },
    { id: "notification-modal", labelKey: "sections.notificationModal.title" },
    { id: "data-table", labelKey: "sections.dataTable.title" },
    { id: "input", labelKey: "sections.input.title" },
    { id: "date-picker", labelKey: "sections.datePicker.title" },
    { id: "pagination", labelKey: "sections.pagination.title" },
    { id: "form", labelKey: "sections.form.title" },
    { id: "theme-toggle", labelKey: "sections.themeToggle.title" },
    { id: "notification-bell", labelKey: "sections.notificationBell.title" },
    { id: "floating-contacts", labelKey: "sections.floatingContacts.title" },
  ];

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const handleSearch = (value: string) => {
    const q = normalize(value || "").trim();
    if (!q) return;

    const labeled = sections.map((s) => ({ id: s.id, label: t(s.labelKey) }));

    // Exact id
    let targetId = labeled.find((s) => s.id === q)?.id;
    // Label includes query
    if (!targetId) targetId = labeled.find((s) => normalize(s.label).includes(q))?.id;
    // Id includes query
    if (!targetId) targetId = labeled.find((s) => s.id.includes(q))?.id;

    if (targetId) {
      setActiveId(targetId);
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
          {/* Logo / Title */}
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="512" cy="512" r="512" className="fill-background"/>
                <circle cx="512" cy="512" r="400" fill="none" className="stroke-primary" strokeWidth="80"/>
                <path d="M365 352 L365 550 C365 650 420 705 512 705 C604 705 659 650 659 550 L659 352"
                      className="stroke-primary" strokeWidth="80" strokeLinecap="round" fill="none"/>
              </svg>
              <span className="font-semibold text-lg hidden sm:inline-block">
                {t("pageTitle").split("–")[0].trim()}
              </span>
            </a>

            {/* Package Info */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href={`https://www.npmjs.com/package/${NPM_PACKAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                  "bg-accent/50 hover:bg-accent transition-colors",
                  "border border-border/50"
                )}
                title="View on npm"
              >
                <Package className="w-3.5 h-3.5" />
                <span className="text-muted-foreground">v{NPM_VERSION}</span>
              </a>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
                title="View on GitHub"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block w-64">
              <SearchInput
                size="sm"
                placeholder="Search docs..."
                onSearch={handleSearch}
              />
            </div>
            <ColorThemeCustomizer />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
