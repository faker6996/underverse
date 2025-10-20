// lib/utils/external-api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger('ExternalApiClient');

/**
 * Client cho External APIs không tuân theo format {success, message, data}
 * Trả về raw response từ external services
 */
export async function callExternalApi<T>(
  url: string,
  method: HTTP_METHOD_ENUM,
  data?: any,
  config?: AxiosRequestConfig & { silent?: boolean }
): Promise<T> {

  try {
    const requestConfig: any = {
      url,
      method,
      ...(method === HTTP_METHOD_ENUM.GET ? { params: data } : { data }),
      ...config,
      // Không set withCredentials: true cho external APIs
      withCredentials: false,
    };

    // Handle FormData uploads
    if (data instanceof FormData) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': undefined,
      };
    }

    const api = axios.create({
      timeout: config?.timeout || 30_000,
      headers: { "Content-Type": "application/json" },
    });

    const res = await api.request(requestConfig);

    // Trả về raw data từ external API
    return res.data as T;

  } catch (err) {
    const axiosErr = err as AxiosError;
    const msg = (axiosErr.response?.data as any)?.message ||
                (axiosErr.response?.data as any)?.error ||
                axiosErr.message ||
                "External API Error";

    if (!config?.silent) {
      logger.error(`External API Error: ${method} ${url}`, {
        error: err,
        response: axiosErr.response?.data,
        status: axiosErr.response?.status
      });
    }

    throw new Error(msg);
  }
}

/**
 * Helper để wrap external API response thành format chuẩn
 */
export function wrapExternalResponse<T>(
  data: T,
  message: string = "OK"
): { success: true; message: string; data: T } {
  return {
    success: true,
    message,
    data
  };
}

/**
 * Helper để tạo error response cho external API
 */
export function createExternalError(
  message: string,
  data: any = null
): { success: false; message: string; data: any } {
  return {
    success: false,
    message,
    data
  };
}