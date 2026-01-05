# DatePicker

Source: `components/ui/DatePicker.tsx`

Exports:

- DatePicker
- DateRangePicker

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja). Tự động detect `next-intl` hoặc sử dụng `TranslationProvider`.

## Supported Locales

| Locale | Placeholder   | Today   | Clear  |
| ------ | ------------- | ------- | ------ |
| `en`   | Select a date | Today   | Clear  |
| `vi`   | Chọn ngày     | Hôm nay | Xóa    |
| `ko`   | 날짜 선택     | 오늘    | 지우기 |
| `ja`   | 日付を選択    | 今日    | クリア |

## DatePicker

Props type: `DatePickerProps`

```tsx
import { DatePicker } from "@underverse-ui/underverse";

export function Example() {
  return <DatePicker />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DatePicker } from "@underverse-ui/underverse";

export function Example() {
  const [date, setDate] = React.useState();
  return <DatePicker value={date} onChange={setDate} label="Ngay giao" placeholder="Chon ngay" />;
}
```

### Với TranslationProvider (Standalone React):

```tsx
import React from "react";
import { TranslationProvider, DatePicker } from "@underverse-ui/underverse";

export function App() {
  const [date, setDate] = React.useState();
  return (
    <TranslationProvider locale="ko">
      <DatePicker value={date} onChange={setDate} label="배송일" />
      {/* Placeholder sẽ hiển thị: 날짜 선택 */}
    </TranslationProvider>
  );
}
```

### Override labels thủ công:

```tsx
<DatePicker value={date} onChange={setDate} todayLabel="今日 (custom)" clearLabel="クリア (custom)" placeholder="日付を選んでください" />
```

```ts
export interface DatePickerProps {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
  required?: boolean;
  todayLabel?: string;
  clearLabel?: string;
  weekdayLabels?: string[];
}
```

## DateRangePicker

Props type: `DateRangePickerProps`

```tsx
import { DateRangePicker } from "@underverse-ui/underverse";

export function Example() {
  return <DateRangePicker />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DateRangePicker } from "@underverse-ui/underverse";

export function Example() {
  const [range, setRange] = React.useState({ start: undefined, end: undefined });
  return <DateRangePicker value={range} onChange={setRange} label="Khoang ngay" placeholder="Chon khoang" />;
}
```

```ts
type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  onChange: (start: Date, end: Date) => void;
  placeholder?: string;
  className?: string;
};
```
