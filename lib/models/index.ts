// E-commerce Web Models - All models for flower shop platform

// Core User & Auth models
export { User } from "./user";
export { UserRole } from "./user_role";

// Utility models
export { RefreshToken } from "./refresh_token";
export { SystemLog } from "./system_log";
export { Notification } from "./notification";
export { ResetPasswordToken as PasswordResetToken } from "./password_reset_token";
export { Camera } from "./camera";
export { Map2D } from "./map_2d";

// E-commerce models

// Type definitions for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
