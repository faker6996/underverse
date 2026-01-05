/**
 * Date formatting utilities with locale support
 * Provides consistent date/time formatting across the application
 *
 * @example
 * ```tsx
 * import { DateUtils } from "@underverse-ui/underverse";
 *
 * // Format date with default locale (en)
 * DateUtils.formatDate(new Date()); // "December 25, 2024"
 *
 * // Format date with Vietnamese locale
 * DateUtils.formatDate(new Date(), "vi"); // "25 tháng 12, 2024"
 * ```
 */

export type SupportedLocale = "en" | "vi" | "ko" | "ja";

const localeMap: Record<SupportedLocale, string> = {
  en: "en-US",
  vi: "vi-VN",
  ko: "ko-KR",
  ja: "ja-JP",
};

/**
 * Get the browser locale string for a supported locale
 */
function getLocaleString(locale: SupportedLocale = "en"): string {
  return localeMap[locale] || localeMap.en;
}

/**
 * Format date to readable format
 * @example
 * formatDate(new Date(), "vi") // "25 tháng 12, 2024"
 * formatDate(new Date(), "en") // "December 25, 2024"
 */
export function formatDate(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString(getLocaleString(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format date to short format
 * @example
 * formatDateShort(new Date(), "vi") // "25/12/2024"
 * formatDateShort(new Date(), "en") // "12/25/2024"
 */
export function formatDateShort(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString(getLocaleString(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format time only
 * @example formatTime(new Date()) // "14:30"
 */
export function formatTime(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString(getLocaleString(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date and time
 * @example
 * formatDateTime(new Date(), "vi") // "25/12/2024 14:30"
 */
export function formatDateTime(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleString(getLocaleString(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (time ago)
 * @example
 * formatTimeAgo(new Date(Date.now() - 60000), "vi") // "1 phút trước"
 * formatTimeAgo(new Date(Date.now() - 60000), "en") // "1 minute ago"
 */
export function formatTimeAgo(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const labels = {
    en: {
      justNow: "Just now",
      minute: (n: number) => `${n} minute${n > 1 ? "s" : ""} ago`,
      hour: (n: number) => `${n} hour${n > 1 ? "s" : ""} ago`,
      day: (n: number) => `${n} day${n > 1 ? "s" : ""} ago`,
      week: (n: number) => `${n} week${n > 1 ? "s" : ""} ago`,
      month: (n: number) => `${n} month${n > 1 ? "s" : ""} ago`,
      year: (n: number) => `${n} year${n > 1 ? "s" : ""} ago`,
    },
    vi: {
      justNow: "Vừa xong",
      minute: (n: number) => `${n} phút trước`,
      hour: (n: number) => `${n} giờ trước`,
      day: (n: number) => `${n} ngày trước`,
      week: (n: number) => `${n} tuần trước`,
      month: (n: number) => `${n} tháng trước`,
      year: (n: number) => `${n} năm trước`,
    },
    ko: {
      justNow: "방금 전",
      minute: (n: number) => `${n}분 전`,
      hour: (n: number) => `${n}시간 전`,
      day: (n: number) => `${n}일 전`,
      week: (n: number) => `${n}주 전`,
      month: (n: number) => `${n}개월 전`,
      year: (n: number) => `${n}년 전`,
    },
    ja: {
      justNow: "たった今",
      minute: (n: number) => `${n}分前`,
      hour: (n: number) => `${n}時間前`,
      day: (n: number) => `${n}日前`,
      week: (n: number) => `${n}週間前`,
      month: (n: number) => `${n}ヶ月前`,
      year: (n: number) => `${n}年前`,
    },
  };

  const l = labels[locale] || labels.en;

  if (diffSec < 60) return l.justNow;
  if (diffMin < 60) return l.minute(diffMin);
  if (diffHour < 24) return l.hour(diffHour);
  if (diffDay < 7) return l.day(diffDay);
  if (diffWeek < 4) return l.week(diffWeek);
  if (diffMonth < 12) return l.month(diffMonth);
  return l.year(diffYear);
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
}

/**
 * Format date for input[type="date"]
 * @example formatDateForInput(new Date()) // "2024-12-25"
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format date for input[type="datetime-local"]
 * @example formatDateTimeForInput(new Date()) // "2024-12-25T14:30"
 */
export function formatDateTimeForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dateStr = formatDateForInput(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${dateStr}T${hours}:${minutes}`;
}

/**
 * Get day of week
 * @example
 * getDayOfWeek(new Date(), "vi") // "Thứ Hai"
 * getDayOfWeek(new Date(), "en") // "Monday"
 */
export function getDayOfWeek(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString(getLocaleString(locale), {
    weekday: "long",
  });
}

/**
 * Format with day of week
 * @example
 * formatDateWithDay(new Date(), "vi") // "Thứ Hai, 25/12/2024"
 * formatDateWithDay(new Date(), "en") // "Monday, 12/25/2024"
 */
export function formatDateWithDay(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const dayOfWeek = getDayOfWeek(date, locale);
  const dateStr = formatDateShort(date, locale);

  return `${dayOfWeek}, ${dateStr}`;
}

/**
 * Smart date formatting - shows relative time for recent dates, full date for older ones
 * @example
 * formatDateSmart(new Date(), "vi")
 * // "Vừa xong" (< 1 min)
 * // "5 phút trước" (< 1 hour)
 * // "Hôm nay lúc 14:30" (today)
 * // "Hôm qua lúc 14:30" (yesterday)
 * // "25/12/2024 14:30" (older)
 */
export function formatDateSmart(date: string | Date | null | undefined, locale: SupportedLocale = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));

  const labels = {
    en: {
      today: "Today at",
      yesterday: "Yesterday at",
    },
    vi: {
      today: "Hôm nay lúc",
      yesterday: "Hôm qua lúc",
    },
    ko: {
      today: "오늘",
      yesterday: "어제",
    },
    ja: {
      today: "今日",
      yesterday: "昨日",
    },
  };

  const l = labels[locale] || labels.en;

  // Less than 1 hour ago - show relative time
  if (diffHour < 1) {
    return formatTimeAgo(date, locale);
  }

  // Today
  if (isToday(date)) {
    return `${l.today} ${formatTime(date, locale)}`;
  }

  // Yesterday
  if (isYesterday(date)) {
    return `${l.yesterday} ${formatTime(date, locale)}`;
  }

  // Less than 7 days - show relative
  if (diffHour < 24 * 7) {
    return formatTimeAgo(date, locale);
  }

  // Older - show full date with time
  return formatDateTime(date, locale);
}
