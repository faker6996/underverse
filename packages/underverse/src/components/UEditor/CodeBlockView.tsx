"use client";

import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Check, Copy, ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const LANGUAGES = [
  { label: "Plain Text", value: "text" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "SQL", value: "sql" },
  { label: "JSON", value: "json" },
  { label: "YAML", value: "yaml" },
  { label: "Shell", value: "bash" },
];

export const CodeBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  extension,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const currentLangValue = node.attrs.language || "text";
  const currentLangLabel =
    LANGUAGES.find((lang) => lang.value === currentLangValue)?.label || "Plain Text";

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code text: ", err);
    }
  };

  return (
    <NodeViewWrapper className="group/code relative my-4 rounded-xl border border-border/60 bg-muted/40 p-4 font-mono text-sm shadow-sm overflow-visible">
      <div
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-opacity duration-200 select-none"
        contentEditable={false}
      >
        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all focus:outline-none"
          >
            {currentLangLabel}
            <ChevronDown className="h-3 w-3" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 max-h-56 w-36 overflow-y-auto rounded-lg border border-border/50 bg-popover p-1 shadow-lg z-30 [scrollbar-width:thin] animate-in fade-in-0 zoom-in-95">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      updateAttributes({ language: lang.value });
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors focus:outline-none",
                      currentLangValue === lang.value
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all focus:outline-none"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success animate-in fade-in-0 zoom-in-75" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <pre className="m-0 overflow-x-auto [scrollbar-width:thin] pt-4 sm:pt-0">
        <code className="bg-transparent! text-foreground!">
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
