"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, TriangleAlert } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

type CopyState = "idle" | "copied" | "error";

export default function CodeBlock({ code, language = "text", filename }: CodeBlockProps) {
  const [copyState, setCopyState] = React.useState<CopyState>("idle");
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations("DocsUnderverse.docs");

  React.useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const label = copyState === "copied"
    ? t("copied")
    : copyState === "error"
      ? t("copyFailed")
      : t("copyCode");

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-[#0d1117] text-slate-200 shadow-sm">
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-white/10 px-3.5">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
          {filename ? <span className="truncate font-medium text-slate-300">{filename}</span> : null}
          {filename ? <span aria-hidden="true">·</span> : null}
          <span className="font-mono uppercase tracking-[0.08em]">{language}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label={label}
        >
          {copyState === "copied" ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          ) : copyState === "error" ? (
            <TriangleAlert className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span aria-live="polite">{label}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 [tab-size:2]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
