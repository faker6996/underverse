# DateUtils

Source: `packages/underverse/src/utils/date.ts`

Exports:

- `formatDate`
- `formatDateShort`
- `formatTime`
- `formatDateTime`
- `formatTimeAgo`
- `formatDateSmart`
- `isToday`
- `isYesterday`
- `getDayOfWeek`
- `formatDateForInput`
- `formatDateTimeForInput`

Note: Đây là các utility functions cho xử lý ngày tháng với hỗ trợ đa ngôn ngữ. Không phụ thuộc Next.js.

## Installation

```tsx
import { DateUtils } from "@underverse-ui/underverse";
```

## Supported Locales

| Locale | Language   | Example Output    |
| ------ | ---------- | ----------------- |
| `en`   | English    | January 5, 2026   |
| `vi`   | Tiếng Việt | 05/01/2026        |
| `ko`   | 한국어     | 2026년 1월 5일    |
| `ja`   | 日本語     | 2026 年 1 月 5 日 |

## formatDate

Format ngày đầy đủ theo locale.

```tsx
import { DateUtils } from "@underverse-ui/underverse";

DateUtils.formatDate(new Date(), "en"); // "January 5, 2026"
DateUtils.formatDate(new Date(), "vi"); // "05/01/2026"
DateUtils.formatDate(new Date(), "ko"); // "2026년 1월 5일"
DateUtils.formatDate(new Date(), "ja"); // "2026年1月5日"
```

## formatDateShort

Format ngày ngắn gọn.

```tsx
DateUtils.formatDateShort(new Date(), "en"); // "Jan 5, 2026"
DateUtils.formatDateShort(new Date(), "vi"); // "05/01/2026"
DateUtils.formatDateShort(new Date(), "ko"); // "2026. 1. 5."
DateUtils.formatDateShort(new Date(), "ja"); // "2026/01/05"
```

## formatTime

Format giờ phút.

```tsx
DateUtils.formatTime(new Date(), "en"); // "14:30" (24h) hoặc "2:30 PM" (12h)
DateUtils.formatTime(new Date(), "vi"); // "14:30"
DateUtils.formatTime(new Date(), "ko"); // "오후 2:30"
DateUtils.formatTime(new Date(), "ja"); // "14:30"
```

## formatDateTime

Format ngày + giờ.

```tsx
DateUtils.formatDateTime(new Date(), "en"); // "January 5, 2026 at 2:30 PM"
DateUtils.formatDateTime(new Date(), "vi"); // "05/01/2026 14:30"
DateUtils.formatDateTime(new Date(), "ko"); // "2026년 1월 5일 오후 2:30"
DateUtils.formatDateTime(new Date(), "ja"); // "2026年1月5日 14:30"
```

## formatTimeAgo

Format thời gian tương đối (relative time).

```tsx
const oneHourAgo = new Date(Date.now() - 3600000);
const oneDayAgo = new Date(Date.now() - 86400000);

DateUtils.formatTimeAgo(oneHourAgo, "en"); // "1 hour ago"
DateUtils.formatTimeAgo(oneHourAgo, "vi"); // "1 giờ trước"
DateUtils.formatTimeAgo(oneHourAgo, "ko"); // "1시간 전"
DateUtils.formatTimeAgo(oneHourAgo, "ja"); // "1時間前"

DateUtils.formatTimeAgo(oneDayAgo, "en"); // "1 day ago"
DateUtils.formatTimeAgo(oneDayAgo, "vi"); // "1 ngày trước"
DateUtils.formatTimeAgo(oneDayAgo, "ko"); // "1일 전"
DateUtils.formatTimeAgo(oneDayAgo, "ja"); // "1日前"
```

### Supported Time Units

| Unit     | English   | Vietnamese | Korean | Japanese |
| -------- | --------- | ---------- | ------ | -------- |
| second   | second(s) | giây       | 초     | 秒       |
| minute   | minute(s) | phút       | 분     | 分       |
| hour     | hour(s)   | giờ        | 시간   | 時間     |
| day      | day(s)    | ngày       | 일     | 日       |
| week     | week(s)   | tuần       | 주     | 週間     |
| month    | month(s)  | tháng      | 개월   | ヶ月     |
| year     | year(s)   | năm        | 년     | 年       |
| just now | just now  | vừa xong   | 방금   | たった今 |

## formatDateSmart

Format thông minh: Hôm nay/Hôm qua + giờ, hoặc ngày đầy đủ.

```tsx
const now = new Date();
const yesterday = new Date(Date.now() - 86400000);
const lastWeek = new Date(Date.now() - 7 * 86400000);

DateUtils.formatDateSmart(now, "en"); // "Today 14:30"
DateUtils.formatDateSmart(now, "vi"); // "Hôm nay 14:30"
DateUtils.formatDateSmart(now, "ko"); // "오늘 14:30"
DateUtils.formatDateSmart(now, "ja"); // "今日 14:30"

DateUtils.formatDateSmart(yesterday, "en"); // "Yesterday 14:30"
DateUtils.formatDateSmart(yesterday, "vi"); // "Hôm qua 14:30"
DateUtils.formatDateSmart(yesterday, "ko"); // "어제 14:30"
DateUtils.formatDateSmart(yesterday, "ja"); // "昨日 14:30"

DateUtils.formatDateSmart(lastWeek, "en"); // "December 29, 2025"
```

## isToday / isYesterday

Kiểm tra ngày.

```tsx
DateUtils.isToday(new Date()); // true
DateUtils.isToday(new Date(Date.now() - 86400000)); // false

DateUtils.isYesterday(new Date(Date.now() - 86400000)); // true
DateUtils.isYesterday(new Date()); // false
```

## getDayOfWeek

Lấy tên ngày trong tuần.

```tsx
DateUtils.getDayOfWeek(new Date(), "en"); // "Sunday"
DateUtils.getDayOfWeek(new Date(), "vi"); // "Chủ nhật"
DateUtils.getDayOfWeek(new Date(), "ko"); // "일요일"
DateUtils.getDayOfWeek(new Date(), "ja"); // "日曜日"
```

## formatDateForInput

Format cho `<input type="date">`.

```tsx
DateUtils.formatDateForInput(new Date()); // "2026-01-05"
```

## formatDateTimeForInput

Format cho `<input type="datetime-local">`.

```tsx
DateUtils.formatDateTimeForInput(new Date()); // "2026-01-05T14:30"
```

## Type Definitions

```ts
export type SupportedLocale = "en" | "vi" | "ko" | "ja";

export function formatDate(date: Date, locale?: SupportedLocale): string;
export function formatDateShort(date: Date, locale?: SupportedLocale): string;
export function formatTime(date: Date, locale?: SupportedLocale): string;
export function formatDateTime(date: Date, locale?: SupportedLocale): string;
export function formatTimeAgo(date: Date, locale?: SupportedLocale): string;
export function formatDateSmart(date: Date, locale?: SupportedLocale): string;
export function isToday(date: Date): boolean;
export function isYesterday(date: Date): boolean;
export function getDayOfWeek(date: Date, locale?: SupportedLocale): string;
export function formatDateForInput(date: Date): string;
export function formatDateTimeForInput(date: Date): string;
```
