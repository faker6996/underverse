/**
 * Date formatting utilities for Vietnamese locale
 * Provides consistent date/time formatting across the application
 */

/**
 * Format date to Vietnamese readable format
 * Example: "25 tháng 12, 2024"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format date to short format
 * Example: "25/12/2024"
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format time only
 * Example: "14:30"
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date and time
 * Example: "25/12/2024 14:30"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date with time - more readable
 * Example: "25 tháng 12, 2024 lúc 14:30"
 */
export function formatDateTimeLong(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dateStr = d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeStr = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateStr} lúc ${timeStr}`;
}

/**
 * Format relative time (time ago)
 * Example: "2 giờ trước", "3 ngày trước", "1 tuần trước"
 */
export function formatTimeAgo(date: string | Date | null | undefined): string {
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

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${diffYear} năm trước`;
}

/**
 * Format date range
 * Example: "25/12/2024 - 31/12/2024"
 */
export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string {
  const start = formatDateShort(startDate);
  const end = formatDateShort(endDate);

  if (!start && !end) return "";
  if (!start) return `Đến ${end}`;
  if (!end) return `Từ ${start}`;

  return `${start} - ${end}`;
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
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

  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Smart date formatting - shows relative time for recent dates, full date for older ones
 * Example:
 * - "Vừa xong" (< 1 min)
 * - "5 phút trước" (< 1 hour)
 * - "Hôm nay lúc 14:30" (today)
 * - "Hôm qua lúc 14:30" (yesterday)
 * - "25/12/2024 14:30" (older)
 */
export function formatDateSmart(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));

  // Less than 1 hour ago - show relative time
  if (diffHour < 1) {
    return formatTimeAgo(date);
  }

  // Today - show "Hôm nay lúc HH:MM"
  if (isToday(date)) {
    return `Hôm nay lúc ${formatTime(date)}`;
  }

  // Yesterday - show "Hôm qua lúc HH:MM"
  if (isYesterday(date)) {
    return `Hôm qua lúc ${formatTime(date)}`;
  }

  // Less than 7 days - show relative
  if (diffHour < 24 * 7) {
    return formatTimeAgo(date);
  }

  // Older - show full date with time
  return formatDateTime(date);
}

/**
 * Format date for input[type="date"]
 * Example: "2024-12-25"
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format date for input[type="datetime-local"]
 * Example: "2024-12-25T14:30"
 */
export function formatDateTimeForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dateStr = formatDateForInput(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr}T${hours}:${minutes}`;
}

/**
 * Get day of week in Vietnamese
 * Example: "Thứ Hai", "Thứ Ba", ...
 */
export function getDayOfWeek(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  return days[d.getDay()];
}

/**
 * Format with day of week
 * Example: "Thứ Hai, 25/12/2024"
 */
export function formatDateWithDay(date: string | Date | null | undefined): string {
  if (!date) return "";
  const dayOfWeek = getDayOfWeek(date);
  const dateStr = formatDateShort(date);

  return `${dayOfWeek}, ${dateStr}`;
}
