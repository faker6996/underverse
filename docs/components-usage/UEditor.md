# UEditor

A powerful Notion-like rich text editor built with [TipTap](https://tiptap.dev/), featuring a beautiful modern UI, bubble menu, floating menu, and extensive formatting options.

## Usage

```tsx
import UEditor from "@/components/ui/UEditor";
import { useState } from "react";

export default function Example() {
  const [content, setContent] = useState("<p>Hello world!</p>");

  return <UEditor content={content} onChange={setContent} placeholder="Type '/' for commands..." variant="notion" showCharacterCount />;
}
```

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
| `placeholder`        | `string`                             | `"Type '/' for commands..."` | Placeholder text when empty.                  |
| `className`          | `string`                             | `undefined`                  | Additional CSS classes for the container.     |
| `editable`           | `boolean`                            | `true`                       | Whether the editor is editable.               |
| `autofocus`          | `boolean`                            | `false`                      | Auto focus editor on mount.                   |
| `showToolbar`        | `boolean`                            | `true`                       | Show the main toolbar.                        |
| `showBubbleMenu`     | `boolean`                            | `true`                       | Show bubble menu on text selection.           |
| `showFloatingMenu`   | `boolean`                            | `true`                       | Show floating menu on empty lines.            |
| `showCharacterCount` | `boolean`                            | `false`                      | Show character & word count footer.           |
| `maxCharacters`      | `number`                             | `undefined`                  | Maximum character limit.                      |
| `minHeight`          | `number`                             | `200`                        | Minimum height of editor area (px).           |
| `maxHeight`          | `number`                             | `undefined`                  | Maximum height with scroll (px).              |
| `variant`            | `"default" \| "minimal" \| "notion"` | `"notion"`                   | UI style variant.                             |

## Features

### Text Formatting

- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Strikethrough**
- **Inline Code**
- **Subscript** & **Superscript**
- **Text Color** (10 colors)
- **Highlight/Background Color** (10 colors)

### Block Elements

- **Headings** (H1, H2, H3)
- **Bullet Lists**
- **Numbered Lists**
- **Task Lists** with checkboxes
- **Blockquotes**
- **Code Blocks** with syntax highlighting (via lowlight)
- **Tables** (resizable with header rows)
- **Images**
- **Horizontal Divider**

### Links

- Add and edit links
- Link preview on hover

### Text Alignment

- Left
- Center
- Right
- Justify

### UX Features

- **Bubble Menu**: Appears on text selection with quick formatting options
- **Floating Menu**: Click + on empty lines to add blocks
- **Keyboard Shortcuts**: Standard shortcuts for all formatting
- **Undo/Redo**: Full history support
- **Character & Word Count**: Optional footer with counts
- **Typography Auto-formatting**: Smart quotes, dashes, etc.

## Keyboard Shortcuts

| Action    | Shortcut     |
| :-------- | :----------- |
| Bold      | `Ctrl+B`     |
| Italic    | `Ctrl+I`     |
| Underline | `Ctrl+U`     |
| Undo      | `Ctrl+Z`     |
| Redo      | `Ctrl+Y`     |
| Heading 1 | `Ctrl+Alt+1` |
| Heading 2 | `Ctrl+Alt+2` |
| Heading 3 | `Ctrl+Alt+3` |

## Styling

The editor is built with Tailwind CSS and supports:

- Dark mode via `prose-invert`
- Customizable via `className` prop
- Smooth animations and transitions
- Backdrop blur effects on menus
