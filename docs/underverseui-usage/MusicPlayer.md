# MusicPlayer

Source: `components/ui/MusicPlayer.tsx`

Exports:

- MusicPlayer
- Song (interface)

Music player component với playlist, controls và volume management.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                        | Status |
| ------------------------------ | ------ |
| HTML5 audio element            | ✅     |
| Keyboard controls              | ✅     |
| ARIA labels cho controls       | ✅     |
| System color scheme compliance | ✅     |
| Responsive design              | ✅     |

## MusicPlayer

Props type: `MusicPlayerProps`

```tsx
import MusicPlayer from "@/components/ui/MusicPlayer";

export function Example() {
  return <MusicPlayer />;
}
```

### Ví dụ với playlist tùy chỉnh:

```tsx
import MusicPlayer, { Song } from "@/components/ui/MusicPlayer";

const myPlaylist: Song[] = [
  {
    id: 1,
    title: "Bài hát của tôi",
    artist: "Ca sĩ",
    duration: "3:30",
    audioUrl: "/music/my-song.mp3",
  },
  {
    id: 2,
    title: "Bài khác",
    artist: "Ca sĩ khác",
    duration: "4:15",
    audioUrl: "/music/another-song.mp3",
  },
];

export function CustomPlaylistExample() {
  return <MusicPlayer playlist={myPlaylist} autoPlay={false} showPlaylist={true} className="max-w-2xl mx-auto" />;
}
```

## Props

```ts
export interface Song {
  id: number;
  title: string;
  artist?: string;
  duration: string;
  audioUrl: string;
}

export interface MusicPlayerProps {
  playlist?: Song[]; // Default: 20 bài hát có sẵn
  autoPlay?: boolean; // Default: false
  showPlaylist?: boolean; // Default: true
  className?: string;
  overflowHidden?: boolean; // Default: true
}
```

## Overflow Behavior

`MusicPlayer` keeps `overflowHidden={true}` by default to preserve the existing card shape.

Disable it when nested hover cards, focus rings, or translated content should escape the player surface:

```tsx
<MusicPlayer overflowHidden={false} className="max-w-2xl" />
```

## Features

### 🎵 Playback Controls

- Play/Pause
- Next/Previous track
- Seek (progress bar)
- Auto-play next song when current ends

### 🔊 Volume Control

- Volume slider (0-100%)
- Mute/Unmute toggle
- Persistent volume across tracks

### 📃 Playlist

- Display/Hide playlist
- Click to play specific song
- Visual indicator for currently playing song
- Song count display

### 🎨 UI Features

- System color scheme integration
- Smooth transitions and animations
- Responsive design
- Current time & total duration display
- Album art placeholder

## Default Playlist

Component đi kèm với 20 bài hát mặc định:

1. Someone You Loved - Lewis Capaldi
2. Love Me Like You Do - Ellie Goulding
3. All Of Me - John Legend
4. Always Remember Us This Way - Lady Gaga
5. Everytime We Touch - Cascada
6. At My Worst - Pink Sweat$
7. Sweet But Psycho - Ava Max
8. Love Is Gone - SLANDER
9. Bad Liar - Imagine Dragons
10. Dusk Till Dawn - ZAYN ft. Sia
11. Flowers - Miley Cyrus
12. You Broke Me First - Tate McRae
13. Symphony - Clean Bandit ft. Zara Larsson
14. Dancing With Your Ghost - Sasha Alex Sloan
15. Let Me Down Slowly - Alec Benjamin
16. Impossible - James Arthur
17. Perfect - Ed Sheeran
18. La La La - Naughty Boy ft. Sam Smith
19. Somewhere Only We Know - Keane
20. Diamonds - Rihanna

⚠️ **Lưu ý**: Bạn cần tự thêm file audio (.mp3) vào thư mục `public/music/` với tên file tương ứng. Xem [hướng dẫn thêm nhạc](#thêm-file-nhạc).

## Thêm file nhạc

### Cấu trúc thư mục

```
public/
└── music/
    ├── someone-you-loved.mp3
    ├── love-me-like-you-do.mp3
    ├── all-of-me.mp3
    └── ... (các file khác)
```

### Lưu ý về bản quyền

⚠️ **QUAN TRỌNG**: Chỉ sử dụng nhạc mà bạn có quyền:

- Nhạc bạn tự sáng tác
- Nhạc có giấy phép sử dụng
- Nhạc miễn phí bản quyền (royalty-free)
- Nhạc đã mua license

### Nguồn nhạc miễn phí bản quyền

- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/)
- [YouTube Audio Library](https://studio.youtube.com/)
- [Bensound](https://www.bensound.com/)
- [Purple Planet](https://www.purple-planet.com/)

## Styling

Component sử dụng system colors từ theme hiện tại:

- `bg-card` - Background
- `text-foreground` - Text chính
- `text-muted-foreground` - Text phụ
- `bg-primary` - Nút chính và slider thumb
- `bg-secondary` - Nút phụ
- `border-border` - Border colors

Tự động thích ứng với light/dark mode.

## Custom Styling

```tsx
<MusicPlayer className="shadow-xl max-w-xl" />
```

## Technical Details

- Built with React hooks (useState, useRef, useEffect)
- HTML5 Audio API
- Responsive CSS với Tailwind
- TypeScript support
- No external audio libraries required

## Browser Support

Hỗ trợ tất cả trình duyệt hiện đại với HTML5 audio:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Example Usage

Xem demo tại: `/demo/music-player`

```tsx
// app/demo/music-player/page.tsx
import MusicPlayer from "@/components/ui/MusicPlayer";

export default function MusicPlayerDemo() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Music Player Demo 🎵</h1>
        <MusicPlayer />
      </div>
    </div>
  );
}
```

## Related Components

- [Audio](./Audio.md) - Simple audio playback (if exists)
- [MediaPlayer](./MediaPlayer.md) - Video/Audio player (if exists)

## License

MIT
