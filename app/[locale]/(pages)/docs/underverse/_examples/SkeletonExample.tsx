"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import CodeBlock from "../_components/CodeBlock";

export default function SkeletonExample() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
      <CodeBlock
        code={`import { Skeleton } from '@underverse-ui/underverse'\n\n<Skeleton variant='circular' className='w-10 h-10'/>\n<Skeleton variant='text' lines={2} />`}
      />
    </div>
  );
}

