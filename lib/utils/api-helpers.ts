/**
 * API Helper functions
 * Không còn tích hợp loading - component tự quản lý
 */

import { callApi } from "./api-client";
import { API_ROUTES } from "../constants/api-routes";
import { HTTP_METHOD_ENUM } from "../constants/enum";

// Auth APIs
export const authApi = {
  login: (credentials: any) => callApi(API_ROUTES.AUTH.LOGIN, HTTP_METHOD_ENUM.POST, credentials),

  logout: () => callApi(API_ROUTES.AUTH.LOGOUT, HTTP_METHOD_ENUM.POST),

  me: () =>
    callApi(
      API_ROUTES.AUTH.ME,
      HTTP_METHOD_ENUM.GET,
      undefined,
      { silent: true } // Không hiện loading cho API này
    ),
};
