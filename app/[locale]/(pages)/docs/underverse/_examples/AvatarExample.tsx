"use client";

import React from "react";
import Avatar from "@/components/ui/Avatar";
import CodeBlock from "../_components/CodeBlock";

export default function AvatarExample() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Avatar size="sm" fallback="AB" />
        <Avatar size="md" fallback="UV" />
        <Avatar size="lg" fallback="VU" />
        <Avatar size="md" src="https://picsum.photos/seed/uv/80" alt="Demo" />
      </div>
      <CodeBlock
        code={`import { Avatar } from '@underverse-ui/underverse'\n\n<Avatar size='sm' fallback='AB'/>\n<Avatar size='md' fallback='UV'/>\n<Avatar size='lg' fallback='VU'/>\n<Avatar size='md' src='https://picsum.photos/seed/uv/80' alt='Demo'/>`}
      />
    </div>
  );
}

