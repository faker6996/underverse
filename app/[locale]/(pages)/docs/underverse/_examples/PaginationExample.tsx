"use client";

import React from "react";
import { Pagination } from "@/components/ui/Pagination";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function PaginationExample() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(95);
  const [size, setSize] = React.useState<"sm" | "md" | "lg">("md");
  const [variant, setVariant] = React.useState<"default" | "outline" | "ghost">("outline");
  const [firstLast, setFirstLast] = React.useState(true);
  const [prevNext, setPrevNext] = React.useState(true);
  const [pageNumbers, setPageNumbers] = React.useState(true);

  // Advanced example: independent state to demonstrate changing pageSize and keeping page in range
  const [advancedPage, setAdvancedPage] = React.useState(1);
  const [advancedPageSize, setAdvancedPageSize] = React.useState(10);
  const advancedTotalItems = 237;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const advancedTotalPages = Math.max(1, Math.ceil(advancedTotalItems / advancedPageSize));

  const t = useTranslations("Pagination");
  const td = useTranslations("DocsUnderverse");

  const code =
    `import { Pagination } from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n\n` +
    `const [page, setPage] = useState(1)\n` +
    `const [pageSize, setPageSize] = useState(10)\n` +
    `const [totalItems, setTotalItems] = useState(95)\n` +
    `const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))\n` +
    `const t = useTranslations("Pagination")\n\n` +
    `<Pagination\n` +
    `  page={page}\n` +
    `  totalPages={totalPages}\n` +
    `  onChange={setPage}\n` +
    `  pageSize={pageSize}\n` +
    `  onPageSizeChange={setPageSize}\n` +
    `  pageSizeOptions={[5, 10, 20, 50]}\n` +
    `  totalItems={totalItems}\n` +
    `  size="md"\n` +
    `  variant="outline"\n` +
    `  showFirstLast={true}\n` +
    `  showPrevNext={true}\n` +
    `  showPageNumbers={true}\n` +
    `  showInfo\n` +
    `  labels={{...}}\n` +
    `/>\n\n` +
    `// Advanced: keep page in range when pageSize changes\n` +
    `const [advancedPage, setAdvancedPage] = useState(1)\n` +
    `const [advancedPageSize, setAdvancedPageSize] = useState(10)\n` +
    `const advancedTotalItems = 237\n` +
    `const advancedTotalPages = Math.max(1, Math.ceil(advancedTotalItems / advancedPageSize))\n\n` +
    `<Pagination\n` +
    `  page={advancedPage}\n` +
    `  totalPages={advancedTotalPages}\n` +
    `  onChange={setAdvancedPage}\n` +
    `  pageSize={advancedPageSize}\n` +
    `  pageSizeOptions={[10, 20, 50]}\n` +
    `  onPageSizeChange={(n) => {\n` +
    `    setAdvancedPageSize(n)\n` +
    `    setAdvancedPage(1)\n` +
    `  }}\n` +
    `  showInfo\n` +
    `  totalItems={advancedTotalItems}\n` +
    `  labels={{\n` +
    `    navigationLabel: t('navigationLabel'),\n` +
    `    showingResults: ({startItem, endItem, totalItems: ti}) =>\n` +
    `      t('showingResults', { startItem: startItem ?? 0, endItem: endItem ?? 0, totalItems: ti ?? 0 }),\n` +
    `    pageNumber: (p) => t('pageNumber', { page: p as number })\n` +
    `  }}\n` +
    `/>\n`;

  const demo = (
    <div className="space-y-8">
      {/* 1) Interactive playground: size/variant/toggles */}
      <div className="space-y-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          totalItems={totalItems}
          size={size}
          showFirstLast={firstLast}
          showPrevNext={prevNext}
          showPageNumbers={pageNumbers}
          showInfo
          labels={{
            navigationLabel: t("navigationLabel"),
            firstPage: t("firstPage"),
            previousPage: t("previousPage"),
            nextPage: t("nextPage"),
            lastPage: t("lastPage"),
            pageNumber: (p) => t("pageNumber", { page: p }),
          }}
        />

        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-muted-foreground mr-2">Size:</span>
          {(["sm", "md", "lg"] as const).map((s) => (
            <Button key={s} size="sm" variant={size === s ? "primary" : "outline"} onClick={() => setSize(s)}>
              {s}
            </Button>
          ))}
          <span className="text-muted-foreground mx-2">Variant:</span>
          {(["default", "outline", "ghost"] as const).map((v) => (
            <Button key={v} size="sm" variant={variant === v ? "primary" : "outline"} onClick={() => setVariant(v)}>
              {v}
            </Button>
          ))}
          <Button size="sm" variant={firstLast ? "primary" : "outline"} onClick={() => setFirstLast((v) => !v)}>
            First/Last
          </Button>
          <Button size="sm" variant={prevNext ? "primary" : "outline"} onClick={() => setPrevNext((v) => !v)}>
            Prev/Next
          </Button>
          <Button size="sm" variant={pageNumbers ? "primary" : "outline"} onClick={() => setPageNumbers((v) => !v)}>
            Numbers
          </Button>
          <Button size="sm" variant="outline" onClick={() => setTotalItems((n) => n + 10)}>
            +10 items
          </Button>
          <Button size="sm" variant="outline" onClick={() => setTotalItems((n) => Math.max(0, n - 10))}>
            -10 items
          </Button>
        </div>
      </div>

      {/* 2) Advanced: pageSize selector with info text */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Advanced example</p>
        <Pagination
          page={advancedPage}
          totalPages={advancedTotalPages}
          onChange={setAdvancedPage}
          pageSize={advancedPageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={(n) => {
            setAdvancedPageSize(n);
            setAdvancedPage(1);
          }}
          showInfo
          totalItems={advancedTotalItems}
          labels={{
            navigationLabel: t("navigationLabel"),
            pageNumber: (p) => t("pageNumber", { page: p as number }),
          }}
        />
      </div>
    </div>
  );

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
          {
            value: "docs",
            label: td("tabs.document"),
            content: (
              <div className="p-1">
                <PropsDocsTable
                  rows={[
                    { property: "page", description: td("props.pagination.page"), type: "number", default: "-" },
                    { property: "totalPages", description: td("props.pagination.totalPages"), type: "number", default: "-" },
                    { property: "onChange", description: td("props.pagination.onChange"), type: "(page: number) => void", default: "-" },
                    { property: "className", description: td("props.pagination.className"), type: "string", default: "-" },
                    { property: "size", description: td("props.pagination.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
                    {
                      property: "variant",
                      description: td("props.pagination.variant"),
                      type: '"default" | "outline" | "ghost"',
                      default: '"outline"',
                    },
                    { property: "showFirstLast", description: td("props.pagination.showFirstLast"), type: "boolean", default: "true" },
                    { property: "showPrevNext", description: td("props.pagination.showPrevNext"), type: "boolean", default: "true" },
                    { property: "showPageNumbers", description: td("props.pagination.showPageNumbers"), type: "boolean", default: "true" },
                    { property: "showInfo", description: td("props.pagination.showInfo"), type: "boolean", default: "false" },
                    { property: "disabled", description: td("props.pagination.disabled"), type: "boolean", default: "false" },
                    { property: "alignment", description: td("props.pagination.alignment"), type: '"left" | "center" | "right"', default: '"left"' },
                    { property: "pageSize", description: td("props.pagination.pageSize"), type: "number", default: "-" },
                    { property: "pageSizeOptions", description: td("props.pagination.pageSizeOptions"), type: "number[]", default: "-" },
                    {
                      property: "onPageSizeChange",
                      description: td("props.pagination.onPageSizeChange"),
                      type: "(size: number) => void",
                      default: "-",
                    },
                    { property: "totalItems", description: td("props.pagination.totalItems"), type: "number", default: "-" },
                    { property: "labels", description: td("props.pagination.labels"), type: "{ ... }", default: "-" },
                  ]}
                  order={[
                    "page",
                    "totalPages",
                    "onChange",
                    "className",
                    "size",
                    "variant",
                    "showFirstLast",
                    "showPrevNext",
                    "showPageNumbers",
                    "showInfo",
                    "disabled",
                    "alignment",
                    "pageSize",
                    "pageSizeOptions",
                    "onPageSizeChange",
                    "totalItems",
                    "labels",
                  ]}
                />
              </div>
            ),
          },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}
