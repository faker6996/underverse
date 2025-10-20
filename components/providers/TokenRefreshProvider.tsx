"use client";

import { createContext, useContext, ReactNode } from "react";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

interface TokenRefreshContextValue {
  refreshToken: () => Promise<boolean>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  isRefreshing: boolean;
}

const TokenRefreshContext = createContext<TokenRefreshContextValue | null>(null);

interface TokenRefreshProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

export function TokenRefreshProvider({
  children,
  refreshInterval = 12 * 60 * 1000, // giữ 12 phút để tương thích (sẽ làm mới sớm)
}: TokenRefreshProviderProps) {
  const tokenRefresh = useTokenRefresh({
    refreshInterval,
    onRefreshSuccess: () => {},
    onRefreshError: (error) => {
      console.error("❌ Token refresh error:", error.message);
    },
  });

  return <TokenRefreshContext.Provider value={tokenRefresh}>{children}</TokenRefreshContext.Provider>;
}

export function useTokenRefreshContext() {
  const context = useContext(TokenRefreshContext);
  if (!context) {
    throw new Error("useTokenRefreshContext must be used within TokenRefreshProvider");
  }
  return context;
}
