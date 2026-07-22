import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check, Package, Search } from "lucide-react";
import packageJson from "@/packages/underverse/package.json";
import CodeBlock from "./_components/CodeBlock";
import DocsLayout from "./_components/DocsLayout";
import { DOCS_BY_CATEGORY, DOCS_CATEGORIES, DOCS_REGISTRY } from "./_data/docs-registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://underverse-ui.com";

type UnderverseGuidePageProps = {
  params: Promise<{ locale: string }>;
};

function translationPath(key: string) {
  return key as never;
}

export async function generateMetadata({ params }: UnderverseGuidePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocsUnderverse" });
  const canonical = `${SITE_URL}/${locale}/docs/underverse`;

  return {
    title: t("docs.metaTitle"),
    description: t("docs.metaDescription"),
    alternates: { canonical },
    openGraph: {
      title: t("docs.metaTitle"),
      description: t("docs.metaDescription"),
      url: canonical,
      type: "website",
    },
  };
}

export default async function UnderverseGuidePage({ params }: UnderverseGuidePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocsUnderverse" });

  return (
    <DocsLayout>
      <article className="mx-auto w-full max-w-5xl pb-20">
        <header className="relative overflow-hidden border-b border-border/60 pb-12 pt-3">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/75 px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-xs backdrop-blur">
              <Package className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span translate="no">v{packageJson.version}</span>
              <span className="text-border" aria-hidden="true">/</span>
              <span>{t("docs.componentCount", { count: DOCS_REGISTRY.length })}</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-6xl">
              {t("docs.heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              {t("docs.heroDescription")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#installation"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none"
              >
                {t("docs.getStarted")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#components"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {t("docs.browseComponents")}
              </a>
            </div>
          </div>
        </header>

        <div className="space-y-16 pt-12">
          <section id="installation" aria-labelledby="installation-title" className="scroll-m-24">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <p className="text-sm font-semibold text-primary">01</p>
                <h2 id="installation-title" data-doc-heading className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {t("docs.installTitle")}
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                  {t("docs.installDescription")}
                </p>
              </div>
              <CodeBlock
                code="npm install @underverse-ui/underverse"
                language="shell"
                filename="Terminal"
              />
            </div>
          </section>

          <section id="first-component" aria-labelledby="first-component-title" className="scroll-m-24">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <p className="text-sm font-semibold text-primary">02</p>
                <h2 id="first-component-title" data-doc-heading className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {t("docs.firstComponentTitle")}
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                  {t("docs.firstComponentDescription")}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {["typed", "treeShakeable", "localized"].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{t(translationPath(`docs.features.${feature}`))}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <CodeBlock
                code={`import { Button } from '@underverse-ui/underverse';\n\nexport function SaveAction() {\n  return <Button variant="primary">Save changes</Button>;\n}`}
                language="tsx"
                filename="SaveAction.tsx"
              />
            </div>
          </section>

          <section id="components" aria-labelledby="components-title" className="scroll-m-24">
            <div className="border-b border-border/60 pb-6">
              <p className="text-sm font-semibold text-primary">03</p>
              <h2 id="components-title" data-doc-heading className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {t("docs.componentsTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                {t("docs.componentsDescription")}
              </p>
            </div>

            <div className="mt-9 space-y-12">
              {DOCS_CATEGORIES.map((category) => {
                const items = DOCS_BY_CATEGORY.get(category) ?? [];
                if (items.length === 0) return null;
                const categoryTitle = t(translationPath(`tocGroups.${category}`));

                return (
                  <section key={category} aria-labelledby={`category-${category}`}>
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <h3 id={`category-${category}`} className="text-xl font-semibold tracking-tight text-foreground">
                        {categoryTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("docs.categoryCount", { count: items.length })}
                      </p>
                    </div>
                    <div className="grid border-y border-border/60 sm:grid-cols-2 sm:divide-x sm:divide-border/60">
                      {items.map((item, index) => {
                        const title = t(translationPath(`sections.${item.translationKey}.title`));
                        return (
                          <Link
                            key={item.slug}
                            href={`/${locale}/docs/underverse/${item.slug}`}
                            className={`group flex min-w-0 items-center justify-between gap-4 px-1 py-4 transition-colors hover:bg-accent/40 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4 ${
                              index >= 2 ? "border-t border-border/60" : index === 1 ? "border-t border-border/60 sm:border-t-0" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                  {title}
                                </span>
                                {item.status && item.status !== "stable" ? (
                                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                                    {t(translationPath(`docs.status.${item.status}`))}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                {t("docs.componentDescription", { name: title, category: categoryTitle })}
                              </p>
                            </div>
                            <ArrowRight
                              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transform-none"
                              aria-hidden="true"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </div>
      </article>
    </DocsLayout>
  );
}
