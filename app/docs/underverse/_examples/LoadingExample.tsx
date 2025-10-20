"use client";

import React from "react";
import { GlobalLoading, PageLoading, InlineLoading, ButtonLoading } from "@/components/ui/GlobalLoading";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { loading } from "@/lib/utils/loading";

export default function LoadingExample() {
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [inlineLoading, setInlineLoading] = React.useState(false);

  const showGlobal = () => {
    loading.show("Đang xử lý...");
    setTimeout(() => loading.hide(), 1200);
  };

  return (
    <div className="space-y-4">
      <GlobalLoading />

      <div className="space-y-2">
        <Button onClick={showGlobal} variant="primary">Show Global Loading</Button>
        <CodeBlock code={`import { GlobalLoading } from '@underverse-ui/underverse'\nimport { loading } from '@/lib/utils/loading'\n\n<GlobalLoading/>\nloading.show('Đang xử lý...'); loading.hide();`} />
      </div>

      <div className="space-y-2">
        <ButtonLoading isLoading={btnLoading} loadingText="Đang gửi...">
          <Button onClick={() => { setBtnLoading(true); setTimeout(()=>setBtnLoading(false), 1000); }}>Submit</Button>
        </ButtonLoading>
        <CodeBlock code={`import { ButtonLoading } from '@underverse-ui/underverse'`} />
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
}
