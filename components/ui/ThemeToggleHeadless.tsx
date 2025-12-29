"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeToggleHeadlessProps {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  labels?: {
    heading?: string;
    light?: string;
    dark?: string;
    system?: string;
  };
  className?: string;
}

export default function ThemeToggleHeadless({
  theme,
  onChange,
  labels,
  className,
}: ThemeToggleHeadlessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const themes = [
    { value: "light" as const, label: labels?.light ?? "Light", icon: Sun },
    { value: "dark" as const, label: labels?.dark ?? "Dark", icon: Moon },
    { value: "system" as const, label: labels?.system ?? "System", icon: Monitor },
  ];

  const current = mounted ? themes.find((t) => t.value === theme) || themes[2] : themes[2];
  const CurrentIcon = current.icon;

  const calculatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
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
        ref={triggerRef}
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
        aria-label={labels?.heading ?? "Theme"}
      >
        <CurrentIcon className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {typeof window !== "undefined" &&
            createPortal(<div className="fixed inset-0 z-9998" onClick={() => setIsOpen(false)} />, document.body)}

          {typeof window !== "undefined" && dropdownPosition &&
            createPortal(
              <div
                className="z-9999 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                style={{ position: "absolute", top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
                onMouseDown={(e) => e.stopPropagation()}
                role="menu"
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">
                    {labels?.heading ?? "Theme"}
                  </div>
                  {themes.map((opt) => {
                    const Icon = opt.icon;
                    const active = theme === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onChange(opt.value);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start gap-3 h-auto py-2 px-3",
                          active && "bg-primary/10 text-primary"
                        )}
                        role="menuitemradio"
                        aria-checked={active}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </Button>
                    );
                  })}
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}

