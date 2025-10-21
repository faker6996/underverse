"use client";

import React from "react";

export default function CodeBlock({ code }: { code: string }) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  };
  return (
    <div className="relative">
      <pre className="rounded-md bg-muted p-4 text-sm overflow-auto border border-border">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md border border-border bg-card hover:bg-accent/40"
        aria-label="Copy code"
      >
        Copy
      </button>
    </div>
  );
}

