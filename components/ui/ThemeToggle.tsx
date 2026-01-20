"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/lib/i18n/translation-adapter";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Common");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  // Avoid hydration mismatch by only showing theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      value: "light" as const,
      label: t("lightTheme"),
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: t("darkTheme"),
      icon: Moon,
    },
    {
      value: "system" as const,
      label: t("systemTheme"),
      icon: Monitor,
    },
  ];

  // Always show Monitor icon during SSR/before mount to avoid hydration mismatch
  const currentTheme = mounted ? themes.find((t) => t.value === theme) || themes[2] : themes[2];
  const CurrentIcon = currentTheme.icon;

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
    <div className="relative">
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
      >
        <CurrentIcon className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop via portal to escape header stacking/transform */}
          {typeof window !== "undefined" && createPortal(<div className="fixed inset-0 z-9998" onClick={() => setIsOpen(false)} />, document.body)}

          {/* Dropdown via portal with absolute positioning */}
          {typeof window !== "undefined" &&
            dropdownPosition &&
            createPortal(
              <div
                className="z-9999 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                style={{ position: "absolute", top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">{t("theme")}</div>

                  {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                      <Button
                        key={themeOption.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTheme(themeOption.value);
                          setIsOpen(false);
                        }}
                        className={cn("w-full justify-start gap-3 h-auto py-2 px-3", theme === themeOption.value && "bg-primary/10 text-primary")}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{themeOption.label}</span>
                        {theme === themeOption.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </Button>
                    );
                  })}
                </div>
              </div>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
