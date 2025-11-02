"use client";

import React from "react";
import { GlobalLoading, InlineLoading, ButtonLoading } from "@/components/ui/GlobalLoading";
import { LoadingSpinner, LoadingDots, LoadingBar, InlineLoading as InlineLoadingComponent } from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { loading } from "@/lib/utils/loading";

export default function LoadingExample() {
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [inlineLoading, setInlineLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const showGlobal = () => {
    loading.show("Processing...");
    setTimeout(() => loading.hide(), 1200);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const code =
    `import { GlobalLoading, InlineLoading, ButtonLoading } from '@underverse-ui/underverse'\n` +
    `import { LoadingSpinner, LoadingDots, LoadingBar } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { loading } from '@/lib/utils/loading'\n\n` +
    `const [btnLoading, setBtnLoading] = useState(false)\n` +
    `const [progress, setProgress] = useState(0)\n\n` +
    `// Global Loading (Full Screen Overlay)\n` +
    `<GlobalLoading />\n` +
    `const showGlobal = () => {\n` +
    `  loading.show("Processing...")\n` +
    `  setTimeout(() => loading.hide(), 1200)\n` +
    `}\n` +
    `<Button onClick={showGlobal}>Show Global Loading</Button>\n\n` +
    `// Button Loading\n` +
    `<ButtonLoading isLoading={btnLoading} loadingText="Sending...">\n` +
    `  <Button onClick={() => { setBtnLoading(true); setTimeout(()=>setBtnLoading(false), 1000); }}>Submit</Button>\n` +
    `</ButtonLoading>\n\n` +
    `// LoadingSpinner - Sizes\n` +
    `<LoadingSpinner size="sm" />\n` +
    `<LoadingSpinner size="md" />\n` +
    `<LoadingSpinner size="lg" />\n\n` +
    `// LoadingSpinner - Colors\n` +
    `<LoadingSpinner color="primary" />\n` +
    `<LoadingSpinner color="foreground" />\n` +
    `<LoadingSpinner color="muted" />\n\n` +
    `// LoadingDots - Colors\n` +
    `<LoadingDots color="primary" />\n` +
    `<LoadingDots color="foreground" />\n` +
    `<LoadingDots color="muted" />\n\n` +
    `// LoadingBar - Progress States\n` +
    `<LoadingBar progress={30} label="30% complete" />\n` +
    `<LoadingBar progress={60} label="60% complete" />\n` +
    `<LoadingBar progress={100} label="Complete" />\n\n` +
    `// LoadingBar - Animated (No Progress)\n` +
    `<LoadingBar animated />\n\n` +
    `// InlineLoading - Spinner Variant\n` +
    `<InlineLoading message="Loading data..." variant="spinner" size="sm" />\n` +
    `<InlineLoading message="Loading data..." variant="spinner" size="md" />\n` +
    `<InlineLoading message="Loading data..." variant="spinner" size="lg" />\n\n` +
    `// InlineLoading - Dots Variant\n` +
    `<InlineLoading message="Loading data..." variant="dots" />\n\n` +
    `// InlineLoading - Without Message\n` +
    `<InlineLoading variant="spinner" />`;

  const demo = (
    <div className="space-y-6">
      <GlobalLoading />

      {/* Global Loading */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Global Loading (Full Screen Overlay)</p>
        <Button onClick={showGlobal} variant="primary">Show Global Loading</Button>
      </div>

      {/* Button Loading */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Button Loading</p>
        <ButtonLoading isLoading={btnLoading} loadingText="Sending...">
          <Button onClick={() => { setBtnLoading(true); setTimeout(()=>setBtnLoading(false), 1000); }}>Submit</Button>
        </ButtonLoading>
      </div>

      {/* LoadingSpinner - Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">LoadingSpinner - Sizes</p>
        <div className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </div>

      {/* LoadingSpinner - Colors */}
      <div className="space-y-2">
        <p className="text-sm font-medium">LoadingSpinner - Colors</p>
        <div className="flex items-center gap-4">
          <LoadingSpinner color="primary" />
          <LoadingSpinner color="foreground" />
          <LoadingSpinner color="muted" />
        </div>
      </div>

      {/* LoadingDots - Colors */}
      <div className="space-y-2">
        <p className="text-sm font-medium">LoadingDots - Colors</p>
        <div className="flex flex-col gap-3">
          <LoadingDots color="primary" />
          <LoadingDots color="foreground" />
          <LoadingDots color="muted" />
        </div>
      </div>

      {/* LoadingBar - Progress */}
      <div className="space-y-2">
        <p className="text-sm font-medium">LoadingBar - Progress States</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">30% complete</p>
            <LoadingBar progress={30} label="30% complete" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">60% complete</p>
            <LoadingBar progress={60} label="60% complete" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Complete</p>
            <LoadingBar progress={100} label="Complete" />
          </div>
        </div>
      </div>

      {/* LoadingBar - Animated */}
      <div className="space-y-2">
        <p className="text-sm font-medium">LoadingBar - Animated (Indeterminate)</p>
        <LoadingBar animated />
      </div>

      {/* LoadingBar - Interactive */}
      <div className="space-y-2">
        <p className="text-sm font-medium">LoadingBar - Interactive Progress</p>
        <LoadingBar progress={progress} label={`${progress}% complete`} />
        <Button size="sm" variant="outline" onClick={simulateProgress}>
          Simulate Progress
        </Button>
      </div>

      {/* InlineLoading - Spinner Variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">InlineLoading - Spinner Variant (Sizes)</p>
        <div className="space-y-2">
          <InlineLoadingComponent message="Loading data..." variant="spinner" size="sm" />
          <InlineLoadingComponent message="Loading data..." variant="spinner" size="md" />
          <InlineLoadingComponent message="Loading data..." variant="spinner" size="lg" />
        </div>
      </div>

      {/* InlineLoading - Dots Variant */}
      <div className="space-y-2">
        <p className="text-sm font-medium">InlineLoading - Dots Variant</p>
        <InlineLoadingComponent message="Loading data..." variant="dots" />
      </div>

      {/* InlineLoading - Without Message */}
      <div className="space-y-2">
        <p className="text-sm font-medium">InlineLoading - Without Message</p>
        <InlineLoadingComponent variant="spinner" />
      </div>

      {/* InlineLoading from GlobalLoading (Legacy) */}
      <div className="space-y-2">
        <p className="text-sm font-medium">InlineLoading (GlobalLoading Component)</p>
        <InlineLoading isLoading={inlineLoading} text="Loading data..." />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setInlineLoading(true)}>Start</Button>
          <Button size="sm" variant="outline" onClick={() => setInlineLoading(false)}>Stop</Button>
        </div>
      </div>
    </div>
  );

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
