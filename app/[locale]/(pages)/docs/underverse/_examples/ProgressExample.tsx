"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Progress, { Progress as LinearProgress, CircularProgress, StepProgress, MiniProgress, BatteryProgress, SegmentedProgress, LoadingProgress } from "@/components/ui/Progress";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ProgressExample() {
  const t = useTranslations("DocsUnderverse");
  const [v, setV] = React.useState(40);

  const demo = (
    <div className="space-y-8">
      {/* Linear progress variants */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Linear variants, sizes, states</p>
        <LinearProgress value={v} showValue label="Tiến độ" description="Cập nhật giá trị bằng các nút bên dưới" />
        <div className="grid grid-cols-2 gap-3">
          <LinearProgress value={25} variant="primary" size="sm" showValue />
          <LinearProgress value={50} variant="success" size="md" striped />
          <LinearProgress value={70} variant="warning" size="lg" animated />
          <LinearProgress value={100} variant="danger" size="xl" status="complete" showValue />
          <LinearProgress value={40} variant="info" size="md" indeterminate />
          <LinearProgress value={60} variant="primary" size="md" status="error" showValue />
        </div>
        <div className="flex gap-2">
          <button className="text-sm px-2 py-1 border rounded" onClick={() => setV((x) => Math.max(0, x - 10))}>-10</button>
          <button className="text-sm px-2 py-1 border rounded" onClick={() => setV((x) => Math.min(100, x + 10))}>+10</button>
        </div>
      </div>

      {/* Circular progress */}
      <div className="space-y-3">
        <p className="text-sm font-medium">CircularProgress</p>
        <div className="flex flex-wrap items-center gap-6">
          <CircularProgress value={30} showValue />
          <CircularProgress value={65} variant="success" size={72} showValue />
          <CircularProgress value={90} variant="warning" size={72} />
          <CircularProgress value={100} variant="primary" showValue status="complete" />
          <CircularProgress value={50} indeterminate />
        </div>
      </div>

      {/* Step progress */}
      <div className="space-y-3">
        <p className="text-sm font-medium">StepProgress</p>
        <StepProgress steps={["Cart", "Shipping", "Payment", "Review"]} currentStep={2} />
      </div>

      {/* Mini progress */}
      <div className="space-y-3">
        <p className="text-sm font-medium">MiniProgress</p>
        <div className="flex flex-col gap-2">
          <MiniProgress value={20} showValue />
          <MiniProgress value={55} variant="warning" showValue />
          <MiniProgress value={90} variant="success" showValue />
        </div>
      </div>

      {/* Battery progress */}
      <div className="space-y-3">
        <p className="text-sm font-medium">BatteryProgress</p>
        <div className="flex items-center gap-4">
          <BatteryProgress value={15} showValue />
          <BatteryProgress value={45} showValue />
          <BatteryProgress value={85} showValue />
          <BatteryProgress value={60} charging showValue />
        </div>
      </div>

      {/* Segmented progress */}
      <div className="space-y-3">
        <p className="text-sm font-medium">SegmentedProgress</p>
        <div className="flex flex-col gap-2">
          <SegmentedProgress segments={10} activeSegments={3} />
          <SegmentedProgress segments={8} activeSegments={5} variant="success" size="lg" />
        </div>
      </div>

      {/* Loading progress */}
      <div className="space-y-3">
        <p className="text-sm font-medium">LoadingProgress</p>
        <div className="space-y-3">
          <LoadingProgress value={35} label="Uploading file" status="loading" speed="1.2 MB/s" timeRemaining="~12s left" />
          <LoadingProgress value={100} label="Processed" status="complete" />
          <LoadingProgress value={50} label="Failed step" status="error" />
          <LoadingProgress value={60} label="Paused job" status="paused" />
        </div>
      </div>
    </div>
  );

  const code =
    `import Progress, { Progress as LinearProgress, CircularProgress, StepProgress, MiniProgress, BatteryProgress, SegmentedProgress, LoadingProgress } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `const [v, setV] = useState(40)\n` +
    `\n` +
    `// Linear\n` +
    `<LinearProgress value={v} showValue label=\"Tiến độ\" description=\"Cập nhật giá trị bằng các nút bên dưới\" />\n` +
    `<LinearProgress value={25} variant=\"primary\" size=\"sm\" showValue />\n` +
    `<LinearProgress value={50} variant=\"success\" size=\"md\" striped />\n` +
    `<LinearProgress value={70} variant=\"warning\" size=\"lg\" animated />\n` +
    `<LinearProgress value={100} variant=\"danger\" size=\"xl\" status=\"complete\" showValue />\n` +
    `<LinearProgress value={40} variant=\"info\" size=\"md\" indeterminate />\n` +
    `<LinearProgress value={60} variant=\"primary\" size=\"md\" status=\"error\" showValue />\n\n` +
    `// Circular\n` +
    `<CircularProgress value={30} showValue />\n` +
    `<CircularProgress value={65} variant=\"success\" size={72} showValue />\n` +
    `<CircularProgress value={90} variant=\"warning\" size={72} />\n` +
    `<CircularProgress value={100} variant=\"primary\" showValue status=\"complete\" />\n` +
    `<CircularProgress value={50} indeterminate />\n\n` +
    `// StepProgress\n` +
    `<StepProgress steps={[\"Cart\", \"Shipping\", \"Payment\", \"Review\"]} currentStep={2} />\n\n` +
    `// MiniProgress\n` +
    `<MiniProgress value={20} showValue />\n` +
    `<MiniProgress value={55} variant=\"warning\" showValue />\n` +
    `<MiniProgress value={90} variant=\"success\" showValue />\n\n` +
    `// BatteryProgress\n` +
    `<BatteryProgress value={15} showValue />\n` +
    `<BatteryProgress value={45} showValue />\n` +
    `<BatteryProgress value={85} showValue />\n` +
    `<BatteryProgress value={60} charging showValue />\n\n` +
    `// SegmentedProgress\n` +
    `<SegmentedProgress segments={10} activeSegments={3} />\n` +
    `<SegmentedProgress segments={8} activeSegments={5} variant=\"success\" size=\"lg\" />\n\n` +
    `// LoadingProgress\n` +
    `<LoadingProgress value={35} label=\"Uploading file\" status=\"loading\" speed=\"1.2 MB/s\" timeRemaining=\"~12s left\" />\n` +
    `<LoadingProgress value={100} label=\"Processed\" status=\"complete\" />\n` +
    `<LoadingProgress value={50} label=\"Failed step\" status=\"error\" />\n` +
    `<LoadingProgress value={60} label=\"Paused job\" status=\"paused\" />`;

  const rows: PropsRow[] = [
    // Linear Progress
    { property: "Progress.value", description: t("props.progress.Progress.value"), type: "number", default: "-" },
    { property: "Progress.max", description: t("props.progress.Progress.max"), type: "number", default: "100" },
    { property: "Progress.className", description: t("props.progress.Progress.className"), type: "string", default: "-" },
    { property: "Progress.variant", description: t("props.progress.Progress.variant"), type: '"default" | "primary" | "success" | "warning" | "danger" | "info"', default: '"primary"' },
    { property: "Progress.size", description: t("props.progress.Progress.size"), type: '"sm" | "md" | "lg" | "xl"', default: '"md"' },
    { property: "Progress.showValue", description: t("props.progress.Progress.showValue"), type: "boolean", default: "false" },
    { property: "Progress.label", description: t("props.progress.Progress.label"), type: "string", default: "-" },
    { property: "Progress.animated", description: t("props.progress.Progress.animated"), type: "boolean", default: "false" },
    { property: "Progress.striped", description: t("props.progress.Progress.striped"), type: "boolean", default: "false" },
    { property: "Progress.indeterminate", description: t("props.progress.Progress.indeterminate"), type: "boolean", default: "false" },
    { property: "Progress.description", description: t("props.progress.Progress.description"), type: "string", default: "-" },
    { property: "Progress.status", description: t("props.progress.Progress.status"), type: '"normal" | "error" | "complete"', default: '"normal"' },

    // CircularProgress
    { property: "CircularProgress.value", description: t("props.progress.CircularProgress.value"), type: "number", default: "-" },
    { property: "CircularProgress.max", description: t("props.progress.CircularProgress.max"), type: "number", default: "100" },
    { property: "CircularProgress.size", description: t("props.progress.CircularProgress.size"), type: "number", default: "48" },
    { property: "CircularProgress.variant", description: t("props.progress.CircularProgress.variant"), type: '"default" | "primary" | "success" | "warning" | "danger" | "info"', default: '"primary"' },
    { property: "CircularProgress.showValue", description: t("props.progress.CircularProgress.showValue"), type: "boolean", default: "false" },
    { property: "CircularProgress.indeterminate", description: t("props.progress.CircularProgress.indeterminate"), type: "boolean", default: "false" },

    // StepProgress
    { property: "StepProgress.steps", description: t("props.progress.StepProgress.steps"), type: "string[]", default: "-" },
    { property: "StepProgress.currentStep", description: t("props.progress.StepProgress.currentStep"), type: "number", default: "-" },
    { property: "StepProgress.className", description: t("props.progress.StepProgress.className"), type: "string", default: "-" },
    { property: "StepProgress.variant", description: t("props.progress.StepProgress.variant"), type: '"default" | "primary" | "success" | "warning" | "danger" | "info"', default: '"primary"' },
    { property: "StepProgress.size", description: t("props.progress.StepProgress.size"), type: '"sm" | "md" | "lg"', default: '"md"' },

    // MiniProgress
    { property: "MiniProgress.value", description: t("props.progress.MiniProgress.value"), type: "number", default: "-" },
    { property: "MiniProgress.max", description: t("props.progress.MiniProgress.max"), type: "number", default: "100" },
    { property: "MiniProgress.className", description: t("props.progress.MiniProgress.className"), type: "string", default: "-" },
    { property: "MiniProgress.variant", description: t("props.progress.MiniProgress.variant"), type: '"default" | "primary" | "success" | "warning" | "danger" | "info"', default: '"primary"' },
    { property: "MiniProgress.showValue", description: t("props.progress.MiniProgress.showValue"), type: "boolean", default: "false" },

    // BatteryProgress
    { property: "BatteryProgress.value", description: t("props.progress.BatteryProgress.value"), type: "number", default: "-" },
    { property: "BatteryProgress.max", description: t("props.progress.BatteryProgress.max"), type: "number", default: "100" },
    { property: "BatteryProgress.className", description: t("props.progress.BatteryProgress.className"), type: "string", default: "-" },
    { property: "BatteryProgress.charging", description: t("props.progress.BatteryProgress.charging"), type: "boolean", default: "false" },
    { property: "BatteryProgress.showValue", description: t("props.progress.BatteryProgress.showValue"), type: "boolean", default: "false" },

    // SegmentedProgress
    { property: "SegmentedProgress.segments", description: t("props.progress.SegmentedProgress.segments"), type: "number", default: "-" },
    { property: "SegmentedProgress.activeSegments", description: t("props.progress.SegmentedProgress.activeSegments"), type: "number", default: "-" },
    { property: "SegmentedProgress.className", description: t("props.progress.SegmentedProgress.className"), type: "string", default: "-" },
    { property: "SegmentedProgress.variant", description: t("props.progress.SegmentedProgress.variant"), type: '"default" | "primary" | "success" | "warning" | "danger" | "info"', default: '"primary"' },
    { property: "SegmentedProgress.size", description: t("props.progress.SegmentedProgress.size"), type: '"sm" | "md" | "lg"', default: '"md"' },

    // LoadingProgress
    { property: "LoadingProgress.value", description: t("props.progress.LoadingProgress.value"), type: "number", default: "-" },
    { property: "LoadingProgress.max", description: t("props.progress.LoadingProgress.max"), type: "number", default: "100" },
    { property: "LoadingProgress.className", description: t("props.progress.LoadingProgress.className"), type: "string", default: "-" },
    { property: "LoadingProgress.variant", description: t("props.progress.LoadingProgress.variant"), type: '"default" | "primary" | "success" | "warning" | "danger" | "info"', default: '"primary"' },
    { property: "LoadingProgress.label", description: t("props.progress.LoadingProgress.label"), type: "string", default: "-" },
    { property: "LoadingProgress.status", description: t("props.progress.LoadingProgress.status"), type: '"loading" | "complete" | "error" | "paused"', default: '"loading"' },
    { property: "LoadingProgress.speed", description: t("props.progress.LoadingProgress.speed"), type: "string", default: "-" },
    { property: "LoadingProgress.timeRemaining", description: t("props.progress.LoadingProgress.timeRemaining"), type: "string", default: "-" },
  ];
  const order = rows.map(r => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Progress.md" />;

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

