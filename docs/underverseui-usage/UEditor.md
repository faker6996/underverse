# UEditor

A powerful Notion-like rich text editor built with [TipTap](https://tiptap.dev/), featuring a modern UI, bubble menu, and extensive formatting options.

## Installation

The editor requires the following TipTap packages:

```bash
npm install @underverse-ui/underverse
```

## Usage

```tsx
import UEditor, { type UEditorRef } from "@underverse-ui/underverse/ueditor";
import { useRef, useState } from "react";

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
        outputDebounceMs={120}
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

### Output performance

`onChange`, `onHtmlChange`, and `onJsonChange` serialize the complete document. For large controlled documents, use `outputDebounceMs` to coalesce rapid transactions into one output update:

```tsx
<UEditor
  content={content}
  onHtmlChange={setContent}
  outputDebounceMs={120}
/>
```

- `0` keeps the backward-compatible immediate callback behavior.
- `100-200ms` is recommended for large documents.
- Pending output is flushed when the editor loses focus.
- `prepareContentForSave()` always reads the latest editor document directly and does not wait for the debounce timer.

## Images

- Paste (`Ctrl+V`), drag & drop, and toolbar file picker all insert images as base64 (`data:`) by default.
- If you want to upload immediately, set `imageInsertMode="upload"` and provide `uploadImage(file)` to return the final URL.
- For teams that prefer base64 while editing but URL-only in DB, keep `imageInsertMode="base64"` and call `prepareContentForSave()` before saving.
- Paste, drop, and toolbar file insertion share the same validation options: `maxImageFileSize`, `allowedImageMimeTypes`, and `fallbackToDataUrl`.
- Image URLs inserted from controls are sanitized; accepted image URLs are `http(s)`, relative paths, anchors, and safe image `data:` URLs.
- Select an image, then use the image menu to switch between block, image-left/text-right, or image-right/text-left layout.
- When an image is selected, the bubble menu also shows quick layout controls plus `S / M / L` width presets.
- Width presets are context-aware: wrapped images use smaller presets than block images.
- Wrapped images preserve aspect ratio by default while dragging the resize handle. Hold `Ctrl` if you need to break the ratio manually.
- Wrapped image layout is preserved in saved HTML using `data-image-layout="left" | "right"`.

## Typography

- Toolbar includes separate font family, font size, line-height, and letter-spacing dropdowns.
- Bubble menu includes quick font-size and line-height controls for fast inline changes.
- All four settings are stored through `textStyle`, so existing HTML save/load remains compatible.
- Built-in defaults:
  - font families: `Inter`, `System UI`, `Georgia`, `Palatino`, `Times`, `JetBrains Mono`
  - font sizes: `12px`, `14px`, `16px`, `18px`, `24px`, `32px`
  - line heights: `1.2`, `1.5`, `1.75`, `2`
  - letter spacings: `-0.02em`, `0`, `0.02em`, `0.05em`, `0.08em`
- Font size dropdown also supports direct numeric input in `px`.
- You can override the toolbar options with `fontFamilies`, `fontSizes`, `lineHeights`, and `letterSpacings`.

```tsx
<UEditor
  content={content}
  onChange={setContent}
  fontFamilies={[
    { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
    { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
    { label: "JetBrains Mono", value: "'JetBrains Mono', 'Fira Code', monospace" },
  ]}
  fontSizes={[
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "24", value: "24px" },
  ]}
  lineHeights={[
    { label: "1.2", value: "1.2" },
    { label: "1.5", value: "1.5" },
    { label: "1.75", value: "1.75" },
  ]}
  letterSpacings={[
    { label: "-0.02em", value: "-0.02em" },
    { label: "0", value: "0" },
    { label: "0.05em", value: "0.05em" },
  ]}
/>
```

## Tables

- Contextual table controls appear when selection or hover is inside a table.
- The toolbar Table action is creation-only: its menu contains only the grid picker for choosing the new table size.
- Use the bottom rail and right rail to add rows and columns in a Notion-like way.
- Drag row and column handles to reorder the table without leaving the editor surface.
- Reorder drag shows a live target highlight and status badge while you move.
- Drag the bottom rail or right rail to preview and add multiple rows or columns at once.
- The table context menu supports add/remove row or column plus header row/column toggles.
- Text selection inside a cell opens only the text-formatting bubble menu.
- Double-clicking rendered text selects all text in that cell and opens the text bubble menu.
- Double-clicking empty cell space or padding selects the whole cell and opens the cell inspector; formula cells keep their Formula Bar behavior.
- Clicking an empty cell once places the caret for typing. Double-click it to select the whole cell and open the cell inspector.
- Select one or more whole cells, or choose **Cell Formatting** from the table context menu, to open the dedicated cell inspector.
- The cell inspector supports background and border styling, formulas, merging/splitting, vertical alignment, and text direction.
- Toolbar and contextual table menus support aligning the whole table left, center, or right.
- Columns use TipTap's native resize handles on the right edge of cells.
- Rows support resize on the bottom edge. Hover near the row boundary to reveal the stronger guide line, then drag vertically.
- A single whole-table resize handle sits outside the bottom-right corner. Drag it freely to change width and height independently.
- Hold `Ctrl` to lock the resize to the dominant horizontal or vertical direction. Hold `Ctrl+Shift` to preserve the current proportions.
- Whole-table resizing scales every column and row proportionally and does not replace the existing single-column or single-row resize behavior.
- Row height is preserved in saved HTML using `data-row-height="..."` and inline `height: ...px`.
- The implementation plan for Notion-like table UX lives in [`UEditor-Notion-Table-Plan.md`](./UEditor-Notion-Table-Plan.md).

## Base64 During Edit, Upload Before Save (Opt-in)

Default behavior is unchanged: existing screens still work with base64 image preview while editing.

To transform only on save:

1. Pass `uploadImageForSave`.
2. Hold a `ref`.
3. Call `prepareContentForSave()` before sending content to backend.

`prepareContentForSave()` will:

- Scan HTML for `<img src="data:image/...;base64,...">`.
- Upload each base64 image through `uploadImageForSave` with a configurable concurrency limit.
- Replace only the `src` value with returned URL.
- Keep other image attributes (`alt`, `width`, `height`, `style`, etc.) unchanged.
- Leave non-base64 images unchanged (`http(s)://`, `/path`, relative URLs).
- Return `{ html, uploaded, inlineImageUrls, inlineUploaded, errors }` so app can block save or continue.

### Avoid Duplicate Inline Image vs Attachment

If your app also stores attachments (gallery/files), use `inlineImageUrls` to filter out URLs that already exist inline:

```tsx
import { normalizeImageUrl } from "@underverse-ui/underverse/ueditor";

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

UEditor supports multiple toolbar and layout variants to match different editing requirements:

### Full / Default / Notion Style (`default` | `full` | `notion`)

The default rich-featured editor variant offering complete formatting controls, including:
- Font Family, Font Size, Line Height, Letter Spacing
- Subscript, Superscript, Code Block
- Increase/Decrease Indent for paragraphs, blockquotes, and nested lists
- Tables (with advanced column/row resizing and alignments)
- Image and Link insertion, emojis, text alignment.

```tsx
<UEditor content={content} onChange={setContent} variant="default" showBubbleMenu />
```

### Medium Full (`medium-full`)

A balanced variant for blog posts and article creation. Excludes advanced spacing options:
- Font Size (no Font Family selector)
- Bold, Italic, Underline, Strike, Inline Code
- Text/Highlight Colors, Alignment (Left, Center, Right, Justify)
- Increase/Decrease Indent
- Link, Emoji, Blockquote
- Tables & Images

```tsx
<UEditor content={content} onChange={setContent} variant="medium-full" />
```

### Medium (`medium`)

A lightweight variant suitable for emails or basic descriptions:
- Paragraph / Headings (H1-H3) dropdown
- Bold, Italic, Underline, Strike
- Text/Highlight Colors
- Bullet, Ordered, and Task lists
- Increase/Decrease Indent
- Link

```tsx
<UEditor content={content} onChange={setContent} variant="medium" />
```

### Minimal (`minimal`)

A highly compact variant suitable for comment boxes or quick notes:
- Undo, Redo
- Bold, Italic
- Bullet list
- Increase/Decrease Indent
- Link

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
| `outputDebounceMs`   | `number`                              | `0`                          | Debounce HTML/JSON callbacks; use `100-200ms` for large controlled documents. |
| `uploadImage`        | `(file: File) => Promise<string> \| string` | `undefined`            | Image upload handler (used when `imageInsertMode="upload"`). Must return the image URL. |
| `uploadImageForSave` | `(file: File) => Promise<string \| { url: string; [k: string]: any }>` | `undefined` | Optional upload handler used by `prepareContentForSave()` to transform base64 images before save. |
| `uploadImageConcurrency` | `number` | `3` | Maximum number of base64 inline images uploaded at once during `prepareContentForSave()`. |
| `imageInsertMode`    | `"base64" \| "upload"`               | `"base64"`                   | Insert images as base64 (default) or upload via `uploadImage`. |
| `maxImageFileSize`   | `number`                             | `10485760`                   | Maximum image file size for paste, drop, and toolbar file insertion. |
| `allowedImageMimeTypes` | `string[]`                         | common web image MIME types  | Allowed image MIME types for paste, drop, and toolbar file insertion. |
| `fallbackToDataUrl`  | `boolean`                            | `true`                       | For paste/drop upload mode, fall back to base64 if `uploadImage` fails. |
| `placeholder`        | `string`                             | `"Type '/' for commands..."` | Placeholder text when empty.                  |
| `className`          | `string`                             | `undefined`                  | Additional CSS classes for the container.     |
| `editable`           | `boolean`                            | `true`                       | Whether the editor is editable.               |
| `autofocus`          | `boolean`                            | `false`                      | Auto focus editor on mount.                   |
| `showToolbar`        | `boolean`                            | `true`                       | Show the main toolbar.                        |
| `showBubbleMenu`     | `boolean`                            | `true`                       | Show bubble menu on text selection.           |
| `showFloatingMenu`   | `boolean`                            | `false`                      | Show the empty-line floating block menu.      |
| `showCharacterCount` | `boolean`                            | `true`                       | Show character & word count footer.           |
| `showFooter`         | `boolean`                            | `true`                       | Show the editor footer.                       |
| `maxCharacters`      | `number`                             | `undefined`                  | Maximum character limit.                      |
| `minHeight`          | `number \| string`                   | `"200px"`                    | Minimum height of editor area.                |
| `maxHeight`          | `number \| string`                   | `"auto"`                     | Maximum height with scroll.                   |
| `variant`            | `"default" \| "minimal" \| "medium" \| "medium-full" \| "full" \| "notion"` | `"default"` | UI style variant. |
| `rounded`            | `boolean`                            | `true`                       | Whether the editor has rounded corners.       |
| `fontFamilies`       | `{ label: string; value: string }[]` | built-in presets             | Override font family options shown in the toolbar. |
| `fontSizes`          | `{ label: string; value: string }[]` | built-in presets             | Override font size options shown in the toolbar. |
| `lineHeights`        | `{ label: string; value: string }[]` | built-in presets             | Override line-height options shown in the toolbar. |
| `letterSpacings`     | `{ label: string; value: string }[]` | built-in presets             | Override letter-spacing options shown in the toolbar. |
| `showMenuBar`        | `boolean`                            | `false`                      | Show the top menu bar (File, Edit, Insert, etc.). |
| `onSave`             | `() => void`                         | `undefined`                  | Callback triggered when File > Save or Ctrl+S/Cmd+S is pressed. |
| `onExport`           | `() => void`                         | `undefined`                  | Callback triggered when File > Export is clicked. |
| `onSourceCode`       | `() => void`                         | `undefined`                  | Callback triggered when View > Source Code is clicked. |
| `onPreview`          | `(html: string) => void \| false`    | `undefined`                  | Fires when View > Preview or the eye button is clicked. Return false to prevent default dialog. |
| `fetchMetadata`      | `(url: string) => Promise<{ title?: string; description?: string; image?: string; publisher?: string }>` | `undefined` | Async fetcher to retrieve bookmark card metadata for links. |
| `uploadFile`         | `(file: File) => Promise<string> \| string` | `undefined`           | Uploads files immediately for File Cards. |
| `uploadFileForSave`  | `(file: File) => Promise<string \| ({ url: string } & Record<string, unknown>)>` | `undefined` | Async upload for File Cards during `prepareContentForSave()`. |
| `extraExtensions`    | `Extension[]`                        | `[]`                         | Additional Tiptap extensions to register. |

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

## Security Notes

- Link URLs inserted through the link input are sanitized and limited to `http`, `https`, `mailto`, `tel`, anchors, and relative URLs.
- Image URLs inserted through controls are sanitized and limited to `http`, `https`, relative URLs, and safe image `data:` URLs.
- If you render saved HTML outside `UEditor`, still sanitize on the server or at render time for your application threat model.

## Features

### Text Formatting

- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Strikethrough**
- **Inline Code**
- **Font Family Presets**
- **Font Size Presets**
- **Line-height Presets**
- **Letter-spacing Presets**
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
- **Tables** (with row/column operations, header support, column resize, row resize)
- **Images** (paste/drop/upload; base64 by default)
- **Wrapped Images** (image left/right with text flowing beside it)
- **Horizontal Divider**
- **Emojis** (Messenger-style picker + colon autocomplete)
- **Form Fields** (Checkbox and Radio Button, insertable from the Menu Bar "Insert" > "Form Fields")

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
- Open **Cell Formatting** from the table context menu, or select whole cells, to show the cell inspector
- Merge selected cells and split merged cells from the cell inspector
- Cell vertical alignment (Top, Middle, Bottom align) from the cell inspector

### Form Fields (Checkbox / Radio Button)

UEditor supports inserting interactive Form Fields into the document, useful for surveys, templates, and interactive forms:
- **Checkbox**: A standard boolean toggle element.
- **Radio Button**: A single-selection group element.

These can be inserted via the Menu Bar: **Insert > Form Fields > Checkbox / Radio Button**.

### Links

- Add and edit links
- Link preview on hover
- Open in new tab option

### Text Alignment

- Left
- Center
- Right
- Justify

### Indentation

- Use the **Increase Indent** and **Decrease Indent** toolbar buttons in every editable toolbar variant.
- At the start of a paragraph or blockquote, press `Tab` to increase its indentation and `Shift+Tab` to decrease it.
- When the caret is inside text, `Tab` inserts spacing at that exact position instead of moving the entire block. `Shift+Tab` removes the tab immediately before the caret when present.
- Paragraphs and blockquotes are saved with a bounded `data-indent` value and matching `margin-left` style.
- Bullet and numbered lists use semantic nested `<ul>`/`<ol>` structures instead of visual margins.
- Inside tables, `Tab` and `Shift+Tab` keep their existing behavior of moving between cells.
- While a table formula suggestion is open, `Tab` continues to accept the suggestion.

### UX Features

- **Menu Bar**: Top-level menus and nested submenus open on hover or click, switch as the pointer moves, and close when the pointer leaves or the user clicks outside
- **Bubble Menu**: Appears on text selection with quick formatting options; table-cell formatting uses a separate inspector
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
