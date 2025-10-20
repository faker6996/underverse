"use client";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ROLE, AppRole } from "@/lib/constants/enum";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { useLocale } from "@/hooks/useLocale";
import { useUserRole } from "@/hooks/useUserRole";
import { callApi } from "@/lib/utils/api-client";
import { cn } from "@/lib/utils/cn";
import { loading } from "@/lib/utils/loading";
import {
  ChevronLeft,
  CreditCard,
  Crown,
  Eye,
  FileText,
  Home,
  LogOut,
  PlayCircle,
  Settings,
  User as UserIcon,
  Wallet,
  ClipboardList,
  Bell,
  Download,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: MenuItem[];
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  // Auto-collapse on mobile screens only on initial load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // lg breakpoint
        setIsExpanded(false);
        // Notify layout of width change
        window.dispatchEvent(
          new CustomEvent("sidebarToggle", {
            detail: { isExpanded: false },
          })
        );
      }
    };

    // Set initial state only
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Remove isExpanded dependency to prevent loop
  const { user, logout } = useAuth();
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const { addToast } = useToast();
  const { role, isAdmin, isSuperAdmin } = useUserRole();

  const canSeeUsers = isAdmin;
  const canSeeLogs = isSuperAdmin;
  const canNotify = isAdmin;
  const canSeePricing = isSuperAdmin;

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: t("home"),
      icon: Home,
      path: `/${locale}/dashboard`,
    },
    {
      id: "tasks",
      label: t("tasks"),
      icon: ClipboardList,
      path: `/${locale}/tasks`,
    },
    {
      id: "downloader",
      label: (t as any)("downloader") || "Downloader",
      icon: Download,
      path: `/${locale}/downloader`,
    },
    {
      id: "plans",
      label: (t as any)("plans") || "Plans",
      icon: Crown, // Thay đổi từ FolderOpen thành Crown
      path: `/${locale}/plans`,
    },
    {
      id: "subscription",
      label: (t as any)("subscription") || "Subscription",
      icon: CreditCard, // Thay đổi từ FolderOpen thành CreditCard
      path: `/${locale}/subscription`,
    },
    {
      id: "billing",
      label: (t as any)("billing") || "Billing",
      icon: Wallet,
      path: `/${locale}/billing`,
    },
    ...(canSeeUsers ? [{ id: "users", label: (t as any)("users") || "Users", icon: UserIcon, path: `/${locale}/users` } as MenuItem] : []),
    ...(canNotify
      ? [
          {
            id: "admin-notify",
            label: (t as any)("notifications") || "Notifications",
            icon: Bell,
            path: `/${locale}/admin/notifications`,
          } as MenuItem,
        ]
      : []),
    ...(canSeePricing
      ? [{ id: "admin-pricing", label: (t as any)("pricing") || "Pricing", icon: Settings, path: `/${locale}/admin/pricing` } as MenuItem]
      : []),
    ...(canSeeLogs ? [{ id: "logs", label: (t as any)("logs") || "Logs", icon: ClipboardList, path: `/${locale}/logs` } as MenuItem] : []),
  ];

  const handleLogout = async () => {
    loading.show();
    try {
      await callApi(API_ROUTES.AUTH.LOGOUT, HTTP_METHOD_ENUM.POST);
      logout();

      addToast({
        type: "success",
        message: t("logout") + " thành công",
      });

      // Force full navigation so the page unmounts immediately.
      // Keep global loading overlay visible until the new page loads.
      if (typeof window !== "undefined") {
        window.location.replace(`/${locale}/login`);
      } else {
        router.push(`/${locale}/login`);
      }
    } catch (error) {
      addToast({
        type: "error",
        message: "Đăng xuất thất bại. Vui lòng thử lại.",
      });
      // Only hide loading if logout failed and we stay on this page
      loading.hide();
    }
    // Intentionally keep loading overlay until redirect completes
  };

  const userMenuItems = [
    {
      label: t("profile"),
      icon: UserIcon,
      onClick: () => router.push(`/${locale}/profile`),
    },
    {
      label: t("settings"),
      icon: Settings,
      onClick: () => {
        addToast({
          type: "info",
          message: "Trang cài đặt sẽ sớm ra mắt!",
        });
      },
    },
    {
      label: t("logout"),
      icon: LogOut,
      onClick: handleLogout,
      className: "text-destructive hover:text-destructive",
    },
  ];

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Dispatch custom event to notify layout of width change
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", {
        detail: { isExpanded: newExpandedState },
      })
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r border-border/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300 ease-in-out flex flex-col",
        isExpanded ? "w-64" : "w-20",
        className
      )}
      role="navigation"
      aria-label="Primary"
    >
      {/* Header */}
      <div className="h-16 px-4 border-b border-border/60 flex items-center flex-shrink-0">
        <div className={cn("flex items-center w-full", isExpanded ? "justify-between" : "justify-end")}>
          {isExpanded && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t("videoEditor")}</h2>
            </div>
          )}
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 transition-transform" />
            </Button>
          )}
          {!isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <ChevronLeft className="w-4 h-4 transition-transform rotate-180" />
            </Button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Primary menu">
        {menuItems.map((item) => {
          // More precise active logic
          let isActive = false;

          if (item.id === "dashboard") {
            // Dashboard is active only if exactly on dashboard page
            isActive = pathname === `/${locale}/dashboard`;
          } else if (item.id === "tasks") {
            isActive = pathname.includes(`/${locale}/tasks`);
          } else if (item.id === "downloader") {
            isActive = pathname.includes(`/${locale}/downloader`);
          } else if (item.id === "plans") {
            isActive = pathname.includes(`/${locale}/plans`);
          } else if (item.id === "subscription") {
            isActive = pathname.includes(`/${locale}/subscription`);
          } else if (item.id === "billing") {
            isActive = pathname.includes(`/${locale}/billing`);
          } else if (item.id === "users") {
            isActive = pathname.includes(`/${locale}/users`);
          } else if (item.id === "admin-pricing") {
            isActive = pathname.includes(`/${locale}/admin/pricing`);
          } else if (item.id === "logs") {
            isActive = pathname.includes(`/${locale}/logs`);
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                // Các class chung
                "flex items-center transition-colors group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

                // Style cho trạng thái Active (Màu sắc)
                isActive ? "bg-accent/60 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",

                // Style hình dạng và kích thước dựa trên trạng thái expanded/collapsed
                isExpanded ? "gap-3 px-3 py-3 rounded-lg" : "w-10 h-10 rounded-lg justify-center mx-auto"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              {isExpanded ? (
                <span className="font-medium truncate">{item.label}</span>
              ) : (
                <Tooltip content={item.label} placement="right">
                  <span className="sr-only">{item.label}</span>
                </Tooltip>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section - Sticky Bottom */}
      <div className="p-4 border-t border-border flex-shrink-0 relative">
        {user ? (
          <div className="relative z-60">
            <DropdownMenu
              trigger={
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer w-full",
                    !isExpanded && "justify-center"
                  )}
                >
                  <Avatar src={user.avatar_url} size="sm" className="w-8 h-8" />
                  {isExpanded && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  )}
                </div>
              }
              items={userMenuItems}
              placement={isExpanded ? "top-start" : "top"}
              contentClassName="z-60"
            />
          </div>
        ) : (
          <div className={cn("flex items-center gap-3 p-3 rounded-lg animate-pulse", !isExpanded && "justify-center")}>
            <div className="w-8 h-8 bg-muted rounded-full" />
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted/60 rounded w-2/3" />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
