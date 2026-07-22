"use client";

import * as React from "react";
import { Braces, Code2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tabs as BaseTabs,
  SimpleTabs,
  PillTabs,
  VerticalTabs,
  type Tab,
  type TabsProps,
} from "../../packages/underverse/src/components/Tab";

export type { Tab, TabsProps } from "../../packages/underverse/src/components/Tab";
export { SimpleTabs, PillTabs, VerticalTabs };

const DOCUMENTATION_TAB_VALUES = new Set(["docs", "props", "api"]);
const SECTION_HEADING_TAGS = new Set(["h2", "h3", "h4", "h5", "p"]);

type PreviewSection = { title: string; content: React.ReactNode };
type SourceSection = { title: string; source: string };
type DocumentationSection = PreviewSection & { source?: string };

function elementProps(node: React.ReactElement): Record<string, unknown> {
  return node.props as Record<string, unknown>;
}

function textFromNode(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!React.isValidElement(node)) return "";
  return React.Children.toArray(elementProps(node).children as React.ReactNode)
    .map(textFromNode)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionFromElement(element: React.ReactElement): PreviewSection | null {
  const children = React.Children.toArray(
    elementProps(element).children as React.ReactNode,
  );
  const heading = children[0];

  if (
    !React.isValidElement(heading) ||
    typeof heading.type !== "string" ||
    !SECTION_HEADING_TAGS.has(heading.type)
  ) {
    return null;
  }

  const title = textFromNode(heading);
  if (!title || children.length < 2) return null;

  return {
    title,
    content: React.cloneElement(element, undefined, ...children.slice(1)),
  };
}

/** Promote conventionally named demo groups into independent examples. */
function extractPreviewSections(node: React.ReactNode): PreviewSection[] {
  let current = node;

  for (let depth = 0; depth < 5; depth += 1) {
    const elements = React.Children.toArray(current).filter(React.isValidElement);

    if (elements.length === 1) {
      const directSection = sectionFromElement(elements[0]);
      if (directSection) return [directSection];
      current = elementProps(elements[0]).children as React.ReactNode;
      continue;
    }

    const sections = elements
      .map(sectionFromElement)
      .filter((section): section is PreviewSection => section !== null);

    // Avoid promoting layout helpers and decorative siblings by accident.
    return sections.length === elements.length ? sections : [];
  }

  return [];
}

function findSource(node: React.ReactNode): string | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    const props = elementProps(child);
    if (typeof props.code === "string") return props.code;
    const nested = findSource(props.children as React.ReactNode);
    if (nested) return nested;
  }
  return null;
}

function replaceSource(node: React.ReactNode, source: string): React.ReactNode {
  let replaced = false;

  const visit = (value: React.ReactNode): React.ReactNode =>
    React.Children.map(value, (child) => {
      if (!React.isValidElement(child)) return child;
      const props = elementProps(child);

      if (!replaced && typeof props.code === "string") {
        replaced = true;
        return React.cloneElement(
          child,
          { code: source, language: props.language ?? "tsx" } as never,
        );
      }

      if (props.children === undefined) return child;
      return React.cloneElement(
        child,
        undefined,
        visit(props.children as React.ReactNode),
      );
    });

  return visit(node);
}

function splitSource(source: string): SourceSection[] {
  const lines = source.split("\n");
  const markers = lines.flatMap((line, index) => {
    const match = line.match(/^\/\/\s+(.+?)\s*$/);
    return match ? [{ index, title: match[1] }] : [];
  });

  if (markers.length < 2) return [];

  const preamble = lines.slice(0, markers[0].index).join("\n").trim();
  return markers.map((marker, index) => {
    const nextIndex = markers[index + 1]?.index ?? lines.length;
    const body = lines.slice(marker.index + 1, nextIndex).join("\n").trim();
    return {
      title: marker.title,
      source: [selectRelevantPreamble(preamble, body), `// ${marker.title}`, body]
        .filter(Boolean)
        .join("\n\n"),
    };
  });
}

function declarationNames(chunk: string): string[] {
  const firstLine = chunk.split("\n", 1)[0];
  const destructured = firstLine.match(/^(?:const|let|var)\s*[\[{]([^\]}]+)[\]}]/);
  if (destructured) {
    return destructured[1]
      .split(",")
      .map((part) => part.trim().split(/[:=]/, 1)[0].trim())
      .filter(Boolean);
  }

  const named = firstLine.match(
    /^(?:(?:export\s+)?(?:async\s+)?function|(?:export\s+)?class|(?:export\s+)?(?:const|let|var|type|interface))\s+([A-Za-z_$][\w$]*)/,
  );
  return named ? [named[1]] : [];
}

/** Keep imports plus only the setup declarations referenced by this example. */
function selectRelevantPreamble(preamble: string, body: string): string {
  if (!preamble) return "";
  const lines = preamble.split("\n");
  const chunks: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length) chunks.push(current.join("\n").trim());
    current = [];
  };

  lines.forEach((line) => {
    const startsDeclaration = /^(?:(?:export\s+)?(?:async\s+)?function|(?:export\s+)?class|(?:export\s+)?(?:const|let|var|type|interface))\b/.test(
      line,
    );
    if (startsDeclaration) flush();
    current.push(line);
  });
  flush();

  const setupChunks = chunks.map((chunk) => ({
    chunk,
    names: declarationNames(chunk),
  }));
  const required = new Set<number>();
  let dependencyText = body;
  let changed = true;

  while (changed) {
    changed = false;
    setupChunks.forEach(({ chunk, names }, index) => {
      if (required.has(index) || names.length === 0) return;
      const isReferenced = names.some((name) =>
        new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
          dependencyText,
        ),
      );
      if (!isReferenced) return;
      required.add(index);
      dependencyText += `\n${chunk}`;
      changed = true;
    });
  }

  return setupChunks
    .filter(({ names }, index) => names.length === 0 || required.has(index))
    .map(({ chunk }) => chunk)
    .join("\n\n")
    .trim();
}

function normalizeTitle(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function titleSimilarity(left: string, right: string): number {
  const leftTokens = new Set(normalizeTitle(left));
  const rightTokens = new Set(normalizeTitle(right));
  if (!leftTokens.size || !rightTokens.size) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return intersection / new Set([...leftTokens, ...rightTokens]).size;
}

function pairSections(preview: PreviewSection[], source: SourceSection[]): DocumentationSection[] {
  const unused = new Set(source.map((_, index) => index));

  return preview.map((section, previewIndex) => {
    let bestIndex = -1;
    let bestScore = 0;

    unused.forEach((sourceIndex) => {
      const score = titleSimilarity(section.title, source[sourceIndex].title);
      if (score > bestScore) {
        bestIndex = sourceIndex;
        bestScore = score;
      }
    });

    if (bestScore < 0.34 && preview.length === source.length && unused.has(previewIndex)) {
      bestIndex = previewIndex;
    }

    if (bestIndex < 0) return section;
    unused.delete(bestIndex);
    return { ...section, source: source[bestIndex].source };
  });
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "example"
  );
}

/**
 * Public component Tabs keep their original behavior. Only the conventional
 * preview/code/docs wrapper used by the documentation is enhanced.
 */
export function Tabs(props: TabsProps) {
  const { tabs } = props;
  const preview = tabs.find((tab) => tab.value === "preview");
  const code = tabs.find((tab) => tab.value === "code");
  const api = tabs.find((tab) => DOCUMENTATION_TAB_VALUES.has(tab.value));
  const hasUnsupportedTopLevelTab = tabs.some(
    (tab) => tab !== preview && tab !== code && tab !== api,
  );

  if (!preview || !code || hasUnsupportedTopLevelTab) return <BaseTabs {...props} />;
  return <DocumentationExamples preview={preview} code={code} api={api} />;
}

function DocumentationExamples({ preview, code, api }: { preview: Tab; code: Tab; api?: Tab }) {
  const t = useTranslations("DocsUnderverse.docs");
  const previewSections = extractPreviewSections(preview.content);
  const completeSource = findSource(code.content);
  const sourceSections = completeSource ? splitSource(completeSource) : [];
  const canSplit = previewSections.length > 1 && sourceSections.length > 1;
  const sections: DocumentationSection[] = canSplit
    ? pairSections(previewSections, sourceSections)
    : [{ title: t("basicExample"), content: preview.content, source: completeSource ?? undefined }];

  return (
    <div className="space-y-16">
      <div className="space-y-12">
        {sections.map((section, index) => (
          <DocumentationExampleCard
            key={`${section.title}-${index}`}
            id={`example-${slugify(section.title)}-${index + 1}`}
            title={section.title}
            preview={section.content}
            code={section.source ? replaceSource(code.content, section.source) : code.content}
          />
        ))}
      </div>

      {api ? (
        <section id="api-reference" aria-labelledby="api-reference-title" className="scroll-m-24">
          <div className="border-b border-border/60 pb-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <Braces className="h-4 w-4" aria-hidden="true" />
              <span>{t("apiEyebrow")}</span>
            </div>
            <h2 id="api-reference-title" data-doc-heading className="text-balance text-2xl font-semibold tracking-tight text-foreground">
              {t("apiReference")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t("apiDescription")}
            </p>
          </div>
          <div className="mt-5">{api.content}</div>
        </section>
      ) : null}
    </div>
  );
}

function DocumentationExampleCard({ id, title, preview, code }: { id: string; title: string; preview: React.ReactNode; code: React.ReactNode }) {
  const [codeOpen, setCodeOpen] = React.useState(false);
  const reactId = React.useId();
  const codeId = `${id}-code-${reactId.replace(/:/g, "")}`;
  const t = useTranslations("DocsUnderverse.docs");

  return (
    <article id={id} className="scroll-m-24" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} data-doc-heading className="mb-3 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {t("livePreview")}
          </div>
          <button
            type="button"
            onClick={() => setCodeOpen((current) => !current)}
            aria-expanded={codeOpen}
            aria-controls={codeId}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
            {codeOpen ? t("hideCode") : t("showCode")}
          </button>
        </div>

        <div className="relative min-h-36 overflow-x-auto bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_22%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_22%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] p-5 sm:p-7">
          <div className="relative rounded-xl bg-background/94 p-4 shadow-xs ring-1 ring-border/55 backdrop-blur-sm sm:p-6">
            {preview}
          </div>
        </div>

        {codeOpen ? (
          <div id={codeId} className="border-t border-border/70 bg-muted/10 p-3 sm:p-4">
            {code}
          </div>
        ) : null}
      </div>
    </article>
  );
}
