"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative group">
      <pre className="rounded-md bg-muted p-4 text-sm overflow-auto border border-border">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className={`absolute top-2 right-2 flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md border transition-all duration-200 ${
          copied ? "bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400" : "border-border bg-card hover:bg-accent/40"
        }`}
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
