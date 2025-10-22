"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";

export interface LanguageOption {
  code: string;
  name: string;
  flag?: string;
}

export interface LanguageSwitcherHeadlessProps {
  locales: LanguageOption[];
  currentLocale: string;
  onSwitch: (code: string) => void;
  labels?: { heading?: string };
  className?: string;
}

export default function LanguageSwitcherHeadless({
  locales,
  currentLocale,
  onSwitch,
  labels,
  className,
}: LanguageSwitcherHeadlessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const currentLanguage = locales.find((l) => l.code === currentLocale) || locales[0];

  const calculatePosition = () => {
    const rect = triggerButtonRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const width = 192; // w-48
    const left = rect.right + scrollLeft - width;
    const top = rect.bottom + scrollTop + 8;
    return { top, left, width };
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        ref={triggerButtonRef}
        onClick={() => {
          const next = !isOpen;
          if (next) {
            const pos = calculatePosition();
            if (pos) setDropdownPosition(pos);
          }
          setIsOpen(next);
        }}
        className="bg-muted hover:bg-accent"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={labels?.heading ?? "Language"}
        title={labels?.heading ?? "Language"}
      >
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {typeof window !== "undefined" && createPortal(<div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />, document.body)}
          {typeof window !== "undefined" && dropdownPosition &&
            createPortal(
              <div
                className="z-[9999] bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                style={{ position: "absolute", top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
                onMouseDown={(e) => e.stopPropagation()}
                role="menu"
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">
                    {labels?.heading ?? "Language"}
                  </div>

                  {locales.map((language) => (
                    <Button
                      key={language.code}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSwitch(language.code);
                        setIsOpen(false);
                      }}
                      className={cn("w-full justify-start gap-3 h-auto py-2 px-3", currentLocale === language.code && "bg-primary/10 text-primary")}
                      role="menuitemradio"
                      aria-checked={currentLocale === language.code}
                    >
                      {language.flag && <span className="text-lg">{language.flag}</span>}
                      <span className="flex-1 text-left">{language.name}</span>
                      {currentLocale === language.code && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </Button>
                  ))}
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}

