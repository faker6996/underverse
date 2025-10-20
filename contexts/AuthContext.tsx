"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { User } from "@/lib/models/user";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/utils/local-storage";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";

interface AuthContextType {
  user: User | null;
  login: (user: User, token?: string | null) => void;
  logout: () => void;
  loading: boolean;
  showPasswordChange: boolean;
  setShowPasswordChange: (show: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      // Xác định trang có bắt buộc đăng nhập hay không
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const segs = currentPath.split("/").filter(Boolean);
      const afterLocale = `/${segs.slice(1).join('/')}`;
      const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some((p) => afterLocale.startsWith(p) || currentPath.includes(p));
      const protectedPrefixes = ["/dashboard", "/profile", "/orders", "/admin", "/users"]; // giống middleware
      const isProtectedPage = protectedPrefixes.some((p) => afterLocale.startsWith(p));

      // Nạp user từ localStorage nếu có
      const cachedUser = loadFromLocalStorage<User>("user", User);
      // Treat empty constructed User (no id/email) as no user
      const hasValidCachedUser = !!(cachedUser && (cachedUser.id || cachedUser.email));
      const safeCachedUser: User | null = hasValidCachedUser ? cachedUser : null;

      // Trang công khai (không protected, không trang auth)
      if (!isProtectedPage && !isAuthPage) {
        // Nếu có cache hợp lệ → gán tạm để UI hiển thị nhanh, nhưng vẫn xác thực lại phiên ngay sau đó
        if (safeCachedUser) {
          setUser(safeCachedUser);
          try {
            const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
            if (freshUser) {
              setUser(freshUser);
              saveToLocalStorage("user", freshUser);
              if (freshUser.needs_password_change) setShowPasswordChange(true);
            } else {
              // Không nhận được user hợp lệ → xoá cache và reset trạng thái đăng nhập
              try { localStorage.removeItem("user"); } catch {}
              setUser(null);
            }
          } catch {
            // Phiên hết hạn hoặc không hợp lệ → xoá cache và reset trạng thái đăng nhập
            try { localStorage.removeItem("user"); } catch {}
            setUser(null);
          }
          setLoading(false);
          return;
        }

        // Không có cache: thử xác thực phiên một lần (trường hợp vừa SSO xong được set cookie)
        try {
          const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
          if (freshUser) {
            setUser(freshUser);
            saveToLocalStorage("user", freshUser);
            if (freshUser.needs_password_change) setShowPasswordChange(true);
          }
        } catch {
          // Bỏ qua lỗi yên lặng trên trang công khai
        }
        setLoading(false);
        return;
      }

      // Set cached user để UI load nhanh hơn
      if (safeCachedUser) setUser(safeCachedUser);

      // Nếu là trang auth (login/register/forgot/reset) → KHÔNG gọi /auth/me để tránh vòng lặp refresh/redirect
      if (isAuthPage) {
        // Nếu có cachedUser hợp lệ, xác thực lại phiên để tránh redirect sai do localStorage cũ
        if (hasValidCachedUser) {
          try {
            const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
            if (freshUser) {
              setUser(freshUser);
              saveToLocalStorage("user", freshUser);
              const locale = [LOCALE.VI, LOCALE.EN].includes(segs[0] as any) ? segs[0] : LOCALE.VI;
              window.location.replace(`/${locale}`);
              return;
            }
          } catch {
            // Token/phiên không hợp lệ → xoá cache và cho phép ở lại trang login
            try { localStorage.removeItem("user"); } catch {}
          }
        }
        setLoading(false);
        return;
      }

      // Trang protected → cố gắng xác thực phiên
      try {
        const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
        if (freshUser) {
          setUser(freshUser);
          saveToLocalStorage("user", freshUser);
          if (freshUser.needs_password_change) setShowPasswordChange(true);
        }
      } catch (error) {
        // Nếu fail khi ở trang protected → điều hướng login
        if (isProtectedPage) {
          console.error("Session validation failed on protected page.", error);
          try { localStorage.removeItem("user"); } catch {}
          logout();
          const locale = [LOCALE.VI, LOCALE.EN].includes(segs[0] as any) ? segs[0] : LOCALE.VI;
          if (typeof window !== "undefined") {
            window.location.href = `/${locale}/login`;
            return;
          }
        }
      }

      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Re-validate session on route changes for public pages to avoid stale cached user
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentPath = pathname || window.location.pathname || "";
    const segs = currentPath.split("/").filter(Boolean);
    const afterLocale = `/${segs.slice(1).join('/')}`;
    const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some((p) => afterLocale.startsWith(p) || currentPath.includes(p));
    const protectedPrefixes = ["/dashboard", "/profile", "/orders", "/admin", "/users"]; // giống middleware
    const isProtectedPage = protectedPrefixes.some((p) => afterLocale.startsWith(p));

    // Only act on public, non-auth pages
    if (isProtectedPage || isAuthPage) return;

    // If previous API set a session_expired flag, clear cached user immediately
    try {
      if (localStorage.getItem("session_expired")) {
        localStorage.removeItem("session_expired");
        localStorage.removeItem("user");
        if (user) setUser(null);
      }
    } catch {}

    // If UI currently thinks user is logged in, validate silently in background
    if (user) {
      (async () => {
        try {
          const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
          if (freshUser) {
            setUser(freshUser);
            saveToLocalStorage("user", freshUser);
          }
        } catch {
          try { localStorage.removeItem("user"); } catch {}
          setUser(null);
        }
      })();
    }
  }, [pathname]);

  const login = (newUser: User, token?: string | null) => {
    setUser(newUser);
    saveToLocalStorage("user", newUser);
    if (token) {
      saveToLocalStorage("token", token);
    }
    // Show password change modal if needed
    if (newUser.needs_password_change) {
      setShowPasswordChange(true);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {}
    // Token is in cookie, will be cleared by logout API
  };

  const refreshUser = async () => {
    try {
      // Add small delay to ensure DB transaction completes
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Add cache busting parameter to ensure fresh data
      const freshUser = await callApi<User>(`${API_ROUTES.AUTH.ME}?_refresh=${Date.now()}`, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
      if (freshUser) {
        setUser(freshUser);
        saveToLocalStorage("user", freshUser);
        // Update password change modal state
        if (freshUser.needs_password_change) {
          setShowPasswordChange(true);
        } else {
          setShowPasswordChange(false);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, showPasswordChange, setShowPasswordChange, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
