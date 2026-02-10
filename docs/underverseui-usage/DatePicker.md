# DatePicker

Source: `components/ui/DatePicker.tsx`

Exports:

- DatePicker
- DateRangePicker

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja). Tự động detect `next-intl` hoặc sử dụng `TranslationProvider`.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                                              | Status |
| ---------------------------------------------------- | ------ |
| Label `htmlFor` attribute                            | ✅     |
| `aria-labelledby` on trigger                         | ✅     |
| ESC to close                                         | ✅     |
| `focus-visible` ring                                 | ✅     |
| Locale-aware date formatting (`Intl.DateTimeFormat`) | ✅     |

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

### Size variants

```tsx
// Default size (md)
<DatePicker value={date} onChange={setDate} />

// Compact size (sm)
<DatePicker value={date} onChange={setDate} size="sm" />
```

### Month/Year Selector

DatePicker hỗ trợ chọn tháng và năm nhanh:

- **Click vào tên tháng** → Hiển thị grid chọn tháng (12 tháng)
- **Click vào năm** → Hiển thị grid chọn năm (20 năm, có nút prev/next)

```tsx
// Year/Month selector được bật mặc định
<DatePicker value={date} onChange={setDate} />
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
  labelClassName?: string;
  required?: boolean;
  todayLabel?: string;
  clearLabel?: string;
  weekdayLabels?: string[];
  /** Disable selecting past dates (before today) */
  disablePastDates?: boolean;
  /** Minimum selectable date (inclusive). Compared by day in local timezone. */
  minDate?: Date;
  /** Maximum selectable date (inclusive). Compared by day in local timezone. */
  maxDate?: Date;
}
```

### Disable Past Dates (Không cho chọn ngày quá khứ)

```tsx
import React from "react";
import { DatePicker } from "@underverse-ui/underverse";

export function Example() {
  const [date, setDate] = React.useState<Date>();
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      label="Ngày hẹn"
      disablePastDates={true} // Không cho phép chọn ngày quá khứ
    />
  );
}
```

### Min/Max Date (Giới hạn khoảng ngày)

```tsx
import React from "react";
import { DatePicker } from "@underverse-ui/underverse";

export function Example() {
  const [date, setDate] = React.useState<Date>();
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      minDate={new Date(2026, 0, 10)} // 10/01/2026
      maxDate={new Date(2026, 1, 5)} // 05/02/2026
    />
  );
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
  /** Disable selecting past dates (before today) */
  disablePastDates?: boolean;
  /** Minimum selectable date (inclusive). Compared by day in local timezone. */
  minDate?: Date;
  /** Maximum selectable date (inclusive). Compared by day in local timezone. */
  maxDate?: Date;
  /** Size variant */
  size?: "sm" | "md";
};
```

### Size variants (DateRangePicker)

```tsx
// Default size (md)
<DateRangePicker startDate={start} endDate={end} onChange={handleChange} />

// Compact size (sm) - useful for filters, toolbars
<DateRangePicker startDate={start} endDate={end} onChange={handleChange} size="sm" />
```

### Disable Past Dates (DateRangePicker)

```tsx
import React from "react";
import { DateRangePicker } from "@underverse-ui/underverse";

export function Example() {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onChange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }}
      placeholder="Chọn khoảng thời gian"
      disablePastDates={true} // Không cho phép chọn ngày quá khứ
    />
  );
}
```

### Min/Max Date (DateRangePicker)

```tsx
import React from "react";
import { DateRangePicker } from "@underverse-ui/underverse";

export function Example() {
  return (
    <DateRangePicker
      minDate={new Date(2026, 0, 10)}
      maxDate={new Date(2026, 1, 5)}
      onChange={(start, end) => {
        console.log(start, end);
      }}
    />
  );
}
```
