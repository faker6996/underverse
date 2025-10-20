// lib/utils/api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger('ApiClient');

const api = axios.create({
  baseURL: "", // process.env.NEXT_PUBLIC_API_URL (nếu có)
  timeout: 120_000, // Increase to 2 minutes for video processing
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    // Token is automatically sent via cookie (withCredentials: true)
    // No need to add Authorization header manually
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Gửi request và **chỉ** trả `payload` (data) khi backend trả `success: true`.
 * Nếu backend trả `success: false` (lỗi nghiệp vụ) **hoặc** gặp lỗi hệ thống (network/5xx):
 *   • Hiển thị `window.alert` (trừ auth endpoints)
 *   • Ném lỗi để caller tự `try/catch` khi cần
 */
export async function callApi<T>(
  url: string,
  method: HTTP_METHOD_ENUM,
  data?: any,
  config?: AxiosRequestConfig & { silent?: boolean }
): Promise<T> {
  

  try {
    // Auto-extend timeout for long-running export endpoints
    const isLongExport = url.includes('/api/video-tasks/') && url.includes('/export/vi');
    const reqTimeout = (config?.timeout ?? (isLongExport ? 15 * 60_000 : undefined));
    
    // Handle FormData uploads
    const requestConfig: any = {
      url,
      method,
      ...(method === HTTP_METHOD_ENUM.GET ? { params: data } : { data }),
      ...config,
      ...(reqTimeout ? { timeout: reqTimeout } : {}),
    };
    
    // For FormData, remove Content-Type to let browser set multipart/form-data boundary
    if (data instanceof FormData) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': undefined, // Let browser set multipart/form-data with boundary
      };
    }
    
    const res = await api.request(requestConfig);

    // Backend chuẩn hóa { success, message, data }
    const { success, message, data: payload } = res.data || {};
    const errMsg = (typeof message === 'string' && message.trim()) ? message : 'Request failed';

    // Skip alerts for silent requests OR auth endpoints (login, register, etc.)
    const isAuthEndpoint = url.includes("/auth/");
    const shouldShowAlert = !config?.silent && !isAuthEndpoint;

    if (!success) {
      if (shouldShowAlert) {
        alert(errMsg);
      }
      // For silent requests, don't log errors
      if (!config?.silent) {
        logger.error(`API Error: ${method} ${url}`, new Error(errMsg));
      }
      throw new Error(errMsg); // Always throw error for failed API calls
    }

    return payload as T;

    /* ---------- LỖI NGHIỆP VỤ (HTTP 200, success=false) ---------- */
  } catch (err) {
    /* ---------- LỖI HỆ THỐNG (network, 5xx, timeout, JSON sai) ---------- */
    const axiosErr = err as AxiosError;
    const msg = (axiosErr.response?.data as any)?.message || axiosErr.message || "Internal Server Error";

    // Handle 401 Unauthorized - Token expired or invalid
    if (axiosErr.response?.status === 401) {
      // For auth endpoints (login, register, etc.), don't try to refresh token
      // Only refresh token for protected endpoints when user is already logged in
      const isAuthEndpoint = url.includes("/auth/");
      const isMeEndpoint = url.includes("/api/auth/me");
      const alreadyRetried = false; // Always allow one retry for now

      // Skip refresh for auth endpoints or if already retried
      if ((isAuthEndpoint && !isMeEndpoint) || alreadyRetried) {
        // For auth endpoints, just throw the error without redirect
        if (isAuthEndpoint) {
          throw new Error(msg);
        }
        // For other endpoints that already retried, redirect to login
        // ...existing redirect logic...
      }

      // Try refresh for protected endpoints and also for /auth/me
      if (!alreadyRetried && (!isAuthEndpoint || isMeEndpoint)) {
        try {
          // Try silent refresh using raw axios to avoid recursion
          const refreshRes = await api.post(API_ROUTES.AUTH.REFRESH, undefined, { withCredentials: true });
          const { success } = refreshRes.data || {};
          if (success) {
            // Retry original request once
            const { silent, ...cleanConfig } = config || {};
            const retryRes = await api.request({
              url,
              method,
              ...(method === HTTP_METHOD_ENUM.GET ? { params: data } : { data }),
              ...cleanConfig,
              withCredentials: true,
              headers: { ...(config?.headers || {}), "Content-Type": config?.headers?.["Content-Type"] || "application/json" },
            });
            const { success: ok, data: payload, message } = retryRes.data || {};
            if (!ok) throw new Error(message || "Request failed");
            return payload as T;
          }
        } catch (refreshErr) {
          // fallthrough to redirect
        }
      }

      // Do NOT redirect automatically. Clear cached user and surface error.
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("user");
          localStorage.setItem("session_expired", "1");
        } catch {}
      }
      throw new Error("Unauthorized: session expired or invalid");
    }

    // For silent requests, don't log system errors either
    if (!config?.silent) {
      logger.error(`API Error: ${method} ${url}`, {
        error: err,
        response: axiosErr.response?.data,
        status: axiosErr.response?.status
      });
    }

    throw new Error(msg);
  }
}
