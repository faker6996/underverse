"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DOCS_REGISTRY } from "../_data/docs-registry";

interface DocsFooterNavProps {
  currentSlug: string;
}

function translationPath(key: string) {
  return key as never;
}

export default function DocsFooterNav({ currentSlug }: DocsFooterNavProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const t = useTranslations("DocsUnderverse");
  const currentIndex = DOCS_REGISTRY.findIndex((item) => item.slug === currentSlug);
  const previous = currentIndex > 0 ? DOCS_REGISTRY[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < DOCS_REGISTRY.length - 1
    ? DOCS_REGISTRY[currentIndex + 1]
    : null;

  return (
    <nav aria-label={t("docs.paginationLabel")} className="grid gap-3 border-t border-border/60 pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/${locale}/docs/underverse/${previous.slug}`}
          rel="prev"
          className="group flex min-h-20 items-center gap-3 rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">{t("docs.previousPage")}</span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">
              {t(translationPath(`sections.${previous.translationKey}.title`))}
            </span>
          </span>
        </Link>
      ) : <span aria-hidden="true" />}

      {next ? (
        <Link
          href={`/${locale}/docs/underverse/${next.slug}`}
          rel="next"
          className="group flex min-h-20 items-center justify-end gap-3 rounded-xl border border-border/70 bg-background p-4 text-right transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">{t("docs.nextPage")}</span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">
              {t(translationPath(`sections.${next.translationKey}.title`))}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
        </Link>
      ) : <span aria-hidden="true" />}
    </nav>
  );
}
