"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Github, Menu, Package, Search } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import packageJson from "@/packages/underverse/package.json";

interface DocsHeaderProps {
  onMobileMenuToggle: () => void;
  onSearchOpen: () => void;
}

export default function DocsHeader({ onMobileMenuToggle, onSearchOpen }: DocsHeaderProps) {
  const t = useTranslations("DocsUnderverse.docs");
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/92 backdrop-blur-xl supports-backdrop-filter:bg-background/78">
      <div className="mx-auto flex h-15 max-w-[100rem] items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label={t("openNavigation")}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link
          href={`/${locale}/docs/underverse`}
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="h-8 w-8" viewBox="0 0 64 64" role="img" aria-label="Underverse UI">
            <defs>
              <linearGradient id="docsUvGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="16" fill="url(#docsUvGradient)" />
            <path d="M22 17v21c0 7 4 10 10 10s10-3 10-10V17h-5v21c0 4-2 6-5 6s-5-2-5-6V17z" fill="#f8fafc" />
          </svg>
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">Underverse UI</span>
        </Link>

        <a
          href="https://www.npmjs.com/package/@underverse-ui/underverse"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-8 items-center gap-1.5 rounded-md border border-border/70 bg-muted/35 px-2 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
          aria-label={t("openPackage", { version: packageJson.version })}
        >
          <Package className="h-3.5 w-3.5" aria-hidden="true" />
          <span translate="no">v{packageJson.version}</span>
        </a>

        <button
          type="button"
          onClick={onSearchOpen}
          className="mx-auto hidden h-9 w-full max-w-sm items-center justify-between rounded-lg border border-border/80 bg-muted/30 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/35 hover:bg-muted/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
          aria-label={t("openSearch")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("searchPlaceholder")}</span>
          </span>
          <kbd className="ml-3 shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘ K
          </kbd>
        </button>

        <nav className="ml-auto flex items-center gap-1" aria-label={t("headerActions")}> 
          <a
            href="https://github.com/faker6996/underverse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("openGithub")}
          >
            <Github className="h-4.5 w-4.5" aria-hidden="true" />
          </a>
          <ThemeToggle />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
