"use client";

/**
 * Translation adapter for Underverse UI components.
 *
 * This module provides a unified translation interface that:
 * 1. Uses next-intl when available (for Next.js projects)
 * 2. Falls back to @underverse-ui/underverse's internal translations
 *
 * Components should import from this file instead of directly from next-intl
 * to ensure compatibility with both Next.js and React projects.
 */

import * as React from "react";

// ============================================================================
// Default translations (fallback when next-intl is not available)
// ============================================================================
type TranslationValue = string | Record<string, string>;
type NamespaceTranslations = Record<string, TranslationValue>;
type LocaleTranslations = Record<string, NamespaceTranslations>;

const defaultTranslations: Record<string, LocaleTranslations> = {
  en: {
    Common: {
      close: "Close",
      closeAlert: "Close alert",
      notifications: "Notifications",
      newNotification: "New",
      readStatus: "Read",
      openLink: "Open link",
      theme: "Theme",
      lightTheme: "Light",
      darkTheme: "Dark",
      systemTheme: "System",
      density: "Density",
      compact: "Compact",
      normal: "Normal",
      comfortable: "Comfortable",
      columns: "Columns",
    },
    ValidationInput: {
      required: "This field is required",
      typeMismatch: "Invalid format",
      pattern: "Invalid pattern",
      tooShort: "Too short",
      tooLong: "Too long",
      rangeUnderflow: "Below minimum",
      rangeOverflow: "Above maximum",
      stepMismatch: "Step mismatch",
      badInput: "Bad input",
      invalid: "Invalid value",
    },
    Loading: {
      loadingPage: "Loading page",
      pleaseWait: "Please wait",
    },
    DatePicker: {
      placeholder: "Select date",
      today: "Today",
      clear: "Clear",
    },
    CalendarTimeline: {
      today: "Today",
      prev: "Previous",
      next: "Next",
      month: "Month",
      week: "Week",
      day: "Day",
      expandGroup: "Expand group",
      collapseGroup: "Collapse group",
      more: "+{n} more",
    },
    Pagination: {
      navigationLabel: "Pagination navigation",
      showingResults: "Showing {startItem}–{endItem} of {totalItems}",
      firstPage: "First page",
      previousPage: "Previous page",
      previous: "Previous",
      nextPage: "Next page",
      next: "Next",
      lastPage: "Last page",
      pageNumber: "Page {page}",
      itemsPerPage: "Items per page",
      search: "Search",
      noOptions: "No options",
    },
    Form: {
      required: "This field is required",
    },
    OCR: {
      imageUpload: {
        dragDropText: "Drag & drop files here",
        browseFiles: "Browse files",
        supportedFormats: "Supported formats: images",
      },
    },
  },
  vi: {
    Common: {
      close: "Đóng",
      closeAlert: "Đóng cảnh báo",
      notifications: "Thông báo",
      newNotification: "Mới",
      readStatus: "Đã đọc",
      openLink: "Mở liên kết",
      theme: "Chủ đề",
      lightTheme: "Giao diện sáng",
      darkTheme: "Giao diện tối",
      systemTheme: "Theo hệ thống",
      density: "Mật độ",
      compact: "Gọn",
      normal: "Thường",
      comfortable: "Thoải mái",
      columns: "Cột",
    },
    ValidationInput: {
      required: "Trường này là bắt buộc",
      typeMismatch: "Định dạng không hợp lệ",
      pattern: "Sai mẫu",
      tooShort: "Quá ngắn",
      tooLong: "Quá dài",
      rangeUnderflow: "Nhỏ hơn giá trị tối thiểu",
      rangeOverflow: "Lớn hơn giá trị tối đa",
      stepMismatch: "Sai bước",
      badInput: "Giá trị không hợp lệ",
      invalid: "Giá trị không hợp lệ",
    },
    Loading: {
      loadingPage: "Đang tải trang",
      pleaseWait: "Vui lòng chờ",
    },
    DatePicker: {
      placeholder: "Chọn ngày",
      today: "Hôm nay",
      clear: "Xóa",
    },
    CalendarTimeline: {
      today: "Hôm nay",
      prev: "Trước",
      next: "Sau",
      month: "Tháng",
      week: "Tuần",
      day: "Ngày",
      expandGroup: "Mở nhóm",
      collapseGroup: "Thu gọn nhóm",
      more: "+{n} thêm",
    },
    Pagination: {
      navigationLabel: "Điều hướng phân trang",
      showingResults: "Hiển thị {startItem}–{endItem} trong tổng {totalItems}",
      firstPage: "Trang đầu",
      previousPage: "Trang trước",
      previous: "Trước",
      nextPage: "Trang sau",
      next: "Sau",
      lastPage: "Trang cuối",
      pageNumber: "Trang {page}",
      itemsPerPage: "Số mục/trang",
      search: "Tìm kiếm",
      noOptions: "Không có lựa chọn",
    },
    Form: {
      required: "Trường này là bắt buộc",
    },
    OCR: {
      imageUpload: {
        dragDropText: "Kéo & thả ảnh vào đây",
        browseFiles: "Chọn tệp",
        supportedFormats: "Hỗ trợ các định dạng ảnh",
      },
    },
  },
  ko: {
    Common: {
      close: "닫기",
      closeAlert: "알림 닫기",
      notifications: "알림",
      newNotification: "새로운",
      readStatus: "읽음",
      openLink: "링크 열기",
      theme: "테마",
      lightTheme: "라이트",
      darkTheme: "다크",
      systemTheme: "시스템",
      density: "밀도",
      compact: "컴팩트",
      normal: "보통",
      comfortable: "여유",
      columns: "열",
    },
    ValidationInput: {
      required: "필수 입력 항목입니다",
      typeMismatch: "형식이 올바르지 않습니다",
      pattern: "패턴이 일치하지 않습니다",
      tooShort: "너무 짧습니다",
      tooLong: "너무 깁니다",
      rangeUnderflow: "최솟값보다 작습니다",
      rangeOverflow: "최댓값을 초과했습니다",
      stepMismatch: "단계가 일치하지 않습니다",
      badInput: "잘못된 입력입니다",
      invalid: "유효하지 않은 값입니다",
    },
    Loading: {
      loadingPage: "페이지 로딩 중",
      pleaseWait: "잠시만 기다려 주세요",
    },
    DatePicker: {
      placeholder: "날짜 선택",
      today: "오늘",
      clear: "지우기",
    },
    CalendarTimeline: {
      today: "오늘",
      prev: "이전",
      next: "다음",
      month: "월",
      week: "주",
      day: "일",
      expandGroup: "그룹 펼치기",
      collapseGroup: "그룹 접기",
      more: "+{n}개 더",
    },
    Pagination: {
      navigationLabel: "페이지 네비게이션",
      showingResults: "{startItem}–{endItem} / 총 {totalItems}개",
      firstPage: "첫 페이지",
      previousPage: "이전 페이지",
      previous: "이전",
      nextPage: "다음 페이지",
      next: "다음",
      lastPage: "마지막 페이지",
      pageNumber: "{page}페이지",
      itemsPerPage: "페이지당 항목 수",
      search: "검색",
      noOptions: "옵션 없음",
    },
    Form: {
      required: "필수 입력 항목입니다",
    },
    OCR: {
      imageUpload: {
        dragDropText: "여기에 파일을 드래그 앤 드롭하세요",
        browseFiles: "파일 찾아보기",
        supportedFormats: "지원 형식: 이미지",
      },
    },
  },
  ja: {
    Common: {
      close: "閉じる",
      closeAlert: "アラートを閉じる",
      notifications: "通知",
      newNotification: "新規",
      readStatus: "既読",
      openLink: "リンクを開く",
      theme: "テーマ",
      lightTheme: "ライト",
      darkTheme: "ダーク",
      systemTheme: "システム",
      density: "密度",
      compact: "コンパクト",
      normal: "通常",
      comfortable: "ゆったり",
      columns: "列",
    },
    ValidationInput: {
      required: "この項目は必須です",
      typeMismatch: "形式が正しくありません",
      pattern: "パターンが一致しません",
      tooShort: "短すぎます",
      tooLong: "長すぎます",
      rangeUnderflow: "最小値より小さいです",
      rangeOverflow: "最大値を超えています",
      stepMismatch: "ステップが一致しません",
      badInput: "入力が無効です",
      invalid: "無効な値です",
    },
    Loading: {
      loadingPage: "ページを読み込み中",
      pleaseWait: "しばらくお待ちください",
    },
    DatePicker: {
      placeholder: "日付を選択",
      today: "今日",
      clear: "クリア",
    },
    CalendarTimeline: {
      today: "今日",
      prev: "前へ",
      next: "次へ",
      month: "月",
      week: "週",
      day: "日",
      expandGroup: "グループを展開",
      collapseGroup: "グループを折りたたむ",
      more: "+{n}件",
    },
    Pagination: {
      navigationLabel: "ページナビゲーション",
      showingResults: "{startItem}–{endItem} / 全{totalItems}件",
      firstPage: "最初のページ",
      previousPage: "前のページ",
      previous: "前へ",
      nextPage: "次のページ",
      next: "次へ",
      lastPage: "最後のページ",
      pageNumber: "{page}ページ",
      itemsPerPage: "1ページあたりの項目数",
      search: "検索",
      noOptions: "オプションなし",
    },
    Form: {
      required: "この項目は必須です",
    },
    OCR: {
      imageUpload: {
        dragDropText: "ここにファイルをドラッグ＆ドロップ",
        browseFiles: "ファイルを参照",
        supportedFormats: "対応形式：画像",
      },
    },
  },
};

// ============================================================================
// Translation Context (for standalone React usage)
// ============================================================================
type Locale = "en" | "vi" | "ko" | "ja";

interface TranslationContextType {
  locale: Locale;
  t: (namespace: string) => (key: string) => string;
}

const TranslationContext = React.createContext<TranslationContextType | null>(null);

export interface UnderverseProviderProps {
  children: React.ReactNode;
  /** Current locale. Defaults to "en" */
  locale?: Locale;
  /** Custom translations to merge with defaults */
  translations?: Record<string, Record<string, string | Record<string, string>>>;
}

/**
 * UnderverseProvider for standalone React usage (without next-intl).
 * Wrap your app with this provider to enable translations.
 *
 * @example
 * ```tsx
 * // For React (Vite, CRA, etc.) - without next-intl
 * import { UnderverseProvider, DatePicker } from "@underverse-ui/underverse";
 *
 * function App() {
 *   return (
 *     <UnderverseProvider locale="vi">
 *       <DatePicker onChange={(date) => console.log(date)} />
 *     </UnderverseProvider>
 *   );
 * }
 * ```
 */
export const UnderverseProvider: React.FC<UnderverseProviderProps> = ({ children, locale = "en", translations }) => {
  const t = React.useCallback(
    (namespace: string) => {
      return (key: string): string => {
        const mergedTranslations = {
          ...defaultTranslations[locale],
          ...translations,
        };

        // Handle nested namespaces like "OCR.imageUpload"
        const parts = namespace.split(".");
        let current: unknown = mergedTranslations;

        for (const part of parts) {
          if (current && typeof current === "object" && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return key;
          }
        }

        if (current && typeof current === "object" && key in current) {
          const value = (current as Record<string, unknown>)[key];
          return typeof value === "string" ? value : key;
        }

        return key;
      };
    },
    [locale, translations]
  );

  return <TranslationContext.Provider value={{ locale, t }}>{children}</TranslationContext.Provider>;
};

// ============================================================================
// Try to detect next-intl
// ============================================================================
let nextIntlAvailable = false;
let nextIntlUseTranslations: ((namespace: string) => (key: string) => string) | null = null;
let nextIntlUseLocale: (() => string) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nextIntl = require("next-intl");
  if (nextIntl && typeof nextIntl.useTranslations === "function") {
    nextIntlAvailable = true;
    nextIntlUseTranslations = nextIntl.useTranslations;
    nextIntlUseLocale = nextIntl.useLocale;
  }
} catch {
  // next-intl not available
}

// ============================================================================
// Smart hooks that auto-detect translation system
// ============================================================================

/**
 * Interpolate placeholders in a string.
 * Replaces {key} with the corresponding value from params.
 */
function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

/**
 * Internal fallback translation function.
 */
function getInternalTranslation(namespace: string, locale: Locale): (key: string, params?: Record<string, unknown>) => string {
  return (key: string, params?: Record<string, unknown>): string => {
    const localeTranslations = defaultTranslations[locale] || defaultTranslations.en;
    const parts = namespace.split(".");
    let current: unknown = localeTranslations;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return interpolate(key, params);
      }
    }

    if (current && typeof current === "object" && key in current) {
      const value = (current as Record<string, unknown>)[key];
      return typeof value === "string" ? interpolate(value, params) : interpolate(key, params);
    }

    return interpolate(key, params);
  };
}

/**
 * Smart translation hook that works with both next-intl and standalone React.
 *
 * Priority:
 * 1. next-intl (if available and in NextIntlClientProvider)
 * 2. UnderverseProvider context
 * 3. English fallback defaults
 *
 * @param namespace - The translation namespace (e.g., "DatePicker", "Common")
 */
export function useTranslations(namespace: string): (key: string, params?: Record<string, unknown>) => string {
  const underverseContext = React.useContext(TranslationContext);

  // If UnderverseProvider is available, use it
  if (underverseContext) {
    return (key: string, params?: Record<string, unknown>) => {
      const result = underverseContext.t(namespace)(key);
      return interpolate(result, params);
    };
  }

  // Try next-intl if available
  if (nextIntlAvailable && nextIntlUseTranslations) {
    try {
      // This will throw if not wrapped in NextIntlClientProvider
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const nextIntlT = nextIntlUseTranslations(namespace);
      // next-intl's t function already supports params
      return nextIntlT as (key: string, params?: Record<string, unknown>) => string;
    } catch {
      // Fall through to default
    }
  }

  // Fallback to English defaults
  return getInternalTranslation(namespace, "en");
}

/**
 * Smart locale hook that works with both next-intl and standalone React.
 */
export function useLocale(): Locale {
  const underverseContext = React.useContext(TranslationContext);

  // If UnderverseProvider is available, use it
  if (underverseContext) {
    return underverseContext.locale;
  }

  // Try next-intl if available
  if (nextIntlAvailable && nextIntlUseLocale) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const locale = nextIntlUseLocale();
      if (locale === "en" || locale === "vi" || locale === "ko" || locale === "ja") return locale;
      if (locale?.startsWith?.("vi")) return "vi";
      if (locale?.startsWith?.("ko")) return "ko";
      if (locale?.startsWith?.("ja")) return "ja";
      return "en";
    } catch {
      // Fall through to default
    }
  }

  // Fallback to English
  return "en";
}

export type { Locale };
