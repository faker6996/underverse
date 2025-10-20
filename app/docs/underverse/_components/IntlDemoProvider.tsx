"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";

const messages = {
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
    systemTheme: "Theo hệ thống"
  },
  ValidationInput: {
    required: "Trường này là bắt buộc",
    typeMismatch: "Định dạng không hợp lệ",
    pattern: "Không đúng định dạng yêu cầu",
    tooShort: "Quá ngắn",
    tooLong: "Quá dài",
    rangeUnderflow: "Nhỏ hơn giá trị tối thiểu",
    rangeOverflow: "Lớn hơn giá trị tối đa",
    stepMismatch: "Sai bước nhảy",
    badInput: "Giá trị không hợp lệ",
    invalid: "Giá trị không hợp lệ"
  },
  Loading: {
    loadingPage: "Đang tải trang",
    pleaseWait: "Vui lòng chờ"
  },
  DatePicker: {
    placeholder: "Chọn ngày",
    today: "Hôm nay",
    clear: "Xóa"
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
    itemsPerPage: "Số mục/trang"
  }
} as const;

export default function IntlDemoProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="vi" messages={messages as any}>{children}</NextIntlClientProvider>
  );
}
