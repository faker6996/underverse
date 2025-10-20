# Underverse UI

**Author:** Tran Van Bach

A comprehensive UI component library for React/Next.js applications, extracted from the main project. Built with Tailwind CSS, `clsx`, and `tailwind-merge`. Some components support `next-intl` (optional).

## Requirements
- Node >= 18
- Peer dependencies: `react`, `react-dom`, `next`, `next-intl`

## Installation
```bash
# Install the package
npm i @underverse-ui/underverse

# Install peer dependencies (if not already in your app)
npm i react react-dom next next-intl
```

## Tailwind CSS Configuration
Components use color variables like `primary`, `secondary`, `destructive`, etc. Make sure your Tailwind theme/tokens include these variables.

## Quick Start

```tsx
import { Button, ToastProvider, useToast } from "@underverse-ui/underverse";

function App() {
  const { addToast } = useToast();
  return (
    <ToastProvider>
      <Button onClick={() => addToast({ type: 'success', message: 'Hello' })}>
        Click me
      </Button>
    </ToastProvider>
  );
}
```

## Exported Components

### Core Components
- **Buttons:** `Button`
- **Display:** `Badge`, `Card`, `Avatar`, `Skeleton`, `Progress`
- **Form Inputs:** `Input`, `Textarea`, `Checkbox`, `Switch`, `Label`

### Feedback & Overlays
- `Modal`, `ToastProvider`, `useToast`, `Tooltip`, `Popover`, `Sheet` (includes `Drawer`, `SlideOver`, `BottomSheet`, `SidebarSheet`), `Alert`, `GlobalLoading` (includes `PageLoading`, `InlineLoading`, `ButtonLoading`)

### Form Controls & Pickers
- `RadioGroup`, `Slider`, `DatePicker`, `Combobox`, `MultiCombobox`, `CategoryTreeSelect`

### Navigation & Structure
- `Breadcrumb`, `Tabs` (includes `SimpleTabs`, `PillTabs`, `VerticalTabs`), `DropdownMenu`, `Pagination`, `Section`, `ScrollArea`

### Data Display
- `Table`, `DataTable`

### Media Components
- `SmartImage`, `ImageUpload`, `Carousel`

### Utilities
- `ClientOnly`, `Loading`, `NotificationModal`, `FloatingContacts`, `AccessDenied`
- Utility functions: `cn`, `DateUtils`, style constants

## Important Notes
- Some components (like `DatePicker`) depend on `next-intl`. If your app doesn't use `next-intl`, either import only components without this dependency or install `next-intl` as a peer dependency.
- `NotificationBell` is **not exported** to keep the package neutral (it depends on project-specific API/socket implementations).

## License

MIT

## Author

Tran Van Bach
