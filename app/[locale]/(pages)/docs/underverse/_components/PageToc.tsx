"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bug, Edit3, Heart, List, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const REPOSITORY = "https://github.com/faker6996/underverse";

export default function PageToc() {
  const [headings, setHeadings] = React.useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = React.useState("");
  const [feedbackGiven, setFeedbackGiven] = React.useState(false);
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const t = useTranslations("DocsUnderverse.docs");

  React.useEffect(() => {
    const main = document.getElementById("docs-content");
    if (!main) return undefined;

    let observer: IntersectionObserver | undefined;
    const visible = new Map<string, IntersectionObserverEntry>();

    const connect = () => {
      observer?.disconnect();
      visible.clear();
      const elements = Array.from(main.querySelectorAll<HTMLElement>("[data-doc-heading][id]"));
      const nextHeadings = elements.map((element) => ({
        id: element.id,
        text: element.textContent?.trim() || element.id,
        level: element.tagName === "H3" ? (3 as const) : (2 as const),
      }));
      setHeadings(nextHeadings);
      setActiveId((current) => current || nextHeadings[0]?.id || "");

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visible.set(entry.target.id, entry);
            else visible.delete(entry.target.id);
          });

          const firstVisible = [...visible.values()].sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
          if (firstVisible) setActiveId(firstVisible.target.id);
        },
        { rootMargin: "-88px 0px -70% 0px", threshold: [0, 1] },
      );
      elements.forEach((element) => observer?.observe(element));
    };

    connect();
    const mutationObserver = new MutationObserver(connect);
    mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const editGithubUrl = slug
    ? `${REPOSITORY}/edit/main/app/%5Blocale%5D/(pages)/docs/underverse/%5Bslug%5D/page.tsx`
    : `${REPOSITORY}/edit/main/app/%5Blocale%5D/(pages)/docs/underverse/page.tsx`;
  const reportIssueUrl = `${REPOSITORY}/issues/new?labels=documentation&title=${encodeURIComponent(
    `Docs: ${slug || "overview"}`,
  )}`;

  return (
    <div className="space-y-7 text-sm">
      {headings.length > 0 ? (
        <section aria-labelledby="page-toc-title">
          <h2 id="page-toc-title" className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <List className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {t("onThisPage")}
          </h2>
          <nav aria-label={t("onThisPage")} className="mt-3 border-l border-border/70">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  heading.level === 3 ? "pl-5 text-xs" : "pl-3 text-sm",
                  activeId === heading.id
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </section>
      ) : null}

      <section className="border-t border-border/60 pt-5" aria-labelledby="community-title">
        <h2 id="community-title" className="text-xs font-semibold text-foreground">
          {t("community")}
        </h2>
        <div className="mt-3 space-y-2">
          <a
            href={editGithubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("editPage")}
          </a>
          <a
            href={reportIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bug className="h-3.5 w-3.5" aria-hidden="true" />
            {t("reportIssue")}
          </a>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-muted/20 p-3.5" aria-live="polite">
        <h2 className="text-xs font-semibold text-foreground">{t("helpfulQuestion")}</h2>
        {feedbackGiven ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            {t("feedbackThanks")}
          </p>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setFeedbackGiven(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
              {t("helpfulYes")}
            </button>
            <button
              type="button"
              onClick={() => setFeedbackGiven(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
              {t("helpfulNo")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
