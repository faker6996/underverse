"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import Button from "@/components/ui/Button";
import { User, UserPlus, LayoutDashboard } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "@/hooks/useLocale";
import { toLocalePath } from "@/lib/utils/locale-path";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./UserMenu";
import { useUserRole } from "@/hooks/useUserRole";

interface HeaderActionsProps {
  className?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
}

export function HeaderActions({ className }: HeaderActionsProps) {
  const t = useTranslations("Common");
  const router = useRouter();
  const locale = useLocale();
  const { user, loading } = useAuth();
  const { isAdmin } = useUserRole();

  // Debug logging (remove in production)
  // React.useEffect(() => {
  //   console.log("HeaderActions - Auth state:", { user: !!user, loading, userInfo: user?.email });
  // }, [user, loading]);

  const handleLoginClick = () => {
    // When user proactively clicks login, suppress any stale session-expired toast
    try {
      localStorage.removeItem("session_expired");
    } catch {}
    router.push(toLocalePath(locale, "/login"));
  };

  return (
    
    <div className={cn("flex items-center gap-3", className)} role="toolbar" aria-label="Header toolbar">
      {/* Authentication Actions */}
      {loading ? (
        // Loading: Show skeleton
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
          <div className="w-16 h-8 bg-muted animate-pulse rounded"></div>
        </div>
      ) : user ? (
        // Logged in: Show user dropdown menu
        <UserMenu />
      ) : (
        // Not logged in: Show login and sign up buttons
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLoginClick}
            className="bg-muted hover:bg-accent ring-1 ring-border rounded-full"
            aria-label="Đăng nhập"
            title="Đăng nhập"
          >
            <User className="w-5 h-5" />
          </Button> 
        </>
      )}
    </div>
  );
}
