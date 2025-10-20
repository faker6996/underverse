'use client';

import { useEffect, useRef, useCallback } from 'react';
import { callApi } from '@/lib/utils/api-client';
import { HTTP_METHOD_ENUM } from '@/lib/constants/enum';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('TokenRefresh');

interface UseTokenRefreshOptions {
  refreshInterval?: number; // in milliseconds, default 12 minutes (safe & frequent)
  onRefreshSuccess?: () => void;
  onRefreshError?: (error: Error) => void;
}

export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    refreshInterval = 12 * 60 * 1000, // 12 minutes (backward-compatible)
    onRefreshSuccess,
    onRefreshError
  } = options;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Determine if user is logged in (client-side heuristic)
  const isLoggedIn = () => {
    try {
      if (typeof window === 'undefined') return false;
      const cached = localStorage.getItem('user');
      if (cached) return true;
      // Fallback to non-httpOnly role cookie set on login
      const cookie = typeof document !== 'undefined' ? document.cookie || '' : '';
      return /(?:^|; )role=/.test(cookie);
    } catch {
      return false;
    }
  };

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      return false;
    }

    // Skip refresh when not logged in (no user/cookie role)
    if (!isLoggedIn()) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      await callApi<{ accessToken: string }>(API_ROUTES.AUTH.REFRESH, HTTP_METHOD_ENUM.POST, undefined, { silent: true });
      onRefreshSuccess?.();
      return true;
    } catch (error) {
      logger.error('Token refresh failed', error);
      onRefreshError?.(error as Error);

      // Only redirect on protected pages; here, we conservatively avoid forcing redirect
      // Middleware/AuthContext handle protected page redirection.
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefreshError, onRefreshSuccess]);

  const startAutoRefresh = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up auto-refresh interval
    intervalRef.current = setInterval(() => {
      if (isLoggedIn()) {
        refreshToken();
      }
    }, refreshInterval);
  }, [refreshToken, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    return refreshToken();
  }, [refreshToken]);

  // Start auto-refresh on mount
  useEffect(() => {
    startAutoRefresh();

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  // Listen for visibility change to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn()) {
        refreshToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshToken]);

  return {
    refreshToken: manualRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    isRefreshing: isRefreshingRef.current
  };
}
