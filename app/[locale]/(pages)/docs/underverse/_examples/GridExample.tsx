"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Grid from "@/components/ui/Grid";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function GridExample() {
  const t = useTranslations("DocsUnderverse");

  const demo = (
    <div className="space-y-8">
      {/* Variants Showcase */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Grid Variants</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Card</p>
            <Grid columns={3} gap={8} variant="card" className="p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-primary/10 rounded-md h-12" />
              ))}
            </Grid>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Glass</p>
            <Grid columns={3} gap={8} variant="glass" className="p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-primary/10 rounded-md h-12" />
              ))}
            </Grid>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Flat</p>
            <Grid columns={3} gap={8} variant="flat" className="p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-md h-12" />
              ))}
            </Grid>
          </div>
        </div>
      </div>

      {/* Animated Grid Items */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Animated Grid Items</p>
        <Grid columns={4} gap={12} variant="bordered" className="p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid.Item
              key={i}
              animationDelay={i * 50}
              className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg h-20 flex items-center justify-center font-semibold"
            >
              {i + 1}
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* Hoverable Cards */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Hoverable Items</p>
        <Grid minColumnWidth={180} gap={16} variant="card" className="p-4">
          {["Dashboard", "Analytics", "Settings", "Profile", "Reports", "Messages"].map((item, i) => (
            <Grid.Item
              key={i}
              hoverable
              className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-6 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20" />
              <p className="text-sm font-medium">{item}</p>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* Complex Layout with Areas */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Dashboard Layout (Grid Areas)</p>
        <Grid
          columns="1fr 1fr 1fr 1fr"
          rows="auto auto auto"
          gap={12}
          variant="glass"
          className="p-4"
          areas={[
            '"header header header header"',
            '"sidebar main main aside"',
            '"footer footer footer footer"',
          ]}
        >
          <Grid.Item area="header" className="bg-primary/10 rounded-lg p-4 flex items-center justify-center font-semibold">
            Header
          </Grid.Item>
          <Grid.Item area="sidebar" className="bg-secondary/10 rounded-lg p-4 flex items-center justify-center">
            Sidebar
          </Grid.Item>
          <Grid.Item area="main" className="bg-accent/10 rounded-lg p-8 flex items-center justify-center text-lg font-medium">
            Main Content
          </Grid.Item>
          <Grid.Item area="aside" className="bg-muted rounded-lg p-4 flex items-center justify-center">
            Aside
          </Grid.Item>
          <Grid.Item area="footer" className="bg-primary/10 rounded-lg p-4 flex items-center justify-center">
            Footer
          </Grid.Item>
        </Grid>
      </div>

      {/* Auto-flow Dense */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Auto-flow Dense (Masonry-like)</p>
        <Grid columns={4} gap={10} autoFlow="row dense" variant="flat" className="p-4">
          {[1, 2, 1, 3, 1, 2, 1, 1, 2, 1].map((span, i) => (
            <Grid.Item
              key={i}
              colSpan={span}
              className="bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-lg flex items-center justify-center font-bold text-lg"
              style={{ height: `${60 + span * 30}px` }}
            >
              {span}x
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* Responsive Grid */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Responsive (1→2→3→4 cols)</p>
        <Grid
          columns={1}
          gap={12}
          variant="bordered"
          className="p-4"
          responsive={{
            sm: { columns: 2 },
            md: { columns: 3 },
            lg: { columns: 4 },
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg h-24 flex items-center justify-center font-semibold"
            >
              Item {i + 1}
            </div>
          ))}
        </Grid>
      </div>
    </div>
  );

  const code =
    `import { Grid } from '@underverse-ui/underverse'\n\n` +
    `// Grid with Card variant\n` +
    `<Grid columns={3} gap={12} variant="card" className="p-4">\n` +
    `  {/* children */}\n` +
    `</Grid>\n\n` +
    `// Animated Grid Items\n` +
    `<Grid columns={4} gap={12}>\n` +
    `  {items.map((item, i) => (\n` +
    `    <Grid.Item key={i} animationDelay={i * 50}>\n` +
    `      {item}\n` +
    `    </Grid.Item>\n` +
    `  ))}\n` +
    `</Grid>\n\n` +
    `// Hoverable Cards\n` +
    `<Grid minColumnWidth={180} gap={16}>\n` +
    `  <Grid.Item hoverable>\n` +
    `    Dashboard\n` +
    `  </Grid.Item>\n` +
    `</Grid>\n\n` +
    `// Dashboard Layout with Grid Areas\n` +
    `<Grid\n` +
    `  columns="1fr 1fr 1fr 1fr"\n` +
    `  rows="auto auto auto"\n` +
    `  areas={[\n` +
    `    '"header header header header"',\n` +
    `    '"sidebar main main aside"',\n` +
    `    '"footer footer footer footer"'\n` +
    `  ]}\n` +
    `>\n` +
    `  <Grid.Item area="header">Header</Grid.Item>\n` +
    `  <Grid.Item area="sidebar">Sidebar</Grid.Item>\n` +
    `  <Grid.Item area="main">Main</Grid.Item>\n` +
    `  <Grid.Item area="aside">Aside</Grid.Item>\n` +
    `  <Grid.Item area="footer">Footer</Grid.Item>\n` +
    `</Grid>\n\n` +
    `// Auto-flow Dense (Masonry-like)\n` +
    `<Grid columns={4} autoFlow="row dense">\n` +
    `  <Grid.Item colSpan={2}>Wide</Grid.Item>\n` +
    `  <Grid.Item colSpan={1}>Normal</Grid.Item>\n` +
    `</Grid>\n\n` +
    `// Responsive Grid\n` +
    `<Grid\n` +
    `  columns={1}\n` +
    `  responsive={{\n` +
    `    sm: { columns: 2 },\n` +
    `    md: { columns: 3 },\n` +
    `    lg: { columns: 4 }\n` +
    `  }}\n` +
    `>\n` +
    `  {/* children */}\n` +
    `</Grid>`;

  const rows: PropsRow[] = [
    { property: "columns", description: t("props.grid.columns"), type: "number | string", default: "12" },
    { property: "rows", description: t("props.grid.rows"), type: "number | string", default: "-" },
    { property: "gap", description: t("props.grid.gap"), type: "number | string", default: "-" },
    { property: "gapX", description: t("props.grid.gapX"), type: "number | string", default: "-" },
    { property: "gapY", description: t("props.grid.gapY"), type: "number | string", default: "-" },
    { property: "autoRows", description: t("props.grid.autoRows"), type: "string", default: "-" },
    { property: "autoColumns", description: "Auto columns value", type: "string", default: "-" },
    { property: "autoFlow", description: "Grid auto-flow direction and density", type: "'row' | 'column' | 'row dense' | 'column dense'", default: "-" },
    { property: "minColumnWidth", description: t("props.grid.minColumnWidth"), type: "number | string", default: "-" },
    { property: "areas", description: t("props.grid.areas"), type: "string | string[]", default: "-" },
    { property: "alignItems", description: t("props.grid.alignItems"), type: "CSSProperties['alignItems']", default: "-" },
    { property: "justifyItems", description: t("props.grid.justifyItems"), type: "CSSProperties['justifyItems']", default: "-" },
    { property: "alignContent", description: t("props.grid.alignContent"), type: "CSSProperties['alignContent']", default: "-" },
    { property: "justifyContent", description: t("props.grid.justifyContent"), type: "CSSProperties['justifyContent']", default: "-" },
    { property: "variant", description: "Visual variant style", type: "'default' | 'bordered' | 'card' | 'flat' | 'glass'", default: "'default'" },
    { property: "animated", description: "Enable smooth animations for layout changes", type: "boolean", default: "false" },
    { property: "outlined", description: t("props.grid.outlined") + " (deprecated)", type: "boolean", default: "false" },
    { property: "responsive", description: t("props.grid.responsive"), type: "Record<Breakpoint, ResponsiveConfig>", default: "-" },
  ];
  const order = [
    "columns","rows","gap","gapX","gapY","autoRows","autoColumns","autoFlow","minColumnWidth","areas","alignItems","justifyItems","alignContent","justifyContent","variant","animated","outlined","responsive"
  ];
  const docs = <PropsDocsTable rows={rows} order={order} />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
