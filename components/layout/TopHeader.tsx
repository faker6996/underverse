"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeaderActions } from "@/components/layout/HeaderActions";

interface TopHeaderProps {
  className?: string;
}

export function TopHeader({ className }: TopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const t = useTranslations("Common");

  // Listen for sidebar width changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarWidth(event.detail.isExpanded ? 256 : 80);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    };
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-16 px-6 flex items-center justify-between",
        "border-b border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50",
        "transition-all duration-300 ease-in-out",
        className
      )}
      style={{ left: `${sidebarWidth}px` }}
      role="banner"
    >
      {/* Left side - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg" role="search">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("search") || "Tìm kiếm..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(e as any);
              }
            }}
            className="pl-10 pr-4 bg-muted/30 border-border focus:bg-background"
          />
        </div>
      </div>

      {/* Right side - Actions & Profile */}
      <nav aria-label="Header actions">
        <HeaderActions />
      </nav>
    </header>
  );
}

export default TopHeader;
