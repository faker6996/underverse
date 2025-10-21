"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/hooks/useLocale";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Common");
  const currentLocale = useLocale();
  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    // Replace the locale in the current path
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    router.push(newPath);
    setIsOpen(false);
  };

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

  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
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
      >
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop via portal to escape header stacking/transform */}
          {typeof window !== "undefined" && createPortal(<div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />, document.body)}

          {/* Dropdown via portal with absolute positioning */}
          {typeof window !== "undefined" &&
            dropdownPosition &&
            createPortal(
              <div
                className="z-[9999] bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                style={{ position: "absolute", top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">{t("language")}</div>

                  {languages.map((language) => (
                    <Button
                      key={language.code}
                      variant="ghost"
                      size="sm"
                      onClick={() => switchLanguage(language.code)}
                      className={cn("w-full justify-start gap-3 h-auto py-2 px-3", currentLocale === language.code && "bg-primary/10 text-primary")}
                    >
                      <span className="text-lg">{language.flag}</span>
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
