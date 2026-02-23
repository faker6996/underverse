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
import { useRef, useState } from "react";
import type { UEditorRef } from "@/components/ui/UEditor";

export default function Example() {
  const editorRef = useRef<UEditorRef>(null);
  const [content, setContent] = useState("<p>Hello world!</p>");

  const handleSave = async () => {
    const prepared = await editorRef.current?.prepareContentForSave({ throwOnError: true });
    await api.savePost({ content: prepared?.html ?? "" });
  };

  return (
    <>
      <UEditor
        ref={editorRef}
        content={content}
        onChange={setContent}
        uploadImageForSave={async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          return data.url;
        }}
        placeholder="Type '/' for commands..."
        variant="notion"
        showCharacterCount
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

## Images

- Paste (`Ctrl+V`), drag & drop, and toolbar file picker all insert images as base64 (`data:`) by default.
- If you want to upload immediately, set `imageInsertMode="upload"` and provide `uploadImage(file)` to return the final URL.
- For teams that prefer base64 while editing but URL-only in DB, keep `imageInsertMode="base64"` and call `prepareContentForSave()` before saving.

## Base64 During Edit, Upload Before Save (Opt-in)

Default behavior is unchanged: existing screens still work with base64 image preview while editing.

To transform only on save:

1. Pass `uploadImageForSave`.
2. Hold a `ref`.
3. Call `prepareContentForSave()` before sending content to backend.

`prepareContentForSave()` will:

- Scan HTML for `<img src="data:image/...;base64,...">`.
- Upload each base64 image through `uploadImageForSave`.
- Replace only the `src` value with returned URL.
- Keep other image attributes (`alt`, `width`, `height`, `style`, etc.) unchanged.
- Leave non-base64 images unchanged (`http(s)://`, `/path`, relative URLs).
- Return `{ html, uploaded, inlineImageUrls, inlineUploaded, errors }` so app can block save or continue.

### Avoid Duplicate Inline Image vs Attachment

If your app also stores attachments (gallery/files), use `inlineImageUrls` to filter out URLs that already exist inline:

```tsx
import { normalizeImageUrl } from "@/components/ui/UEditor";

const prepared = await editorRef.current?.prepareContentForSave({ throwOnError: true });
const inlineSet = new Set((prepared?.inlineImageUrls ?? []).map(normalizeImageUrl));

const dedupedAttachments = attachments.filter((item) => !inlineSet.has(normalizeImageUrl(item.url)));

await api.savePost({
  content: prepared?.html ?? "",
  attachments: dedupedAttachments,
});
```

If you want hard failure, use:

```tsx
await editorRef.current?.prepareContentForSave({ throwOnError: true });
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
| `uploadImage`        | `(file: File) => Promise<string> \| string` | `undefined`            | Image upload handler (used when `imageInsertMode="upload"`). Must return the image URL. |
| `uploadImageForSave` | `(file: File) => Promise<string \| { url: string; [k: string]: any }>` | `undefined` | Optional upload handler used by `prepareContentForSave()` to transform base64 images before save. |
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

## Ref API

`UEditor` exposes an imperative ref API:

```ts
type UEditorRef = {
  prepareContentForSave: (options?: { throwOnError?: boolean }) => Promise<{
    html: string;
    uploaded: Array<{ url: string; file?: File; meta?: Record<string, unknown> }>;
    inlineImageUrls: string[];
    inlineUploaded: Array<{ index: number; url: string; file?: File; meta?: Record<string, unknown> }>;
    errors: Array<{ index: number; reason: string }>;
  }>;
};
```

Notes:

- `uploaded` contains successful uploads in processing order.
- `inlineImageUrls` contains all `<img src>` values from final HTML after transform.
- `inlineUploaded` contains successful transformed inline uploads with source `index` (base64 image order).
- `errors` contains per-image failures with index in base64 image order.
- If `throwOnError` is `true`, method throws `UEditorPrepareContentForSaveError` with `error.result`.

Helper exports for URL matching:

- `extractImageSrcsFromHtml(html): string[]`
- `normalizeImageUrl(url): string`

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
- **Emojis** (Messenger-style picker + colon autocomplete)

### Emoji Features

UEditor includes a comprehensive emoji system with 740+ emojis:

**Insertion Methods:**
1. **Toolbar Button** - Click the 😊 emoji button to open a Messenger-style picker
2. **Colon Autocomplete** - Type `:` followed by emoji name (e.g., `:smile`, `:heart`)
3. **Search** - Search emojis by name in the picker

**Messenger-Style Picker:**
- All emoji categories in a single scrollable list
- Bottom navigation bar with category icons
- Auto-highlighting of active category based on scroll position
- Smooth scroll-to-category on icon click
- Real-time search functionality
- 9-column responsive grid layout

**Categories:**
- 😊 Smileys & People (286 emojis)
- 🌿 Animals & Nature (45 emojis)
- 🍴 Food & Drink (60 emojis)
- 💪 Activity (30 emojis)
- 💡 Objects (27 emojis)
- # Symbols (40 emojis)
- 🚩 Flags (252 emojis)

**Usage Examples:**
```tsx
// Toolbar button - opens Messenger-style picker
// Click emoji button → Browse/search → Click emoji to insert

// Colon autocomplete
// Type: :smile
// Shows: 😀 😃 😄 😁 😊 😇 🙂 ...
// Press Enter to insert

// Search in picker
// Type "happy" → Shows all happy-related emojis
```


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
- **Emoji Autocomplete**: Type `:` to trigger emoji suggestions
  - Search by emoji name (e.g., `:smile`, `:heart`, `:fire`)
  - Grid display with keyboard navigation
  - 8-column layout, max 64 emojis
  - Navigate with arrow keys, select with `Enter`
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
