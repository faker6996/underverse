"use client";

import * as React from "react";
import Timeline from "@/components/ui/Timeline";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { CheckCircle2, Clock, Truck, Rocket, Code, Star, Zap, Package } from "lucide-react";

export default function TimelineExample() {
  const t = useTranslations("DocsUnderverse");

  const demo = (
    <div className="space-y-8">
      {/* Basic */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Basic</p>
        <Timeline>
          <Timeline.Item title="Order placed" description="We have received your order" time="09:12" status="primary" icon={Clock} />
          <Timeline.Item title="Payment confirmed" description="Your payment has been verified" time="09:13" status="success" icon={CheckCircle2} />
          <Timeline.Item title="Shipped" description="Carrier picked up the parcel" time="08:21" status="info" icon={Truck} />
        </Timeline>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Variants</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Card</p>
            <Timeline variant="card">
              <Timeline.Item title="Started" time="Week 1" status="success" icon={Rocket} badge="Done" />
              <Timeline.Item title="In Progress" time="Week 2" status="primary" icon={Code} active />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Minimal</p>
            <Timeline variant="minimal">
              <Timeline.Item title="Account created" time="5 min ago" status="success" />
              <Timeline.Item title="Profile updated" time="3 min ago" status="info" />
            </Timeline>
          </div>
        </div>
      </div>

      {/* Alignments & Line Styles */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Alignment & Line Style</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Alternate</p>
            <Timeline variant="outlined" align="alternate">
              <Timeline.Item title="Q1" description="Planning" status="success" />
              <Timeline.Item title="Q2" description="Development" status="primary" />
              <Timeline.Item title="Q3" description="Launch" status="info" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Dashed Line</p>
            <Timeline lineStyle="dashed">
              <Timeline.Item title="Step 1" time="10:00" status="success" />
              <Timeline.Item title="Step 2" time="11:00" status="primary" />
            </Timeline>
          </div>
        </div>
      </div>

      {/* Horizontal & Animated */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Horizontal & Animated</p>
        <Timeline mode="horizontal" variant="card" animate>
          <Timeline.Item title="Init" status="success" icon={Zap} />
          <Timeline.Item title="Loading" status="primary" icon={Package} active />
          <Timeline.Item title="Ready" status="default" icon={Star} />
        </Timeline>
      </div>
    </div>
  );

  const code = `import { Timeline } from '@underverse-ui/underverse'
import { CheckCircle2, Clock, Truck, Rocket, Code, Star, Zap, Package } from 'lucide-react'

// Basic usage
<Timeline>
  <Timeline.Item 
    title="Order placed" 
    description="We have received your order" 
    time="09:12" 
    status="primary" 
    icon={Clock} 
  />
  <Timeline.Item 
    title="Payment confirmed" 
    description="Your payment has been verified" 
    time="09:13" 
    status="success" 
    icon={CheckCircle2} 
  />
  <Timeline.Item 
    title="Shipped" 
    description="Carrier picked up the parcel" 
    time="08:21" 
    status="info" 
    icon={Truck} 
  />
</Timeline>

// Card variant with badge
<Timeline variant="card">
  <Timeline.Item title="Started" time="Week 1" status="success" icon={Rocket} badge="Done" />
  <Timeline.Item title="In Progress" time="Week 2" status="primary" icon={Code} active />
</Timeline>

// Minimal variant
<Timeline variant="minimal">
  <Timeline.Item title="Account created" time="5 min ago" status="success" />
  <Timeline.Item title="Profile updated" time="3 min ago" status="info" />
</Timeline>

// Alternate alignment
<Timeline variant="outlined" align="alternate">
  <Timeline.Item title="Q1" description="Planning" status="success" />
  <Timeline.Item title="Q2" description="Development" status="primary" />
  <Timeline.Item title="Q3" description="Launch" status="info" />
</Timeline>

// Horizontal mode with animation
<Timeline mode="horizontal" variant="card" animate>
  <Timeline.Item title="Init" status="success" icon={Zap} />
  <Timeline.Item title="Loading" status="primary" icon={Package} active />
  <Timeline.Item title="Ready" status="default" icon={Star} />
</Timeline>`;

  const rows: PropsRow[] = [
    {
      property: "variant",
      description: t("props.timeline.variant"),
      type: "'default' | 'outlined' | 'card' | 'minimal' | 'modern' | 'gradient'",
      default: "'default'",
    },
    { property: "align", description: t("props.timeline.align"), type: "'left' | 'right' | 'alternate'", default: "'left'" },
    { property: "size", description: t("props.timeline.size"), type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
    { property: "mode", description: t("props.timeline.mode"), type: "'vertical' | 'horizontal'", default: "'vertical'" },
    { property: "lineStyle", description: t("props.timeline.lineStyle"), type: "'solid' | 'dashed' | 'dotted'", default: "'solid'" },
    { property: "animate", description: t("props.timeline.animate"), type: "boolean", default: "false" },
    { property: "dense", description: t("props.timeline.dense"), type: "boolean", default: "false" },
    { property: "showLine", description: t("props.timeline.showLine"), type: "boolean", default: "true" },
  ];

  const itemRows: PropsRow[] = [
    { property: "title", description: t("props.timelineItem.title"), type: "ReactNode", default: "-" },
    { property: "description", description: t("props.timelineItem.description"), type: "ReactNode", default: "-" },
    { property: "time", description: t("props.timelineItem.time"), type: "ReactNode", default: "-" },
    { property: "icon", description: t("props.timelineItem.icon"), type: "React.ComponentType", default: "-" },
    {
      property: "status",
      description: t("props.timelineItem.status"),
      type: "'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'",
      default: "'default'",
    },
    { property: "active", description: t("props.timelineItem.active"), type: "boolean", default: "false" },
    { property: "badge", description: t("props.timelineItem.badge"), type: "ReactNode", default: "-" },
    { property: "dot", description: t("props.timelineItem.dot"), type: "ReactNode", default: "-" },
    { property: "collapsible", description: t("props.timelineItem.collapsible"), type: "boolean", default: "false" },
    { property: "expandContent", description: t("props.timelineItem.expandContent"), type: "ReactNode", default: "-" },
  ];

  const docs = (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-3">Timeline Props</h3>
        <PropsDocsTable rows={rows} />
      </div>
      <div>
        <h3 className="text-base font-semibold mb-3">Timeline.Item Props</h3>
        <PropsDocsTable rows={itemRows} />
      </div>
    </div>
  );

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
