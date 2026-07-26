"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Github, Menu, Package, Search } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UnderverseLogo from "@/components/ui/UnderverseLogo";
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
      <div className="mx-auto flex h-15 max-w-400 items-center gap-4 px-4 sm:px-6">
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
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
        >
          <UnderverseLogo size={32} variant="glowing" />
          <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline group-hover:text-primary transition-colors">
            Underverse <span className="text-primary font-extrabold">UI</span>
          </span>
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
