# EmojiPicker

A standalone Messenger-style emoji picker component with 740+ emojis, search functionality, and auto-highlighting category navigation.

## Features

- 🎨 **Messenger-Style Design** - All categories in a single scrollable list
- 🔍 **Real-time Search** - Search emojis by name
- 📱 **Responsive Grid** - Customizable column layout
- 🎯 **Auto-Highlighting** - Category icons highlight based on scroll position
- ⚡ **Smooth Scrolling** - Click category icon to scroll to section
- 🌍 **740+ Emojis** - Organized in 7 categories
- ⌨️ **Keyboard Accessible** - Full keyboard navigation support

## Installation

```bash
npm install @underverse-ui/underverse
```

## Usage

### Basic Example

```tsx
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { useState } from "react";

export default function Example() {
  const [selectedEmoji, setSelectedEmoji] = useState("");

  return (
    <div>
      <EmojiPicker onEmojiSelect={(emoji) => setSelectedEmoji(emoji)} />
      {selectedEmoji && <p>Selected: {selectedEmoji}</p>}
    </div>
  );
}
```

### With Custom Props

```tsx
<EmojiPicker
  onEmojiSelect={(emoji) => console.log(emoji)}
  searchPlaceholder="Find your emoji..."
  columns={8}
  maxHeight="25rem"
  className="w-full max-w-md"
/>
```

### Without Search

```tsx
<EmojiPicker
  onEmojiSelect={(emoji) => insertEmoji(emoji)}
  showSearch={false}
  showCategoryNav={true}
/>
```

### Compact Version

```tsx
<EmojiPicker
  onEmojiSelect={(emoji) => handleSelect(emoji)}
  columns={7}
  maxHeight="15rem"
  className="w-80"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onEmojiSelect` | `(emoji: string) => void` | **Required** | Callback when emoji is selected |
| `className` | `string` | `undefined` | Additional CSS classes for container |
| `searchPlaceholder` | `string` | `"Search emojis..."` | Placeholder text for search input |
| `showSearch` | `boolean` | `true` | Show/hide search bar |
| `showCategoryNav` | `boolean` | `true` | Show/hide bottom category navigation |
| `columns` | `number` | `9` | Number of emoji columns in grid |
| `maxHeight` | `string` | `"20rem"` | Maximum height of scroll area |

## Emoji Categories

The picker includes 7 categories with 740+ emojis:

| Category | Icon | Count | Examples |
|----------|------|-------|----------|
| Smileys & People | 😊 | 286 | 😀 😃 😄 😁 😊 |
| Animals & Nature | 🌿 | 45 | 🐶 🐱 🐭 🐹 🌸 |
| Food & Drink | 🍴 | 60 | 🍎 🍕 🍔 🍟 ☕ |
| Activity | 💪 | 30 | ⚽ 🏀 🏈 ⚾ 🎾 |
| Objects | 💡 | 27 | 💡 📱 💻 ⌚ 🎧 |
| Symbols | # | 40 | ❤️ 💙 💚 💛 ⭐ |
| Flags | 🚩 | 252 | 🇻🇳 🇺🇸 🇬🇧 🇯🇵 🇰🇷 |

## How It Works

### Scroll-Based Category Detection

The picker automatically detects which category is most visible and highlights the corresponding icon:

```tsx
// Calculates visible height of each category
const visibleHeight = Math.max(0, visibleBottom - visibleTop);

// Highlights category with maximum visibility
if (visibleHeight > maxVisibility) {
  setActiveCategory(category.id);
}
```

### Click-to-Scroll

Click any category icon to smoothly scroll to that section:

```tsx
element.scrollIntoView({ behavior: "smooth", block: "start" });
```

### Search Functionality

Real-time search filters emojis by name:

```tsx
emojis.filter(emoji => 
  emoji.name.toLowerCase().includes(query) ||
  emoji.emoji.includes(search)
)
```

## Use Cases

### Chat Application

```tsx
function ChatInput() {
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={() => setShowPicker(!showPicker)}>😊</button>
      
      {showPicker && (
        <EmojiPicker
          onEmojiSelect={(emoji) => {
            setMessage(message + emoji);
            setShowPicker(false);
          }}
        />
      )}
    </div>
  );
}
```

### Comment System

```tsx
function CommentBox() {
  const [comment, setComment] = useState("");

  return (
    <div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      
      <Popover>
        <PopoverTrigger>
          <button>Add Emoji</button>
        </PopoverTrigger>
        <PopoverContent>
          <EmojiPicker
            onEmojiSelect={(emoji) => setComment(comment + emoji)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### Form Input

```tsx
function ProfileForm() {
  const [status, setStatus] = useState("");

  return (
    <div>
      <label>Status Message</label>
      <div className="flex gap-2">
        <input
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger>😊</DropdownMenuTrigger>
          <DropdownMenuContent>
            <EmojiPicker
              onEmojiSelect={(emoji) => setStatus(status + emoji)}
              columns={8}
              maxHeight="18rem"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS and supports:

- **Dark Mode** - Automatic via CSS variables
- **Custom Width** - Via `className` prop
- **Custom Height** - Via `maxHeight` prop
- **Custom Columns** - Via `columns` prop
- **Responsive** - Works on all screen sizes

### Custom Styling Example

```tsx
<EmojiPicker
  onEmojiSelect={handleSelect}
  className="w-full max-w-lg shadow-2xl"
  maxHeight="30rem"
  columns={10}
/>
```

## Accessibility

| Feature | Status |
|---------|--------|
| Keyboard navigation | ✅ |
| Focus indicators | ✅ |
| ARIA labels | ✅ |
| Screen reader support | ✅ |
| Hover tooltips | ✅ |

## Performance

- **Optimized Rendering** - Uses `useMemo` for search filtering
- **Ref-based Tracking** - Avoids unnecessary re-renders
- **Smooth Scrolling** - RAF-based scroll detection
- **Lazy Loading** - Only visible emojis rendered

## Browser Support

Works in all modern browsers with emoji support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Emojis are rendered using native system fonts
- Appearance may vary across different operating systems
- Search is case-insensitive and matches emoji names
- Category icons use Lucide React icons

## Related Components

- [`UEditor`](./UEditor.md) - Rich text editor with built-in emoji support
- [`Popover`](./Popover.md) - For displaying picker in a popover
- [`DropdownMenu`](./DropdownMenu.md) - For displaying picker in a dropdown

## Examples

### Integration with Popover

```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { EmojiPicker } from "@/components/ui/EmojiPicker";

<Popover>
  <PopoverTrigger>
    <button>😊 Add Emoji</button>
  </PopoverTrigger>
  <PopoverContent>
    <EmojiPicker onEmojiSelect={(emoji) => console.log(emoji)} />
  </PopoverContent>
</Popover>
```

### Integration with DropdownMenu

```tsx
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { EmojiPicker } from "@/components/ui/EmojiPicker";

<DropdownMenu
  trigger={<button>😊</button>}
>
  <EmojiPicker onEmojiSelect={(emoji) => handleEmoji(emoji)} />
</DropdownMenu>
```

### Controlled Visibility

```tsx
function ControlledPicker() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Picker
      </button>
      
      {isOpen && (
        <div className="relative">
          <EmojiPicker
            onEmojiSelect={(emoji) => {
              console.log(emoji);
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
}
```

## Summary

The `EmojiPicker` component provides a beautiful, performant, and accessible way to add emoji selection to any application. With its Messenger-style design, auto-highlighting navigation, and extensive customization options, it's perfect for chat apps, comment systems, forms, and more.
