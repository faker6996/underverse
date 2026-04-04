# UEditor Font Plan

## Mục tiêu

Thêm hỗ trợ chọn:

- `fontFamily`
- `fontSize`
- `lineHeight`
- `letterSpacing`

cho `UEditor` theo hướng:

- áp dụng được cho text selection và text gõ tiếp theo
- parse/load lại được từ HTML hiện có
- không phá pipeline `prepareContentForSave()`
- không làm toolbar/bubble menu phình quá mức

## Quyết định triển khai

### 1. Dùng `TextStyle` làm nền

Không thêm mark mới cho typography. Thay vào đó mở rộng `textStyle` bằng 4 extension:

- `font-family.ts`
- `font-size.ts`
- `line-height.ts`
- `letter-spacing.ts`

Các extension này:

- parse từ inline style hiện có
- render lại về inline style
- thêm command:
  - `setFontFamily` / `unsetFontFamily`
  - `setFontSize` / `unsetFontSize`
  - `setLineHeight` / `unsetLineHeight`
  - `setLetterSpacing` / `unsetLetterSpacing`

### 2. UI đặt ở toolbar chính

Không đưa font family và letter-spacing vào bubble menu ở lượt đầu.

Lý do:

- bubble menu đang dành cho thao tác nhanh
- thêm nhiều control sẽ làm menu nổi nặng và khó dùng
- toolbar là vị trí hợp lý hơn cho typography controls
- `fontSize` và `lineHeight` có thể có quick control trong bubble menu

### 3. Preset mặc định an toàn

Font family mặc định:

- Sans: `sans-serif`
- Serif: `serif`
- Mono: `monospace`

Font size mặc định:

- `12px`
- `14px`
- `16px`
- `18px`
- `24px`
- `32px`

Line-height mặc định:

- `1.2`
- `1.5`
- `1.75`
- `2`

Letter-spacing mặc định:

- `-0.02em`
- `0`
- `0.02em`
- `0.05em`
- `0.08em`

Ngoài ra cho phép app truyền custom options qua props:

- `fontFamilies`
- `fontSizes`
- `lineHeights`
- `letterSpacings`

## Files triển khai

### Extension layer

- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/font-family.ts`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/font-size.ts`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/line-height.ts`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/letter-spacing.ts`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/extensions.ts`

### Public types

- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/types.ts`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor.tsx`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/index.ts`

### Runtime / Toolbar

- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/UEditor.tsx`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/src/components/UEditor/toolbar.tsx`

### Docs / Example / Locales

- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/app/[locale]/(pages)/docs/underverse/_examples/UEditorExample.tsx`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/docs/underverseui-usage/UEditor.md`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/locales/*.json`
- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/i18n/locales/*.json`

### Tests

- `/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/tests/ueditor.interaction.test.mjs`

## Validation

Sau khi xong cần pass:

- package typecheck
- app typecheck
- locale check
- `UEditor` interaction tests
- diff hygiene
