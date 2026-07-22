"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, Component, Search, X } from "lucide-react";
import { DOCS_REGISTRY, type ComponentDocItem } from "../_data/docs-registry";

interface DocCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function translationPath(key: string) {
  return key as never;
}

export default function DocCommandPalette({ open, onOpenChange }: DocCommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const t = useTranslations("DocsUnderverse");

  const entries = React.useMemo(
    () =>
      DOCS_REGISTRY.map((item) => ({
        item,
        title: t(translationPath(`sections.${item.translationKey}.title`)),
        category: t(translationPath(`tocGroups.${item.category}`)),
      })),
    [t],
  );

  const filtered = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    if (!normalizedQuery) return entries;
    return entries.filter(({ item, title, category }) =>
      [title, category, item.slug, ...item.importNames]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(normalizedQuery),
    );
  }, [entries, locale, query]);

  React.useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [onOpenChange, open]);

  React.useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setQuery("");
    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  React.useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [activeIndex, filtered.length]);

  const select = React.useCallback(
    (item: ComponentDocItem) => {
      onOpenChange(false);
      router.push(`/${locale}/docs/underverse/${item.slug}`);
    },
    [locale, onOpenChange, router],
  );

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex(Math.max(0, filtered.length - 1));
      return;
    }
    if (event.key === "Enter" && filtered[activeIndex]) {
      event.preventDefault();
      select(filtered[activeIndex].item);
      return;
    }
    if (event.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-background/75 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label={t("docs.closeSearch")}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="docs-search-title"
        onKeyDown={onDialogKeyDown}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
      >
        <h2 id="docs-search-title" className="sr-only">
          {t("docs.searchDialogTitle")}
        </h2>
        <div className="flex items-center border-b border-border/70 px-4">
          <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-controls="docs-search-results"
            aria-expanded="true"
            aria-activedescendant={filtered[activeIndex] ? `docs-result-${filtered[activeIndex].item.slug}` : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={t("docs.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("docs.closeSearch")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div
          id="docs-search-results"
          role="listbox"
          aria-label={t("docs.searchResults")}
          className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain p-2"
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground" role="status">
              {t("docs.noSearchResults", { query })}
            </p>
          ) : (
            filtered.map(({ item, title, category }, index) => {
              const active = index === activeIndex;
              return (
                <button
                  id={`docs-result-${item.slug}`}
                  key={item.slug}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => select(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                    active ? "bg-accent text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
                    <Component className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
                    <span className="mt-0.5 block truncate text-xs">{category} · {item.importNames.join(", ")}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/25 px-4 py-2 text-[11px] text-muted-foreground">
          <span>{t("docs.resultsCount", { count: filtered.length })}</span>
          <span className="hidden items-center gap-3 sm:flex">
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">↑↓</kbd> {t("docs.navigateHint")}</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">Enter</kbd> {t("docs.selectHint")}</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">Esc</kbd> {t("docs.closeHint")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
