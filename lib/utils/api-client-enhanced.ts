// lib/utils/api-client-enhanced.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger('ApiClientEnhanced');

export interface ApiClientConfig extends AxiosRequestConfig {
  silent?: boolean;
  external?: boolean; // 🆕 Flag để xử lý external APIs
}

/**
 * Enhanced callApi hỗ trợ cả internal và external APIs
 */
export async function callApiEnhanced<T>(
  url: string,
  method: HTTP_METHOD_ENUM,
  data?: any,
  config?: ApiClientConfig
): Promise<T> {

  const api = axios.create({
    baseURL: config?.external ? "" : "", // Khác baseURL cho external
    timeout: config?.timeout || (config?.external ? 30_000 : 120_000),
    headers: { "Content-Type": "application/json" },
    withCredentials: !config?.external, // Chỉ set credentials cho internal APIs
  });

  try {
    const requestConfig: any = {
      url,
      method,
      ...(method === HTTP_METHOD_ENUM.GET ? { params: data } : { data }),
      ...config,
    };

    if (data instanceof FormData) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': undefined,
      };
    }

    const res = await api.request(requestConfig);

    // 🆕 Handle external APIs differently
    if (config?.external) {
      // External API: trả về raw response
      return res.data as T;
    }

    // Internal API: expect {success, message, data} format
    const { success, message, data: payload } = res.data || {};
    const errMsg = (typeof message === 'string' && message.trim()) ? message : 'Request failed';

    const isAuthEndpoint = url.includes("/auth/");
    const shouldShowAlert = !config?.silent && !isAuthEndpoint;

    if (!success) {
      if (shouldShowAlert) {
        alert(errMsg);
      }
      if (!config?.silent) {
        logger.error(`API Error: ${method} ${url}`, new Error(errMsg));
      }
      throw new Error(errMsg);
    }

    return payload as T;

  } catch (err) {
    const axiosErr = err as AxiosError;
    const msg = (axiosErr.response?.data as any)?.message ||
                (axiosErr.response?.data as any)?.error ||
                axiosErr.message ||
                "API Error";

    // 🆕 Skip token refresh for external APIs
    if (axiosErr.response?.status === 401 && !config?.external) {
      // ... existing token refresh logic ...
    }

    if (!config?.silent) {
      logger.error(`API Error: ${method} ${url}`, err);
    }

    throw new Error(msg);
  }
}

// Convenience functions
export const callInternalApi = <T>(
  url: string,
  method: HTTP_METHOD_ENUM,
  data?: any,
  config?: AxiosRequestConfig & { silent?: boolean }
) => callApiEnhanced<T>(url, method, data, { ...config, external: false });

export const callExternalApiEnhanced = <T>(
  url: string,
  method: HTTP_METHOD_ENUM,
  data?: any,
  config?: AxiosRequestConfig & { silent?: boolean }
) => callApiEnhanced<T>(url, method, data, { ...config, external: true });