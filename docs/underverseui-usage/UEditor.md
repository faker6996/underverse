# UEditor

A powerful Notion-like rich text editor built with [TipTap](https://tiptap.dev/), featuring a beautiful modern UI, bubble menu, floating menu, and extensive formatting options.

## Installation

The editor requires the following TipTap packages:

```bash
npm install @underverse-ui/underverse
```

## Usage

```tsx
import UEditor from "@/components/ui/UEditor";
import { useState } from "react";

export default function Example() {
  const [content, setContent] = useState("<p>Hello world!</p>");

  return <UEditor content={content} onChange={setContent} placeholder="Type '/' for commands..." variant="notion" showCharacterCount />;
}
```

## Images

- Paste (`Ctrl+V`), drag & drop, and toolbar file picker all insert images as base64 (`data:`) by default.
- If you want to upload immediately, set `imageInsertMode="upload"` and provide `uploadImage(file)` to return the final URL.

## Variants

### Notion Style (Default)

Full-featured editor with all formatting options:

```tsx
<UEditor content={content} onChange={setContent} variant="notion" showBubbleMenu showFloatingMenu />
```

### Minimal

Simple toolbar with essential formatting:

```tsx
<UEditor content={content} onChange={setContent} variant="minimal" />
```

### Read-only Mode

Display content without editing capabilities:

```tsx
<UEditor content={content} editable={false} showToolbar={false} />
```

## Props

| Prop                 | Type                                 | Default                      | Description                                   |
| :------------------- | :----------------------------------- | :--------------------------- | :-------------------------------------------- |
| `content`            | `string`                             | `""`                         | The initial HTML content of the editor.       |
| `onChange`           | `(content: string) => void`          | `undefined`                  | Callback function fired when content changes. |
| `onHtmlChange`       | `(html: string) => void`             | `undefined`                  | Alias for onChange.                           |
| `onJsonChange`       | `(json: object) => void`             | `undefined`                  | Callback with JSON structure of content.      |
| `uploadImage`        | `(file: File) => Promise<string> \| string` | `undefined`            | Image upload handler (used when `imageInsertMode="upload"`). Must return the image URL. |
| `imageInsertMode`    | `"base64" \| "upload"`               | `"base64"`                   | Insert images as base64 (default) or upload via `uploadImage`. |
| `placeholder`        | `string`                             | `"Type '/' for commands..."` | Placeholder text when empty.                  |
| `className`          | `string`                             | `undefined`                  | Additional CSS classes for the container.     |
| `editable`           | `boolean`                            | `true`                       | Whether the editor is editable.               |
| `autofocus`          | `boolean`                            | `false`                      | Auto focus editor on mount.                   |
| `showToolbar`        | `boolean`                            | `true`                       | Show the main toolbar.                        |
| `showBubbleMenu`     | `boolean`                            | `true`                       | Show bubble menu on text selection.           |
| `showFloatingMenu`   | `boolean`                            | `false`                      | Show floating menu on empty lines.            |
| `showCharacterCount` | `boolean`                            | `true`                       | Show character & word count footer.           |
| `maxCharacters`      | `number`                             | `undefined`                  | Maximum character limit.                      |
| `minHeight`          | `number \| string`                   | `"200px"`                    | Minimum height of editor area.                |
| `maxHeight`          | `number \| string`                   | `"auto"`                     | Maximum height with scroll.                   |
| `variant`            | `"default" \| "minimal" \| "notion"` | `"default"`                  | UI style variant.                             |

## Features

### Text Formatting

- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Strikethrough**
- **Inline Code**
- **Subscript** & **Superscript**
- **Text Color** (using CSS variables: primary, secondary, success, warning, destructive, info, muted, accent)
- **Highlight/Background Color** (using CSS variables)

### Block Elements

- **Headings** (H1, H2, H3)
- **Bullet Lists**
- **Numbered Lists**
- **Task Lists** with checkboxes
- **Blockquotes**
- **Code Blocks** with syntax highlighting (via lowlight)
- **Tables** (with row/column operations, header support)
- **Images** (paste/drop/upload; base64 by default)
- **Horizontal Divider**

### Table Features

- Add/remove rows and columns
- Toggle header row/column
- Delete table
- Merge/split cells (coming soon)

### Links

- Add and edit links
- Link preview on hover
- Open in new tab option

### Text Alignment

- Left
- Center
- Right
- Justify

### UX Features

- **Bubble Menu**: Appears on text selection with quick formatting options
- **Floating Menu**: Click + on empty lines to add blocks (disabled by default)
- **Slash Commands**: Type `/` to open command palette with keyboard navigation
  - Filter by typing (e.g., `/heading`)
  - Navigate with `↑` `↓` arrow keys
  - Select with `Enter`
  - Cancel with `Escape`
- **Tooltip Integration**: Uses `Tooltip` component for toolbar button hints
- **Keyboard Shortcuts**: Standard shortcuts for all formatting
- **Undo/Redo**: Full history support
- **Character & Word Count**: Optional footer with counts
- **Typography Auto-formatting**: Smart quotes, dashes, etc.
- **Responsive Toolbar**: Collapses and groups on smaller screens

## Component Integration

UEditor reuses existing UI components from the library:

| Component          | Usage                             |
| ------------------ | --------------------------------- |
| `DropdownMenu`     | Toolbar dropdown menus            |
| `DropdownMenuItem` | Menu items with icons, shortcuts  |
| `Tooltip`          | Toolbar button tooltips           |
| `Popover`          | Available for future enhancements |

## Color System

The editor uses CSS variables for colors, supporting light/dark modes:

| Color Name  | CSS Variable    | Usage                |
| :---------- | :-------------- | :------------------- |
| Primary     | `--primary`     | Links, active states |
| Secondary   | `--secondary`   | Alternate accent     |
| Success     | `--success`     | Positive states      |
| Warning     | `--warning`     | Caution states       |
| Destructive | `--destructive` | Error states         |
| Info        | `--info`        | Informational        |
| Muted       | `--muted`       | Disabled/subtle text |
| Accent      | `--accent`      | Highlights           |

## Keyboard Shortcuts

| Action        | Shortcut       |
| :------------ | :------------- |
| Bold          | `Ctrl+B`       |
| Italic        | `Ctrl+I`       |
| Underline     | `Ctrl+U`       |
| Strikethrough | `Ctrl+Shift+S` |
| Code          | `Ctrl+E`       |
| Undo          | `Ctrl+Z`       |
| Redo          | `Ctrl+Y`       |
| Heading 1     | `Ctrl+Alt+1`   |
| Heading 2     | `Ctrl+Alt+2`   |
| Heading 3     | `Ctrl+Alt+3`   |
| Bullet List   | `Ctrl+Shift+8` |
| Ordered List  | `Ctrl+Shift+7` |
| Task List     | `Ctrl+Shift+9` |
| Blockquote    | `Ctrl+Shift+B` |
| Code Block    | `Ctrl+Alt+C`   |

## Styling

The editor is built with Tailwind CSS and supports:

- Dark mode via CSS variables (automatic)
- Customizable via `className` prop
- Smooth animations and transitions
- Backdrop blur effects on menus
- Focus ring states for accessibility
- Selected image outline when clicking an image

## Accessibility

| Feature                   | Status |
| ------------------------- | ------ |
| Keyboard navigation       | ✅     |
| Screen reader support     | ✅     |
| Focus visible indicators  | ✅     |
| ARIA labels on buttons    | ✅     |
| Color contrast compliance | ✅     |
