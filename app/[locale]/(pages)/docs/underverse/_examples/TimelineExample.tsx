"use client";

import * as React from "react";
import Timeline from "@/components/ui/Timeline";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { CheckCircle2, AlertTriangle, Clock, Package, Truck, MapPin, Star, Users, Code, Rocket, Award, Heart, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

export default function TimelineExample() {
  const t = useTranslations("DocsUnderverse");

  const demo = (
    <div className="space-y-8">
      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Variants</p>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Default</p>
            <Timeline size="md">
              <Timeline.Item title="Order placed" description="We have received your order" time="2024-08-12 09:12" status="primary" icon={Clock} />
              <Timeline.Item title="Payment confirmed" description="Your payment has been verified" time="2024-08-12 09:13" status="success" icon={CheckCircle2} />
              <Timeline.Item title="Shipped" description="Carrier picked up the parcel" time="2024-08-13 08:21" status="info" icon={Truck} />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Outlined</p>
            <Timeline variant="outlined">
              <Timeline.Item title="Project started" description="Initial planning phase" time="Week 1" status="success" icon={Rocket} />
              <Timeline.Item title="Development" description="Building core features" time="Week 2-4" status="primary" icon={Code} />
              <Timeline.Item title="Testing" description="Quality assurance" time="Week 5" status="warning" icon={CheckCircle2} />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Card</p>
            <Timeline variant="card">
              <Timeline.Item title="Registration opened" description="Sign up for the event" time="Jan 1, 2024" status="success" icon={Users} badge="Completed" />
              <Timeline.Item title="Early bird deadline" description="Get discounted tickets" time="Feb 15, 2024" status="warning" icon={Star} badge="Ending soon" />
              <Timeline.Item title="Event day" description="Join us for an amazing experience" time="Mar 20, 2024" status="primary" icon={Award} active />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Minimal</p>
            <Timeline variant="minimal">
              <Timeline.Item title="Account created" time="5 minutes ago" status="success" />
              <Timeline.Item title="Profile updated" time="3 minutes ago" status="info" />
              <Timeline.Item title="Settings changed" time="1 minute ago" status="default" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Modern</p>
            <Timeline variant="modern">
              <Timeline.Item title="AI Analysis Complete" description="Model training finished successfully" time="10:30 AM" status="success" icon={Zap} />
              <Timeline.Item title="Deployment in Progress" description="Rolling out to production" time="10:45 AM" status="primary" icon={Rocket} active />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Gradient</p>
            <Timeline variant="gradient">
              <Timeline.Item title="Premium Plan" description="Upgrade to unlock all features" time="Now" status="primary" icon={Star} badge="Popular" />
              <Timeline.Item title="Enterprise Plan" description="Custom solutions for teams" time="Contact us" status="info" icon={Award} />
            </Timeline>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Sizes</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Small</p>
            <Timeline size="sm" variant="outlined">
              <Timeline.Item title="Task 1" description="Completed" time="10:00" status="success" />
              <Timeline.Item title="Task 2" description="In progress" time="11:00" status="primary" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Medium (default)</p>
            <Timeline size="md" variant="outlined">
              <Timeline.Item title="Task 1" description="Completed" time="10:00" status="success" />
              <Timeline.Item title="Task 2" description="In progress" time="11:00" status="primary" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Large</p>
            <Timeline size="lg" variant="card">
              <Timeline.Item title="Major Milestone" description="Project phase completed" time="Today" status="success" icon={Award} />
              <Timeline.Item title="Next Phase" description="Starting new chapter" time="Tomorrow" status="primary" icon={Rocket} />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Extra Large</p>
            <Timeline size="xl" variant="gradient">
              <Timeline.Item title="Epic Achievement" description="Something amazing happened" time="Just now" status="success" icon={Star} badge="New" />
            </Timeline>
          </div>
        </div>
      </div>

      {/* Alignments */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Alignments</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Left (default)</p>
            <Timeline variant="outlined">
              <Timeline.Item title="Step 1" description="First step" time="10:00" status="success" />
              <Timeline.Item title="Step 2" description="Second step" time="11:00" status="primary" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Right</p>
            <Timeline variant="outlined" align="right">
              <Timeline.Item title="Step 1" description="First step" time="10:00" status="success" />
              <Timeline.Item title="Step 2" description="Second step" time="11:00" status="primary" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Alternate</p>
            <Timeline variant="card" align="alternate">
              <Timeline.Item title="Phase 1" description="Planning" time="Q1 2024" status="success" icon={MapPin} />
              <Timeline.Item title="Phase 2" description="Development" time="Q2 2024" status="primary" icon={Code} />
              <Timeline.Item title="Phase 3" description="Launch" time="Q3 2024" status="info" icon={Rocket} />
            </Timeline>
          </div>
        </div>
      </div>

      {/* Line Styles */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Line Styles</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Solid (default)</p>
            <Timeline lineStyle="solid">
              <Timeline.Item title="Event 1" time="10:00" status="success" />
              <Timeline.Item title="Event 2" time="11:00" status="primary" />
              <Timeline.Item title="Event 3" time="12:00" status="info" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Dashed</p>
            <Timeline lineStyle="dashed">
              <Timeline.Item title="Event 1" time="10:00" status="success" />
              <Timeline.Item title="Event 2" time="11:00" status="primary" />
              <Timeline.Item title="Event 3" time="12:00" status="info" />
            </Timeline>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Dotted</p>
            <Timeline lineStyle="dotted">
              <Timeline.Item title="Event 1" time="10:00" status="success" />
              <Timeline.Item title="Event 2" time="11:00" status="primary" />
              <Timeline.Item title="Event 3" time="12:00" status="info" />
            </Timeline>
          </div>
        </div>
      </div>

      {/* Animated Timeline */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Animated Timeline</p>
        <Timeline variant="card" animate>
          <Timeline.Item title="Initialized" description="System boot complete" time="00:01" status="success" icon={Zap} />
          <Timeline.Item title="Loading modules" description="Dependencies loaded" time="00:02" status="primary" icon={Package} />
          <Timeline.Item title="Ready" description="Application started" time="00:03" status="success" icon={CheckCircle2} />
        </Timeline>
      </div>

      {/* Dense Mode */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Dense Mode</p>
        <Timeline variant="outlined" dense>
          <Timeline.Item title="Compact event 1" description="Less padding" time="10:00" status="success" />
          <Timeline.Item title="Compact event 2" description="More items visible" time="11:00" status="primary" />
          <Timeline.Item title="Compact event 3" description="Efficient use of space" time="12:00" status="info" />
          <Timeline.Item title="Compact event 4" description="Perfect for dense information" time="13:00" status="warning" />
        </Timeline>
      </div>

      {/* Custom Dots */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Custom Dots</p>
        <Timeline variant="card">
          <Timeline.Item title="Custom emoji dot" description="Use any React node as dot" time="10:00" dot={<span className="text-2xl">🎉</span>} />
          <Timeline.Item title="Another custom dot" description="Heart icon" time="11:00" dot={<Heart className="h-6 w-6 text-red-500 fill-red-500" />} />
          <Timeline.Item title="Number dot" description="Step indicator" time="12:00" dot={<div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>} />
        </Timeline>
      </div>

      {/* Collapsible Items */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Collapsible Items</p>
        <Timeline variant="card">
          <Timeline.Item
            title="Order Details"
            description="Click to view order information"
            time="2024-08-12 09:12"
            status="primary"
            icon={Package}
            collapsible
            expandContent={
              <div className="space-y-2">
                <p className="text-sm"><strong>Order ID:</strong> #12345</p>
                <p className="text-sm"><strong>Items:</strong> 3 products</p>
                <p className="text-sm"><strong>Total:</strong> $299.99</p>
                <Button size="sm" variant="outline">View Full Details</Button>
              </div>
            }
          />
          <Timeline.Item
            title="Shipping Information"
            description="Track your package"
            time="2024-08-13 08:21"
            status="info"
            icon={Truck}
            collapsible
            expandContent={
              <div className="space-y-2">
                <p className="text-sm"><strong>Carrier:</strong> FedEx</p>
                <p className="text-sm"><strong>Tracking:</strong> 1234567890</p>
                <p className="text-sm"><strong>ETA:</strong> 2-3 business days</p>
              </div>
            }
          />
        </Timeline>
      </div>

      {/* Horizontal Mode */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Horizontal Mode</p>
        <Timeline mode="horizontal" variant="card">
          <Timeline.Item title="Step 1" description="Getting started" status="success" icon={MapPin} />
          <Timeline.Item title="Step 2" description="In progress" status="primary" icon={Code} active />
          <Timeline.Item title="Step 3" description="Coming soon" status="default" icon={Rocket} />
        </Timeline>
      </div>

      {/* Without Line */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Without Connecting Line</p>
        <Timeline variant="card" showLine={false}>
          <Timeline.Item title="Independent Event 1" description="No connecting line" time="10:00" status="success" icon={Star} />
          <Timeline.Item title="Independent Event 2" description="Standalone item" time="11:00" status="primary" icon={Award} />
        </Timeline>
      </div>
    </div>
  );

  const code =
    `import { Timeline } from '@underverse-ui/underverse'\n` +
    `import { CheckCircle2, Clock, Truck, Rocket, Code, Users, Star, Award, Zap, Package, MapPin, Heart } from 'lucide-react'\n` +
    `import Button from '@underverse-ui/underverse/Button'\n\n` +
    `// Default variant\n` +
    `<Timeline size='md'>\n` +
    `  <Timeline.Item\n` +
    `    title='Order placed'\n` +
    `    description='We have received your order'\n` +
    `    time='2024-08-12 09:12'\n` +
    `    status='primary'\n` +
    `    icon={Clock}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Payment confirmed'\n` +
    `    description='Your payment has been verified'\n` +
    `    time='2024-08-12 09:13'\n` +
    `    status='success'\n` +
    `    icon={CheckCircle2}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Shipped'\n` +
    `    description='Carrier picked up the parcel'\n` +
    `    time='2024-08-13 08:21'\n` +
    `    status='info'\n` +
    `    icon={Truck}\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Outlined variant\n` +
    `<Timeline variant='outlined'>\n` +
    `  <Timeline.Item\n` +
    `    title='Project started'\n` +
    `    description='Initial planning phase'\n` +
    `    time='Week 1'\n` +
    `    status='success'\n` +
    `    icon={Rocket}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Development'\n` +
    `    description='Building core features'\n` +
    `    time='Week 2-4'\n` +
    `    status='primary'\n` +
    `    icon={Code}\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Card variant with badges\n` +
    `<Timeline variant='card'>\n` +
    `  <Timeline.Item\n` +
    `    title='Registration opened'\n` +
    `    description='Sign up for the event'\n` +
    `    time='Jan 1, 2024'\n` +
    `    status='success'\n` +
    `    icon={Users}\n` +
    `    badge='Completed'\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Event day'\n` +
    `    description='Join us for an amazing experience'\n` +
    `    time='Mar 20, 2024'\n` +
    `    status='primary'\n` +
    `    icon={Award}\n` +
    `    active\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Minimal variant\n` +
    `<Timeline variant='minimal'>\n` +
    `  <Timeline.Item title='Account created' time='5 minutes ago' status='success' />\n` +
    `  <Timeline.Item title='Profile updated' time='3 minutes ago' status='info' />\n` +
    `  <Timeline.Item title='Settings changed' time='1 minute ago' status='default' />\n` +
    `</Timeline>\n\n` +
    `// Modern variant\n` +
    `<Timeline variant='modern'>\n` +
    `  <Timeline.Item\n` +
    `    title='AI Analysis Complete'\n` +
    `    description='Model training finished successfully'\n` +
    `    time='10:30 AM'\n` +
    `    status='success'\n` +
    `    icon={Zap}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Deployment in Progress'\n` +
    `    description='Rolling out to production'\n` +
    `    time='10:45 AM'\n` +
    `    status='primary'\n` +
    `    icon={Rocket}\n` +
    `    active\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Gradient variant\n` +
    `<Timeline variant='gradient'>\n` +
    `  <Timeline.Item\n` +
    `    title='Premium Plan'\n` +
    `    description='Upgrade to unlock all features'\n` +
    `    time='Now'\n` +
    `    status='primary'\n` +
    `    icon={Star}\n` +
    `    badge='Popular'\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Sizes\n` +
    `<Timeline size='sm' variant='outlined'>\n` +
    `  <Timeline.Item title='Task 1' description='Completed' time='10:00' status='success' />\n` +
    `</Timeline>\n\n` +
    `<Timeline size='lg' variant='card'>\n` +
    `  <Timeline.Item\n` +
    `    title='Major Milestone'\n` +
    `    description='Project phase completed'\n` +
    `    time='Today'\n` +
    `    status='success'\n` +
    `    icon={Award}\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Alignments\n` +
    `<Timeline variant='outlined' align='right'>\n` +
    `  <Timeline.Item title='Step 1' description='First step' time='10:00' status='success' />\n` +
    `</Timeline>\n\n` +
    `<Timeline variant='card' align='alternate'>\n` +
    `  <Timeline.Item title='Phase 1' description='Planning' time='Q1 2024' status='success' icon={MapPin} />\n` +
    `  <Timeline.Item title='Phase 2' description='Development' time='Q2 2024' status='primary' icon={Code} />\n` +
    `  <Timeline.Item title='Phase 3' description='Launch' time='Q3 2024' status='info' icon={Rocket} />\n` +
    `</Timeline>\n\n` +
    `// Line styles\n` +
    `<Timeline lineStyle='dashed'>\n` +
    `  <Timeline.Item title='Event 1' time='10:00' status='success' />\n` +
    `  <Timeline.Item title='Event 2' time='11:00' status='primary' />\n` +
    `</Timeline>\n\n` +
    `<Timeline lineStyle='dotted'>\n` +
    `  <Timeline.Item title='Event 1' time='10:00' status='success' />\n` +
    `  <Timeline.Item title='Event 2' time='11:00' status='primary' />\n` +
    `</Timeline>\n\n` +
    `// Animated timeline\n` +
    `<Timeline variant='card' animate>\n` +
    `  <Timeline.Item\n` +
    `    title='Initialized'\n` +
    `    description='System boot complete'\n` +
    `    time='00:01'\n` +
    `    status='success'\n` +
    `    icon={Zap}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Loading modules'\n` +
    `    description='Dependencies loaded'\n` +
    `    time='00:02'\n` +
    `    status='primary'\n` +
    `    icon={Package}\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Dense mode\n` +
    `<Timeline variant='outlined' dense>\n` +
    `  <Timeline.Item title='Compact event 1' description='Less padding' time='10:00' status='success' />\n` +
    `  <Timeline.Item title='Compact event 2' description='More items visible' time='11:00' status='primary' />\n` +
    `  <Timeline.Item title='Compact event 3' description='Efficient use of space' time='12:00' status='info' />\n` +
    `</Timeline>\n\n` +
    `// Custom dots\n` +
    `<Timeline variant='card'>\n` +
    `  <Timeline.Item\n` +
    `    title='Custom emoji dot'\n` +
    `    description='Use any React node as dot'\n` +
    `    time='10:00'\n` +
    `    dot={<span className='text-2xl'>🎉</span>}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Another custom dot'\n` +
    `    description='Heart icon'\n` +
    `    time='11:00'\n` +
    `    dot={<Heart className='h-6 w-6 text-red-500 fill-red-500' />}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Number dot'\n` +
    `    description='Step indicator'\n` +
    `    time='12:00'\n` +
    `    dot={<div className='h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm'>3</div>}\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Collapsible items\n` +
    `<Timeline variant='card'>\n` +
    `  <Timeline.Item\n` +
    `    title='Order Details'\n` +
    `    description='Click to view order information'\n` +
    `    time='2024-08-12 09:12'\n` +
    `    status='primary'\n` +
    `    icon={Package}\n` +
    `    collapsible\n` +
    `    expandContent={\n` +
    `      <div className='space-y-2'>\n` +
    `        <p className='text-sm'><strong>Order ID:</strong> #12345</p>\n` +
    `        <p className='text-sm'><strong>Items:</strong> 3 products</p>\n` +
    `        <p className='text-sm'><strong>Total:</strong> $299.99</p>\n` +
    `        <Button size='sm' variant='outline'>View Full Details</Button>\n` +
    `      </div>\n` +
    `    }\n` +
    `  />\n` +
    `</Timeline>\n\n` +
    `// Horizontal mode\n` +
    `<Timeline mode='horizontal' variant='card'>\n` +
    `  <Timeline.Item title='Step 1' description='Getting started' status='success' icon={MapPin} />\n` +
    `  <Timeline.Item title='Step 2' description='In progress' status='primary' icon={Code} active />\n` +
    `  <Timeline.Item title='Step 3' description='Coming soon' status='default' icon={Rocket} />\n` +
    `</Timeline>\n\n` +
    `// Without connecting line\n` +
    `<Timeline variant='card' showLine={false}>\n` +
    `  <Timeline.Item\n` +
    `    title='Independent Event 1'\n` +
    `    description='No connecting line'\n` +
    `    time='10:00'\n` +
    `    status='success'\n` +
    `    icon={Star}\n` +
    `  />\n` +
    `  <Timeline.Item\n` +
    `    title='Independent Event 2'\n` +
    `    description='Standalone item'\n` +
    `    time='11:00'\n` +
    `    status='primary'\n` +
    `    icon={Award}\n` +
    `  />\n` +
    `</Timeline>`;

  const rows: PropsRow[] = [
    { property: "align", description: t("props.timeline.align"), type: "'left' | 'right' | 'alternate'", default: "'left'" },
    { property: "variant", description: t("props.timeline.variant"), type: "'default' | 'outlined' | 'card' | 'minimal' | 'modern' | 'gradient'", default: "'default'" },
    { property: "size", description: t("props.timeline.size"), type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
    { property: "mode", description: t("props.timeline.mode"), type: "'vertical' | 'horizontal'", default: "'vertical'" },
    { property: "lineColor", description: t("props.timeline.lineColor"), type: "string", default: "-" },
    { property: "lineStyle", description: t("props.timeline.lineStyle"), type: "'solid' | 'dashed' | 'dotted'", default: "'solid'" },
    { property: "items", description: t("props.timeline.items"), type: "TimelineItemProps[]", default: "-" },
    { property: "itemClassName", description: t("props.timeline.itemClassName"), type: "string", default: "-" },
    { property: "animate", description: t("props.timeline.animate"), type: "boolean", default: "false" },
    { property: "dense", description: t("props.timeline.dense"), type: "boolean", default: "false" },
    { property: "showLine", description: t("props.timeline.showLine"), type: "boolean", default: "true" },
  ];
  const itemRows: PropsRow[] = [
    { property: "title", description: t("props.timelineItem.title"), type: "ReactNode", default: "-" },
    { property: "description", description: t("props.timelineItem.description"), type: "ReactNode", default: "-" },
    { property: "time", description: t("props.timelineItem.time"), type: "ReactNode", default: "-" },
    { property: "icon", description: t("props.timelineItem.icon"), type: "React.ComponentType", default: "-" },
    { property: "status", description: t("props.timelineItem.status"), type: "'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'", default: "'default'" },
    { property: "color", description: t("props.timelineItem.color"), type: "string", default: "-" },
    { property: "active", description: t("props.timelineItem.active"), type: "boolean", default: "false" },
    { property: "dot", description: t("props.timelineItem.dot"), type: "ReactNode", default: "-" },
    { property: "badge", description: t("props.timelineItem.badge"), type: "ReactNode", default: "-" },
    { property: "collapsible", description: t("props.timelineItem.collapsible"), type: "boolean", default: "false" },
    { property: "expanded", description: t("props.timelineItem.expanded"), type: "boolean", default: "-" },
    { property: "onExpandChange", description: t("props.timelineItem.onExpandChange"), type: "(expanded: boolean) => void", default: "-" },
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

