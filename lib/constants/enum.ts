// lib/constants/http-method.ts
export enum HTTP_METHOD_ENUM {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum Z_INDEX_LEVEL {
  BASE = 100, // base layout, header, fixed nav
  DROPDOWN = 1000, // dropdown, popover, select
  TOOLTIP = 2000, // tooltip
  DIALOG = 10000, // modal, popup
  LOADING = 100000, // global loading, overlay
}

export enum LOCALE {
  VI = "vi",
  EN = "en",
  KO = "ko",
  JA = "ja",
}

export enum MESSAGE_TYPE {
  PUBLIC = 0,
  PRIVATE = 1,
  GROUP = 2,
}

export enum APP_ROLE {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}

// Type alias for backward compatibility
export type AppRole = `${APP_ROLE}`;

/**
 * Log levels enum
 * Ordered from lowest to highest severity
 */
export enum LOG_LEVEL {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}
