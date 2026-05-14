# GlobalI18nConfig — Global Label Override

Source: `packages/underverse/src/contexts/GlobalI18nContext.tsx`

Exports:

- `GlobalI18nConfig` (interface)
- `useGlobalI18n` (hook)
- `GlobalI18nProvider` (component — dùng nội bộ bởi provider)

---

## Tổng quan

`GlobalI18nConfig` là flat config object để override **tất cả** text tiếng Anh hardcoded trong DOM của Underverse UI bằng một chỗ duy nhất — tương tự `localeText` của MUI hay AG Grid.

**Priority order:**

```
component-level prop  >  GlobalI18nConfig  >  hardcoded English default
```

Tức là nếu bạn truyền `searchPlaceholder="Tìm..."` trực tiếp vào `<Combobox>`, nó vẫn thắng so với giá trị trong `i18n`. Không có breaking change.

---

## Cách dùng

### Next.js với next-intl

Truyền `i18n` vào `NextIntlAdapter` (alias: `UnderverseNextIntlProvider`):

```tsx
// app/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { NextIntlAdapter, underverseMessages } from "@underverse-ui/underverse";
import type { GlobalI18nConfig } from "@underverse-ui/underverse";

const i18n: GlobalI18nConfig = {
  searchPlaceholder: "Tìm kiếm...",
  selectPlaceholder: "Chọn...",
  noResults: "Không có kết quả",
  loading: "Đang tải...",
  clearAll: "Xóa tất cả",
  clearSearch: "Xóa tìm kiếm",
  clearSelection: "Xóa lựa chọn",
  tryDifferentSearch: "Thử từ khóa khác",
  today: "Hôm nay",
  clear: "Xóa",
  closeModal: "Đóng",
  closeToast: "Đóng thông báo",
  clearInput: "Xóa nội dung",
  showPassword: "Hiện mật khẩu",
  hidePassword: "Ẩn mật khẩu",
  increaseValue: "Tăng giá trị",
  decreaseValue: "Giảm giá trị",
  selectedCount: (n) => `Đã chọn ${n}`,
  selectedCountWithMax: (count, max) => `${count}/${max} đã chọn`,
  itemSelectedCount: (n) => `${n} đã chọn`,
  moreCount: (n) => `+${n} khác`,
  removeTag: (tag) => `Xóa "${tag}"`,
  removeBadge: "Xóa nhãn",
  prevSlide: "Slide trước",
  nextSlide: "Slide tiếp",
  goToSlide: (n) => `Đến slide ${n}`,
  carouselThumbnail: (n) => `Ảnh thu nhỏ ${n}`,
  download: "Tải xuống",
  removeFile: "Xóa file",
  previewFile: "Xem trước",
  retryUpload: "Thử lại",
  filterByColumn: (col) => `Lọc theo ${col}`,
  autoFitColumn: (col) => `Tự căn ${col}`,
  sortBy: "Sắp xếp theo",
  toggleCategory: (name, expanded) => expanded ? `Thu gọn ${name}` : `Mở rộng ${name}`,
  selectTime: "Chọn giờ",
  editTimeValue: "Sửa giờ",
  editSelectedTime: "Sửa giờ đã chọn",
  selectAmPm: "Chọn SA/CH",
  setCurrentTime: "Đặt giờ hiện tại",
  clearTime: "Xóa giờ",
  hourLabel: "Giờ",
  minuteLabel: "Phút",
  secondLabel: "Giây",
  openColorPicker: "Mở bảng màu",
  alphaLabel: "Độ mờ",
  selectMonthYear: "Chọn tháng và năm",
  minimumValue: "Giá trị tối thiểu",
  maximumValue: "Giá trị tối đa",
  showAllBreadcrumbs: "Hiện tất cả",
  breadcrumbNavigation: "Điều hướng",
  carouselPagination: "Phân trang carousel",
  resizeSheet: "Thay đổi kích thước bảng",
  resizeRowHeight: "Thay đổi chiều cao hàng",
  resizeResourceColumn: "Thay đổi chiều rộng cột",
  batteryLevel: "Mức pin",
  progressSteps: "Các bước",
  validTimeSelected: "Giờ hợp lệ đã chọn",
  noCategories: "Không có danh mục",
  selectCategoryPlaceholder: "Chọn danh mục...",
  monthNames: ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],
  weekdayNames: ["CN","T2","T3","T4","T5","T6","T7"],
};

export default async function RootLayout({ children, params }) {
  const locale = params.locale || "vi";
  const uvMessages = underverseMessages[locale] || underverseMessages.en;

  return (
    <NextIntlClientProvider locale={locale} messages={{ ...uvMessages, ...appMessages }}>
      <NextIntlAdapter i18n={i18n}>
        {children}
      </NextIntlAdapter>
    </NextIntlClientProvider>
  );
}
```

### Standalone React (Vite, CRA)

Truyền `i18n` vào `TranslationProvider`:

```tsx
import { TranslationProvider } from "@underverse-ui/underverse";
import type { GlobalI18nConfig } from "@underverse-ui/underverse";

const i18n: GlobalI18nConfig = {
  searchPlaceholder: "Tìm kiếm...",
  selectPlaceholder: "Chọn...",
  noResults: "Không có kết quả",
  clearAll: "Xóa tất cả",
  selectedCount: (n) => `Đã chọn ${n}`,
  moreCount: (n) => `+${n} khác`,
};

function App() {
  return (
    <TranslationProvider locale="vi" i18n={i18n}>
      <YourApp />
    </TranslationProvider>
  );
}
```

---

## Tất cả các key

### Inputs / Search

| Key | Default | Dùng trong |
|---|---|---|
| `searchPlaceholder` | `"Search..."` | Combobox, MultiCombobox, CategoryTreeSelect |
| `selectPlaceholder` | `"Select..."` | Combobox, MultiCombobox |
| `selectCategoryPlaceholder` | fallback → `selectPlaceholder` | CategoryTreeSelect trigger |

### Empty / Loading

| Key | Default | Dùng trong |
|---|---|---|
| `noResults` | `"No results found"` | Combobox, MultiCombobox |
| `noCategories` | `"No categories"` | CategoryTreeSelect |
| `loading` | `"Loading..."` | Combobox, MultiCombobox, GlobalLoading |

### Actions

| Key | Default | Dùng trong |
|---|---|---|
| `clearAll` | `"Clear all"` | MultiCombobox |
| `clearSearch` | `"Clear search"` | CategoryTreeSelect search |
| `clearSelection` | `"Clear selection"` | Combobox, CategoryTreeSelect |
| `tryDifferentSearch` | `"Try a different keyword"` | empty search state |

### Date / Time

| Key | Default | Dùng trong |
|---|---|---|
| `today` | `"Today"` | DatePicker |
| `clear` | `"Clear"` | DatePicker, TimePicker |
| `validTimeSelected` | `"Valid time selected"` | TimePicker (aria-live) |

### Count Labels (functions)

| Key | Default | Dùng trong |
|---|---|---|
| `selectedCount` | `(n) => \`${n} items selected\`` | MultiCombobox trigger |
| `selectedCountWithMax` | `(count, max) => \`${count}/${max} selected\`` | MultiCombobox trigger (khi có `maxSelected`) |
| `itemSelectedCount` | `(n) => \`${n} selected\`` | MultiCombobox dropdown header |
| `moreCount` | `(n) => \`+${n} more\`` | MultiCombobox overflow pill |

### Close / Dismiss

| Key | Default | Dùng trong |
|---|---|---|
| `closeModal` | `"Close modal"` | Modal |
| `closeToast` | `"Close toast"` | Toast |

### Input Field Actions

| Key | Default | Dùng trong |
|---|---|---|
| `clearInput` | `"Clear input"` | Input (clearable) |
| `showPassword` | `"Show password"` | Input (type=password) |
| `hidePassword` | `"Hide password"` | Input (type=password) |
| `increaseValue` | `"Increase value"` | NumberInput stepper |
| `decreaseValue` | `"Decrease value"` | NumberInput stepper |

### TimePicker

| Key | Default | Dùng trong |
|---|---|---|
| `selectTime` | `"Select time"` | TimePicker trigger |
| `editTimeValue` | `"Edit time value"` | TimePicker inline input |
| `editSelectedTime` | `"Edit selected time"` | TimePicker display |
| `selectAmPm` | `"Select AM or PM"` | TimePicker AM/PM toggle |
| `setCurrentTime` | `"Set current time"` | TimePicker "now" button |
| `clearTime` | `"Clear selected time"` | TimePicker clear button |
| `hourLabel` | `"Hour"` | TimePicker hour spinner header |
| `minuteLabel` | `"Min"` | TimePicker minute spinner header |
| `secondLabel` | `"Sec"` | TimePicker second spinner header |

### FileUpload

| Key | Default | Dùng trong |
|---|---|---|
| `download` | `"Download"` | FileUpload download button |
| `removeFile` | `"Remove"` | FileUpload remove button |
| `previewFile` | `"Preview"` | FileUpload preview button |
| `retryUpload` | `"Retry"` | FileUpload retry button (khi lỗi) |

### Tags / Badge

| Key | Default | Dùng trong |
|---|---|---|
| `removeTag` | `(tag) => \`Remove ${tag}\`` | TagInput × button |
| `removeBadge` | `"Remove badge"` | Badge (removable) |

### Carousel

| Key | Default | Dùng trong |
|---|---|---|
| `prevSlide` | `"Previous slide"` | Carousel ‹ button |
| `nextSlide` | `"Next slide"` | Carousel › button |
| `goToSlide` | `(n) => \`Go to slide ${n}\`` | Carousel dot button |
| `carouselThumbnail` | `(n) => \`Thumbnail ${n}\`` | Carousel thumbnail button |
| `carouselPagination` | `"Carousel pagination"` | Carousel dot nav (aria-label) |

### DataTable

| Key | Default | Dùng trong |
|---|---|---|
| `filterByColumn` | `(col) => \`Filter by ${col}\`` | DataTable filter icon |
| `autoFitColumn` | `(col) => \`Auto fit ${col}\`` | DataTable auto-fit handle |
| `sortBy` | `"Sort by"` | DataTable sort button prefix |

### CategoryTreeSelect

| Key | Default | Dùng trong |
|---|---|---|
| `toggleCategory` | `(name, expanded) => expanded ? \`Collapse ${name}\` : \`Expand ${name}\`` | Tree node expand/collapse button |

### ColorPicker

| Key | Default | Dùng trong |
|---|---|---|
| `openColorPicker` | `"Open color picker"` | ColorPicker trigger button |
| `alphaLabel` | `"Alpha"` | ColorPicker alpha slider label |

### Misc

| Key | Default | Dùng trong |
|---|---|---|
| `selectMonthYear` | `"Select month and year"` | MonthYearPicker trigger |
| `minimumValue` | `"Minimum value"` | Slider min thumb |
| `maximumValue` | `"Maximum value"` | Slider max thumb |
| `showAllBreadcrumbs` | `"Show all breadcrumb items"` | Breadcrumb collapse button |
| `breadcrumbNavigation` | `"Breadcrumb navigation"` | Breadcrumb `<nav>` landmark |
| `carouselPagination` | `"Carousel pagination"` | Carousel pagination nav |
| `resizeSheet` | `"Resize sheet"` | Sheet resize handle |
| `resizeRowHeight` | `"Resize row height"` | CalendarTimeline row resize |
| `resizeResourceColumn` | `"Resize resource column"` | CalendarTimeline column resize |
| `batteryLevel` | `"Battery level"` | BatteryProgress |
| `progressSteps` | `"Progress steps"` | StepProgress list |

### Calendar Names

| Key | Default |
|---|---|
| `monthNames` | `["January", "February", ...]` — 12 tháng từ tháng 1 |
| `weekdayNames` | `["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]` — 7 ngày từ CN |

---

## Hook `useGlobalI18n`

Dùng trong custom components hoặc extension của Underverse:

```tsx
import { useGlobalI18n } from "@underverse-ui/underverse";

function MyComponent() {
  const gi18n = useGlobalI18n();

  return (
    <button aria-label={gi18n.clearAll ?? "Clear all"}>
      ×
    </button>
  );
}
```

Hook trả về `{}` (object rỗng) khi không có provider, nên `??` fallback luôn an toàn.

---

## Ghi chú thiết kế

- **Không breaking change:** Tất cả key đều optional. Không truyền `i18n` → mọi thứ hoạt động như cũ với text tiếng Anh.
- **Component prop vẫn thắng:** `<Combobox searchPlaceholder="..." />` override `gi18n.searchPlaceholder`.
- **Flat, không namespace:** Khác với `TranslationProvider.translations` (namespace-based), `GlobalI18nConfig` là flat object → dễ dùng, dễ autocompletion.
- **Tree-shakeable:** Nếu không dùng `i18n` prop, `GlobalI18nContext` không làm tăng bundle size đáng kể vì context value là `null` (skip provider).
