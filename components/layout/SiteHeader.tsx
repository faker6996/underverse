"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useLocale } from "@/hooks/useLocale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Drawer } from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { Menu } from "lucide-react";
import { useResponsive } from "@/lib/utils/responsive";
import { ChevronDown, ChevronRight } from "lucide-react";
import { callApi } from "@/lib/utils/api-client";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

interface SiteHeaderProps {
  className?: string;
}

export default function SiteHeader({ className }: SiteHeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isMobile, isMdUp } = useResponsive();
  // Decide hide on login pages, but do not return early before hooks
  const hideHeader = !!(pathname && /\/(vi|en)\/login(\/?|$)/.test(pathname));

  // Auto-close mobile menu when switching to desktop
  useEffect(() => {
    if (isMdUp && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMdUp, mobileOpen]);

  const [policiesMenu, setPoliciesMenu] = useState<Array<{ title: string; slug: string }>>([]);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await callApi<{ items: Array<{ id: number; title: string; slug: string }> }>(
          `/api/policies?published=true&limit=50&sortBy=title-asc`,
          HTTP_METHOD_ENUM.GET,
          undefined,
          { silent: true }
        );
        if (!mounted) return;
        const items = (res as any)?.items || (res as any)?.data?.items || [];
        setPoliciesMenu(items.map((x: any) => ({ title: x.title, slug: x.slug })));
      } catch {
        // silent
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // No product categories in this project

  const isAdminPath = !!(pathname && new RegExp(`^/${locale}/admin(?:/|$|\\?)`).test(pathname));
  // Hide public header entirely on admin routes to avoid double headers
  if (isAdminPath) return null;

  // Build menu items depending on context
  const navItems: Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }> = isAdminPath
    ? [
        { label: "TRỌNG TÀI", href: `/${locale}/admin?tab=referee` },
        { label: "KỸ THUẬT VIÊN", href: `/${locale}/admin?tab=operator` },
        { label: "SETTINGS", href: `/${locale}/admin/settings` },
      ]
    : [
        // Normal users: only one menu to view live
        { label: "XEM LIVE", href: `/${locale}/operator` },
      ];

  // Desktop nav uses underline style like Tabs (variant: underline)

  const homeHref = `/${locale}`;
  const isActive = (item: { href: string; children?: { href: string }[] }) => {
    if (!pathname) return false;

    // Admin tabs highlight via query param
    if (isAdminPath) {
      const tab = searchParams?.get("tab");
      if (item.href.includes("tab=referee")) {
        return (pathname.startsWith(`/${locale}/admin`) && (!tab || tab === "referee"));
      }
      if (item.href.includes("tab=operator")) {
        return pathname.startsWith(`/${locale}/admin`) && tab === "operator";
      }
      // Settings in admin
      if (item.href === `/${locale}/admin/settings`) {
        return pathname === item.href || pathname.startsWith(item.href + "/");
      }
    }

    // Trang chủ: phải match chính xác (outside admin)
    if (item.href === homeHref) return pathname === item.href;

    // Nếu có children (ví dụ: Chính sách)
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => pathname.startsWith(child.href));
    }

    // Các menu khác
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // No product search in this project

  const toggleSubMenu = (href: string) => {
    setOpenSubMenu(openSubMenu === href ? null : href);
  };

  return (
    hideHeader ? null : (
    <header
      data-site-chrome="header"
      className={cn("w-full sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50", className)}
      role="banner"
    >
      {/* Top row */}
      <div className="container mx-auto px-2 min-h-14 py-2 flex flex-wrap items-center gap-3">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setMobileOpen(true)}
            title="Menu"
            aria-label="Open navigation"
            icon={Menu}
          />
        )}

        {/* Brand */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center shrink-0 leading-none hover:opacity-90 ml-3 md:ml-6 lg:ml-10"
          aria-label="Trang chủ"
        >
          <div className="font-semibold text-lg tracking-tight text-foreground">Hawkeye Studio</div>
        </Link>

        {/* No product search */}
        {/* Actions */}
        <div className="ml-auto order-2 md:order-none flex flex-col items-end gap-1">
          <HeaderActions />
        </div>
      </div>

      {/* Bottom row: Navigation tabs (desktop/tablet) */}
      {isMdUp && (
        <div className="border-t border-border/60">
          <div className="mx-auto">
            <nav className="relative border-b border-border">
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <div key={item.href} className="relative group px-2 md:px-3">
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        // Match Tabs underline variant
                        "relative transition-colors duration-200 pb-3 border-b-2 border-transparent hover:border-border/60 font-medium tracking-wide whitespace-nowrap",
                        isActive(item)
                          ? "text-primary border-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      role="tab"
                      aria-selected={isActive(item)}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} placement="left" title="Menu" size="md">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <div key={item.href} className="flex flex-col">
              <div className="flex items-center justify-between" onClick={item.children ? () => toggleSubMenu(item.href) : () => {}}>
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (!item.children) setMobileOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md font-medium transition-colors",
                    isActive(item) ? "bg-accent/40 text-primary" : "text-foreground hover:bg-accent/40 hover:text-primary"
                  )}
                  aria-current={isActive(item) ? "page" : undefined}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <button className="p-2" aria-label="Toggle submenu">
                    {openSubMenu === item.href ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
              </div>
              {item.children && openSubMenu === item.href && (
                <div className="ml-4 flex flex-col border-l border-border pl-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-sm text-foreground hover:bg-accent/40 hover:text-primary rounded-md transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </Drawer>
    </header>
    )
  );
}
