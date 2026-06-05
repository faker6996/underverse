# Vietnamese localization style guide for AI translation agents

# 1. Core principles

- Use natural Vietnamese product UI wording.
- Do NOT translate literally from English, Korean, or Japanese.
- Translate based on UI context and user intent.
- Prioritize clarity, readability, and familiar Vietnamese UX conventions.
- Vietnamese UI should feel concise, modern, and practical.
- Avoid machine-translation tone.
- Keep terminology consistent within the same module.

---

# 2. Context-first translation rule

## Rule

- Always identify UI context before translating.

Possible contexts:
- Button / CTA
- Tab
- Badge
- Status chip
- Toast
- Error message
- Modal
- Placeholder
- Empty state
- Tooltip
- Menu
- Audit log

- The same English word may require different Vietnamese translations depending on context.

Examples:

| English | Context | Vietnamese |
|---|---|---|
| Confirm | info popup | Xác nhận |
| Confirm | delete action | Xóa |
| Confirm | save action | Lưu |
| Confirm | approval action | Duyệt |
| Close | modal | Đóng |
| Close | ticket | Kết thúc |
| Apply | filter | Áp dụng |
| Apply | job application | Ứng tuyển |

---

# 3. General tone

## Rule

- Use professional but natural Vietnamese.
- Prefer concise wording.
- Avoid robotic or overly formal wording.
- Avoid translated bureaucratic tone unless required.

Preferred:
- `Vui lòng ...`
- `Đã ...`
- `Không thể ...`
- `... thành công`

Avoid:
- overly literal wording
- legalistic wording
- unnatural translated structure

---

# 4. Buttons / CTA

## Core rule

- Vietnamese UX prefers action-specific CTA labels.
- Avoid generic wording when the action is explicit.

Examples:

| English | Vietnamese |
|---|---|
| Save | Lưu |
| Delete | Xóa |
| Edit | Chỉnh sửa |
| Submit | Gửi |
| Approve | Duyệt |
| Reject | Từ chối |
| Upload | Tải lên |
| Download | Tải xuống |
| Reset | Đặt lại |
| Logout | Đăng xuất |

---

## Do not blindly translate "Confirm"

- Do NOT always translate `Confirm` as `Xác nhận`.

Use the actual business action whenever possible.

Examples:

| Context | Preferred Vietnamese |
|---|---|
| Generic info popup | Xác nhận |
| Delete confirm | Xóa |
| Save confirm | Lưu |
| Approval confirm | Duyệt |
| Reject confirm | Từ chối |

Good:
- `Hủy | Xóa`
- `Hủy | Lưu`
- `Hủy | Duyệt`

Avoid:
- `Hủy | Xác nhận`
when the action is actually delete/save/approve/etc.

---

## Destructive actions

- Destructive actions must clearly indicate destructive intent.

Good:
- `Xóa`
- `Xóa vĩnh viễn`
- `Đặt lại`

Bad:
- `Xác nhận`

---

# 5. Short labels / tabs / badges / chips

## Rule

- Keep labels concise.
- Avoid overly long phrasing.

Good:
- `Đã gửi`
- `Đã duyệt`
- `Từ chối`
- `Hoàn thành`
- `Đang xử lý`
- `Nháp`

Avoid:
- overly verbose wording
- full sentence structure in chips/tabs

Bad:
- `Yêu cầu đã được gửi thành công`

for a status chip.

---

## Important exception

Do NOT shorten:
- toast messages
- helper text
- descriptions
- audit logs

Use natural full Vietnamese sentences instead.

Good:
- `Yêu cầu đã được gửi thành công.`

Bad:
- `Đã gửi`

as a toast message.

---

# 6. Toasts / alerts / notifications

## Rule

- Use complete natural Vietnamese sentences.
- Clearly communicate result/state.

Examples:

| English | Vietnamese |
|---|---|
| Saved successfully | Đã lưu thành công. |
| Upload failed | Tải lên thất bại. |
| Request submitted | Yêu cầu đã được gửi. |
| Deleted successfully | Đã xóa thành công. |
| No data found | Không có dữ liệu. |

---

## User instructions

Prefer:
- `Vui lòng ...`

Examples:
- `Vui lòng chọn tệp.`
- `Vui lòng nhập tên.`

---

# 7. Error messages

## Rule

- Explain:
  1. what happened
  2. what the user can do next

Avoid:
- blaming tone
- raw technical wording unless required

Examples:

| English | Vietnamese |
|---|---|
| Invalid file format | Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp khác. |
| Network error | Kết nối mạng không ổn định. Vui lòng thử lại sau. |
| Required field | Đây là trường bắt buộc. |

---

# 8. Confirmation dialogs

## Rule

- Title should be short and direct.
- Body should explain consequence.
- CTA must match actual action.

Good example:

Title:
- `Bạn có muốn xóa không?`

Body:
- `Dữ liệu đã xóa sẽ không thể khôi phục.`

Buttons:
- `Hủy | Xóa`

Bad:
- `Hủy | Xác nhận`

---

# 9. Placeholder text

## Rule

- Use short hint-style wording.
- Avoid long instructional placeholders.

Examples:

| English | Vietnamese |
|---|---|
| Search by name | Tìm theo tên |
| Enter email | Nhập email |
| Select department | Chọn phòng ban |

---

# 10. Menu / navigation labels

## Rule

- Use nouns or short noun phrases.
- Keep wording consistent.

Examples:

| English | Vietnamese |
|---|---|
| Dashboard | Bảng điều khiển |
| User Management | Quản lý người dùng |
| Attendance | Chấm công |
| Settings | Cài đặt |
| Reports | Báo cáo |
| OCR Result | Kết quả OCR |

---

# 11. Empty states

## Rule

- Clearly explain empty state.
- Suggest next action when useful.

Examples:

- `Không có dữ liệu.`
- `Chưa có yêu cầu nào được tạo.`
- `Hãy tạo yêu cầu mới.`

---

# 12. Consistency rules

## Terminology consistency

- Use one Vietnamese term per concept.

Avoid mixing:
- `Người dùng`
- `User`
- `Thành viên`

for the same concept.

Avoid mixing:
- `Xóa`
- `Gỡ`
- `Loại bỏ`

without semantic reason.

---

## Create module glossary

Each module should maintain fixed terminology.

Example modules:
- OCR
- Attendance
- Approval
- Admin
- Dashboard

---

# 13. Recommended terminology

| English | Vietnamese |
|---|---|
| User | Người dùng |
| Admin | Quản trị viên |
| Role | Vai trò |
| Permission | Quyền |
| Department | Phòng ban |
| Status | Trạng thái |
| Request | Yêu cầu |
| Approval | Duyệt |
| Rejection | Từ chối |
| Submit | Gửi |
| Save | Lưu |
| Edit | Chỉnh sửa |
| Delete | Xóa |
| Search | Tìm kiếm |
| Filter | Bộ lọc |
| Reset | Đặt lại |
| Upload | Tải lên |
| Download | Tải xuống |

---

# 14. Avoid literal translation

## Rule

- Rewrite naturally for Vietnamese UX flow.
- Do not preserve English grammar structure.

Bad:
- `Yêu cầu mới`

when used as CTA.

Better:
- `Tạo yêu cầu`
- `Tạo mới`

---

# 15. Vietnamese compact UI preference

## Rule

Vietnamese UI commonly prefers:
- short action labels
- concise wording
- practical UX language

Examples:
- `Lưu`
- `Xóa`
- `Duyệt`
- `Cài đặt`
- `Tìm kiếm`

instead of verbose phrases.

---

# 16. Vietnamese wording style

## Rule

- Avoid excessive Sino-Vietnamese wording unless enterprise/legal context requires it.
- Prefer modern common Vietnamese.

Prefer:
- `Tải lên`

Avoid:
- `Tải tải liệu lên hệ thống`

---

# 17. Date / number / currency formatting

## Dates

Compact:
- `07/05/2026`

Full:
- `Ngày 07 tháng 05 năm 2026`

---

## Currency

Prefer:
- `2.200₫`
- `2.200 VNĐ`

Avoid:
- `VND 2200.00`

unless required.

---

# 18. Layout safety

## Rule

- Vietnamese text can become longer than English.
- Avoid fixed-width buttons.
- Test:
  - modal width
  - mobile layout
  - tabs
  - tables

Do not aggressively reduce font size.

---

# 19. Namespace / i18n key rules

## Rule

- Keep keys concise.
- Group by module/page.
- Prefer module namespaces.

Good:
- `OCR.lineEditor.save`
- `OCR.result.empty`
- `Attendance.report.download`

Avoid:
- `Common.text1`
- `Button.label`
- `Common.saveText`

---

# 20. AI translation review checklist

After AI translation, verify:

- Does it sound like natural Vietnamese UI?
- Does it match UI component type?
- Is terminology consistent?
- Is wording too literal?
- Is CTA action-specific?
- Is destructive intent explicit?
- Does the text fit UI layout?
- Would a Vietnamese product designer accept this wording?

---

# 21. Vietnamese enterprise UX patterns

## Vietnamese enterprise UX commonly prefers:

- concise wording
- explicit actions
- clear labels
- practical language
- low ambiguity

Preferred:
- `Duyệt`
- `Từ chối`
- `Xóa`
- `Lưu`

Avoid vague wording:
- `Xác nhận`
- `Thực hiện`

when a more explicit action exists.

---

# 22. Translation anti-patterns

## Avoid dictionary translation

Bad:
- translating word-by-word

Good:
- translating by user intent

---

## Avoid inconsistent tone

Bad:
- mixing casual and formal Vietnamese

---

## Avoid English grammar order

Bad:
- preserving English sentence structure

---

## Avoid over-translation

Bad:
- making compact labels too verbose

---

## Avoid under-translation

Bad:
- shortening full messages unnaturally

---

# 23. Golden rule

- Translate for how Vietnamese users actually use software.
- Natural Vietnamese UX is more important than literal translation accuracy.
- UI context matters more than dictionary meaning.