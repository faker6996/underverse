# ButtonExample — Tổng Kết Tab “Document”

## Tổng quan
- Thêm tab “Document” (dựa trên DataTable) để liệt kê props của Button rõ ràng, súc tích.
- Áp dụng component pattern dùng chung để hiển thị bảng props không phân trang, thống nhất thứ tự và định dạng.

## Thay đổi chính
- Chuyển sang pattern: dùng `PropsDocsTable` + `PropsRow` từ `./PropsDocsTabPattern` thay cho bảng HTML thủ công.
- Bổ sung đủ dữ liệu props: khai báo `rows` bao phủ toàn bộ props của Button (appearance, behavior, accessibility).
- Sắp xếp props: `order` bám theo thứ tự destructuring trong `components/ui/Button.tsx` để phản ánh thứ tự sử dụng thực tế.
- Mở rộng kiểu literal cho dễ hiểu:
  - `variant`: hiển thị đầy đủ giá trị union ("default" | "outline" | "primary" | "secondary" | "success" | "danger" | "destructive" | "warning" | "info" | "ghost" | "link" | "gradient").
  - `size`: hiển thị đầy đủ ("sm" | "md" | "lg" | "smx" | "icon").
- Làm rõ `onClick`:
  - Type: `(event: React.MouseEvent<HTMLButtonElement>) => void`.
  - Mô tả: giải thích dễ hiểu; nêu rõ có thể trả Promise để Button chờ hoàn tất (hữu ích với `preventDoubleClick`).
- Không phân trang: pattern render tất cả hàng trong một trang (tắt density/column toggle để bảng gọn gàng).

## File đã chỉnh
- `app/[locale]/(pages)/docs/underverse/_examples/ButtonExample.tsx`
  - Import `PropsDocsTable`, khai báo `rows` + `order`.
  - Thêm tab “Document” vào cấu hình `Tabs`.
  - Mở rộng kiểu literal cho `variant`, `size`; cập nhật mô tả `onClick`.
- `app/[locale]/(pages)/docs/underverse/_examples/PropsDocsTabPattern.tsx`
  - Pattern tái sử dụng để hiển thị bảng props bằng `DataTable` (hiển thị tất cả, không phân trang).

## Cách tái sử dụng cho component khác
1) Import `PropsDocsTable, PropsRow` từ `./PropsDocsTabPattern` trong file Example.
2) Tạo `rows: PropsRow[]` (property, description, type, default).
3) Tạo `order: string[]` theo đúng thứ tự destructuring của component mục tiêu.
4) Thêm vào `Tabs`: `{ value: "docs", label: "Document", content: <div className="p-1"><PropsDocsTable rows={rows} order={order} /></div> }`.

## Ghi chú
- Các giá trị literal cho `variant` và `size` tham chiếu từ `lib/constants/constants-ui/button.ts`.
- Cần cập nhật `rows` và `order` khi thay đổi props của Button để tránh sai lệch.

## Yêu cầu đa ngôn ngữ (i18n)
- Sử dụng `next-intl` với hook `useTranslations("DocsUnderverse")` trong mỗi Example.
- Nhãn Tab: dùng `t("tabs.preview")`, `t("tabs.code")`, `t("tabs.document")` thay cho chuỗi cứng.
- Tiêu đề cột bảng (Property/Description/Type/Default) đã được nội địa hóa sẵn trong `PropsDocsTabPattern` qua `DocsUnderverse.propsTable.property|description|type|default`.
- Hàng dữ liệu props: mô tả lấy từ locale bằng khóa `DocsUnderverse.props.button.<prop>`, ví dụ `t("props.button.onClick")`, `t("props.button.variant")`, ...
- ICU placeholder cho dấu ngoặc nhọn `{}`: khi cần hiện literal trong chuỗi (ví dụ Tooltip `delay`), khai báo trong locale: `... {openBrace} open, close {closeBrace} ...` và trong code truyền giá trị: `t("props.tooltip.delay", { openBrace: "{", closeBrace: "}" })`.
- Bổ sung đầy đủ khóa tương ứng trong các tệp: `i18n/locales/en.json`, `vi.json`, `ja.json`, `ko.json`.
- Kiểm tra lỗi thiếu khóa (MISSING_MESSAGE) trên Console và thêm ngay nếu còn thiếu.
