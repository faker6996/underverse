"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUp, Search } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { ActiveSectionProvider } from "./ActiveSectionContext";
import DocCommandPalette from "./DocCommandPalette";
import DocsHeader from "./DocsHeader";
import IntlDemoProvider from "./IntlDemoProvider";
import PageToc from "./PageToc";
import { DOCS_BY_CATEGORY, DOCS_CATEGORIES } from "../_data/docs-registry";

function translationPath(key: string) {
  return key as never;
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || "vi";
  const t = useTranslations("DocsUnderverse");

  React.useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setShowBackToTop(window.scrollY > 560);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const navigation = (
    <nav aria-label={t("docs.componentNavigation")} className="space-y-7 text-sm">
      <div>
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t("tocGroups.gettingStarted")}
        </p>
        <Link
          href={`/${locale}/docs/underverse`}
          onClick={() => setMobileMenuOpen(false)}
          aria-current={pathname === `/${locale}/docs/underverse` ? "page" : undefined}
          className={cn(
            "block rounded-lg px-2.5 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname === `/${locale}/docs/underverse`
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          {t("docs.overview")}
        </Link>
      </div>

      {DOCS_CATEGORIES.map((category) => {
        const items = DOCS_BY_CATEGORY.get(category) ?? [];
        if (items.length === 0) return null;

        return (
          <div key={category}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t(translationPath(`tocGroups.${category}`))}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const href = `/${locale}/docs/underverse/${item.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <span className="truncate">
                      {t(translationPath(`sections.${item.translationKey}.title`))}
                    </span>
                    {item.status && item.status !== "stable" ? (
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                        {t(translationPath(`docs.status.${item.status}`))}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <ThemeProvider>
      <IntlDemoProvider>
        <ToastProvider>
          <ActiveSectionProvider>
            <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
              <a
                href="#docs-content"
                className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 motion-reduce:transition-none"
              >
                {t("docs.skipToContent")}
              </a>

              <DocsHeader
                onMobileMenuToggle={() => setMobileMenuOpen(true)}
                onSearchOpen={() => setSearchOpen(true)}
              />
              <DocCommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

              <div className="mx-auto flex w-full max-w-[100rem] flex-1 px-4 sm:px-6">
                <aside className="hidden w-60 shrink-0 border-r border-border/60 py-7 pr-5 lg:block">
                  <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain pr-1">
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="mb-7 flex h-9 w-full items-center justify-between rounded-lg border border-border/80 bg-muted/25 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/35 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{t("docs.searchPlaceholder")}</span>
                      </span>
                      <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
                    </button>
                    {navigation}
                  </div>
                </aside>

                <main id="docs-content" tabIndex={-1} className="min-w-0 flex-1 px-0 py-10 outline-none sm:px-6 lg:px-10">
                  {children}
                </main>

                <aside className="hidden w-60 shrink-0 border-l border-border/60 py-10 pl-6 xl:block">
                  <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain">
                    <PageToc />
                  </div>
                </aside>
              </div>

              <Sheet
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
                side="left"
                size="sm"
                title={t("docs.navigationTitle")}
              >
                <div className="px-4 pb-8 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="mb-7 flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    <span>{t("docs.searchPlaceholder")}</span>
                  </button>
                  {navigation}
                </div>
              </Sheet>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label={t("docs.backToTop")}
                tabIndex={showBackToTop ? 0 : -1}
                className={cn(
                  "fixed bottom-5 right-5 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/92 text-foreground shadow-md backdrop-blur transition-[opacity,transform,background-color] hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none",
                  showBackToTop
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </ActiveSectionProvider>
        </ToastProvider>
      </IntlDemoProvider>
    </ThemeProvider>
  );
}
