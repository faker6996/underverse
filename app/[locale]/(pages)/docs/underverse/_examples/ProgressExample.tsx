"use client";

import React from "react";
import Progress, { Progress as LinearProgress, CircularProgress, StepProgress, MiniProgress, BatteryProgress, SegmentedProgress, LoadingProgress } from "@/components/ui/Progress";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ProgressExample() {
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

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

