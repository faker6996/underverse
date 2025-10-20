"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ShoppingBag, Heart, ChevronDown, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLocale } from "@/hooks/useLocale";
import { toLocalePath } from "@/lib/utils/locale-path";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useUserRole();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await callApi(API_ROUTES.AUTH.LOGOUT, HTTP_METHOD_ENUM.POST);
      logout();
      setIsOpen(false);
      router.push(toLocalePath(locale, "/"));
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "Tài khoản",
      href: "/profile",
      onClick: () => {
        router.push(toLocalePath(locale, "/profile"));
        setIsOpen(false);
      },
    },
  ];

  if (!user) return null;

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      {/* User Avatar/Trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-muted hover:bg-accent ring-1 ring-border rounded-full"
        title={user.name || user.email || "Menu"}
        aria-label="User menu"
      >
        {user.avatar_url ? (
          <Avatar src={user.avatar_url} alt={user.name || "avatar"} size="sm" className="w-6 h-6 rounded-full" />
        ) : (
          <User className="w-5 h-5" />
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
