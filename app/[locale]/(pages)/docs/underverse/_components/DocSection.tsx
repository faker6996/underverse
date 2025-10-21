"use client";

import React, { useState } from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id={id}
      className="scroll-mt-20 space-y-4 pb-8 border-b border-border/40 last:border-0"
    >
      <div className="group flex items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          <a
            href={`#${id}`}
            className="hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.pushState(null, '', `#${id}`);
            }}
          >
            {title}
          </a>
        </h2>
        <button
          onClick={handleCopyLink}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md",
            "hover:bg-accent hover:text-accent-foreground",
            copied && "opacity-100 bg-primary/10 text-primary"
          )}
          title="Copy link to section"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

