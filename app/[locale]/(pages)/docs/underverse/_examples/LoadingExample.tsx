"use client";

import React from "react";
import { GlobalLoading, PageLoading, InlineLoading, ButtonLoading } from "@/components/ui/GlobalLoading";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { loading } from "@/lib/utils/loading";

export default function LoadingExample() {
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [inlineLoading, setInlineLoading] = React.useState(false);

  const showGlobal = () => {
    loading.show("Đang xử lý...");
    setTimeout(() => loading.hide(), 1200);
  };

  const code =
    `import { GlobalLoading, InlineLoading, ButtonLoading } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { loading } from '@/lib/utils/loading'\n\n` +
    `const [btnLoading, setBtnLoading] = useState(false)\n` +
    `const [inlineLoading, setInlineLoading] = useState(false)\n\n` +
    `const showGlobal = () => {\n` +
    `  loading.show("Đang xử lý...")\n` +
    `  setTimeout(() => loading.hide(), 1200)\n` +
    `}\n\n` +
    `// Global Loading\n` +
    `<GlobalLoading />\n` +
    `<Button onClick={showGlobal} variant="primary">Show Global Loading</Button>\n\n` +
    `// Button Loading\n` +
    `<ButtonLoading isLoading={btnLoading} loadingText="Đang gửi...">\n` +
    `  <Button onClick={() => { setBtnLoading(true); setTimeout(()=>setBtnLoading(false), 1000); }}>Submit</Button>\n` +
    `</ButtonLoading>\n\n` +
    `// Inline Loading\n` +
    `<InlineLoading isLoading={inlineLoading} text="Đang tải dữ liệu" />\n` +
    `<Button onClick={() => setInlineLoading(true)}>Start</Button>\n` +
    `<Button variant="outline" onClick={() => setInlineLoading(false)}>Stop</Button>`;

  const demo = (
    <div className="space-y-4">
      <GlobalLoading />

      <div className="space-y-2">
        <Button onClick={showGlobal} variant="primary">Show Global Loading</Button>
      </div>

      <div className="space-y-2">
        <ButtonLoading isLoading={btnLoading} loadingText="Đang gửi...">
          <Button onClick={() => { setBtnLoading(true); setTimeout(()=>setBtnLoading(false), 1000); }}>Submit</Button>
        </ButtonLoading>
      </div>

      <div className="space-y-2">
        <InlineLoading isLoading={inlineLoading} text="Đang tải dữ liệu" />
        <div className="flex gap-2">
          <Button onClick={() => setInlineLoading(true)}>Start</Button>
          <Button variant="outline" onClick={() => setInlineLoading(false)}>Stop</Button>
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
