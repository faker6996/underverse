"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/hooks/useLocale";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/UserMenu";
import Image from "next/image";

interface AdminHeaderProps {
  className?: string;
}

export default function AdminHeader({ className }: AdminHeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();

  const items = [
    { label: "Trọng tài", href: `/${locale}/admin/referee`, key: "referee" },
    { label: "Kỹ thuật viên", href: `/${locale}/admin/operator`, key: "operator" },
    { label: "Cài đặt", href: `/${locale}/admin/settings`, key: "settings" },
  ];

  const activeKey = (() => {
    if (!pathname) return "referee";
    if (pathname.startsWith(`/${locale}/admin/settings`)) return "settings";
    if (pathname.startsWith(`/${locale}/admin/operator`)) return "operator";
    return "referee"; // includes /admin/referee and /admin
  })();

  return (
    <div className={cn("h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <div className="flex items-center gap-6 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Image src={"/images/logo/logo.jpg"} alt="JOJO FLOWERS" width={40} height={40} />
          <div className="font-semibold text-lg tracking-tight text-foreground">Hawkeye Studio</div>
        </div>

        {/* Horizontal menu */}
        <nav className="hidden md:flex items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-semibold transition-colors",
                activeKey === item.key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
              )}
              aria-current={activeKey === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Profile avatar on right */}
      <div className="flex items-center gap-3">
        <UserMenu />
      </div>
    </div>
  );
}
