import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, Github, Package } from "lucide-react";
import CodeBlock from "../_components/CodeBlock";
import ComponentExample from "../_components/ComponentExample";
import DocsFooterNav from "../_components/DocsFooterNav";
import DocsLayout from "../_components/DocsLayout";
import {
  DOCS_REGISTRY,
  getComponentDocBySlug,
  getComponentImportCode,
} from "../_data/docs-registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://underverse-ui.com";
const GITHUB_REPOSITORY = "https://github.com/faker6996/underverse";

type ComponentDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function translationPath(key: string) {
  return key as never;
}

export function generateStaticParams() {
  return DOCS_REGISTRY.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ComponentDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getComponentDocBySlug(slug);

  if (!doc) return {};

  const t = await getTranslations({ locale, namespace: "DocsUnderverse" });
  const title = t(translationPath(`sections.${doc.translationKey}.title`));
  const category = t(translationPath(`tocGroups.${doc.category}`));
  const description = t("docs.componentDescription", { name: title, category });
  const canonical = `${SITE_URL}/${locale}/docs/underverse/${doc.slug}`;

  return {
    title: `${title} – Underverse UI`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} – Underverse UI`,
      description,
      url: canonical,
      type: "article",
    },
  };
}

export default async function ComponentDetailPage({ params }: ComponentDetailPageProps) {
  const { locale, slug } = await params;
  const doc = getComponentDocBySlug(slug);

  if (!doc) notFound();

  const t = await getTranslations({ locale, namespace: "DocsUnderverse" });
  const title = t(translationPath(`sections.${doc.translationKey}.title`));
  const category = t(translationPath(`tocGroups.${doc.category}`));
  const description = t("docs.componentDescription", { name: title, category });
  const sourceUrl = `${GITHUB_REPOSITORY}/blob/main/${doc.sourcePath}`;
  const categoryGuidanceKey = `docs.categoryUse.${doc.category}` as "docs.categoryUse.core";
  const related = DOCS_REGISTRY.filter(
    (item) => item.category === doc.category && item.slug !== doc.slug,
  ).slice(0, 3);

  return (
    <DocsLayout>
      <article className="mx-auto w-full max-w-4xl pb-20">
        <header className="border-b border-border/60 pb-9">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/${locale}/docs/underverse`}
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("docs.components")}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{category}</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-balance text-4xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
                  {title}
                </h1>
                {doc.status && doc.status !== "stable" ? (
                  <span className="rounded-md border border-primary/25 bg-primary/8 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                    {t(translationPath(`docs.status.${doc.status}`))}
                  </span>
                ) : null}
              </div>
              <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                {t("docs.source")}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </a>
              <a
                href="https://www.npmjs.com/package/@underverse-ui/underverse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Package className="h-4 w-4" aria-hidden="true" />
                {t("docs.package")}
              </a>
            </div>
          </div>
        </header>

        <div className="space-y-14 pt-10">
          <section aria-labelledby="quick-start">
            <h2
              id="quick-start"
              data-doc-heading
              className="scroll-m-24 text-balance text-2xl font-semibold tracking-tight text-foreground"
            >
              {t("docs.quickStart")}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {t("docs.quickStartDescription", { name: title })}
            </p>
            <div className="mt-5">
              <CodeBlock
                code={getComponentImportCode(doc)}
                language="tsx"
                filename="component.tsx"
              />
            </div>
          </section>

          <section aria-labelledby="examples">
            <div className="mb-5 border-b border-border/60 pb-4">
              <h2
                id="examples"
                data-doc-heading
                className="scroll-m-24 text-balance text-2xl font-semibold tracking-tight text-foreground"
              >
                {t("docs.examplesTitle")}
              </h2>
              <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
                {t("docs.examplesDescription", { name: title })}
              </p>
            </div>
            <ComponentExample slug={doc.slug} />
          </section>

          <section aria-labelledby="usage-guidance">
            <h2
              id="usage-guidance"
              data-doc-heading
              className="scroll-m-24 text-balance text-2xl font-semibold tracking-tight text-foreground"
            >
              {t("docs.usageGuidance")}
            </h2>
            <div className="mt-4 border-l-2 border-primary/50 pl-5">
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {t(categoryGuidanceKey, {
                  name: title,
                })}
              </p>
            </div>
          </section>

          <section aria-labelledby="accessibility">
            <h2
              id="accessibility"
              data-doc-heading
              className="scroll-m-24 text-balance text-2xl font-semibold tracking-tight text-foreground"
            >
              {t("docs.accessibility")}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {t("docs.accessibilityDescription", { name: title })}
            </p>
          </section>

          {related.length > 0 ? (
            <section aria-labelledby="related-components">
              <h2
                id="related-components"
                data-doc-heading
                className="scroll-m-24 text-balance text-2xl font-semibold tracking-tight text-foreground"
              >
                {t("docs.relatedComponents")}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {related.map((item) => {
                  const relatedTitle = t(
                    translationPath(`sections.${item.translationKey}.title`),
                  );
                  return (
                    <Link
                      key={item.slug}
                      href={`/${locale}/docs/underverse/${item.slug}`}
                      className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate text-sm font-semibold text-foreground">
                        {relatedTitle}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}

          <DocsFooterNav currentSlug={doc.slug} />
        </div>
      </article>
    </DocsLayout>
  );
}
