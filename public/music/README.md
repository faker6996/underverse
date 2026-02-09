# Music Files Directory

## Hướng dẫn sử dụng

### ⚡ Option 1: Sử dụng 1 file MP3 dài (Khuyến nghị)

MusicPlayer mặc định được cấu hình để sử dụng **1 file MP3 dài** chứa tất cả 30 bài hát với timestamps.

1. **Tải hoặc chuẩn bị file MP3 dài** chứa 30 bài hát liên tiếp
2. **Đặt tên file**: `full-playlist.mp3`
3. **Đặt vào**: `public/music/full-playlist.mp3`

Component sẽ tự động seek đến đúng vị trí của từng bài dựa trên timestamps đã cấu hình.

**Danh sách 30 bài trong playlist:**

1. Someone You Loved (0:00 - 3:07)
2. Love Me Like You Do (3:07 - 6:37)
3. All Of Me (6:37 - 11:43)
4. Always Remember Us This Way (11:43 - 15:03)
5. Everytime We Touch (15:03 - 17:55)
6. At My Worst (17:55 - 20:38)
7. Sweet But Psycho (20:38 - 22:57)
8. Love Is Gone (22:57 - 25:53)
9. Bad Liar (25:53 - 30:09)
10. Dusk Till Dawn (30:09 - 33:52)
11. Flowers (33:52 - 37:35)
12. You Broke Me First (37:35 - 40:36)
13. Symphony (40:36 - 42:37)
14. Dancing With Your Ghost (42:37 - 45:38)
15. Let Me Down Slowly (45:38 - 49:11)
16. Impossible (49:11 - 52:37)
17. Perfect (52:37 - 56:07)
18. La La La (56:07 - 58:37)
19. Somewhere Only We Know (58:37 - 1:02:06)
20. Diamonds (1:02:06 - 1:05:11)
21. Infinity (1:05:11 - 1:08:23)
22. Memories (1:08:23 - 1:11:40)
23. Closer (1:11:40 - 1:14:44)
24. Save Your Tears (1:14:44 - 1:17:54)
25. Stereo Love (1:17:54 - 1:21:04)
26. Shallow (1:21:04 - 1:24:34)
27. Toxic (1:24:34 - 1:27:08)
28. Some Say (1:27:08 - 1:30:05)
29. Love Someone (1:30:05 - 1:33:29)
30. You Are The Reason (1:33:29 - 1:36:53)

### 🎵 Option 2: Sử dụng file riêng lẻ

Bạn cũng có thể sử dụng file MP3 riêng cho từng bài:

```
public/music/
├── someone-you-loved.mp3
├── love-me-like-you-do.mp3
├── all-of-me.mp3
└── ... (các file khác)
```

Và truyền playlist tùy chỉnh không có `startTime`/`endTime`:

```tsx
const customPlaylist = [{ id: 1, title: "My Song", artist: "Artist", duration: "3:30", audioUrl: "/music/my-song.mp3" }];
<MusicPlayer playlist={customPlaylist} />;
```

### Lưu ý về bản quyền:

⚠️ **QUAN TRỌNG**: Chỉ sử dụng nhạc mà bạn có quyền sử dụng:

- Nhạc bạn tự sáng tác
- Nhạc có giấy phép sử dụng
- Nhạc miễn phí bản quyền (royalty-free)
- Nhạc đã mua license

### Nguồn nhạc miễn phí bản quyền:

- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/)
- [YouTube Audio Library](https://studio.youtube.com/)
- [Bensound](https://www.bensound.com/)
- [Purple Planet](https://www.purple-planet.com/)

### Cách sử dụng nhạc riêng:

Nếu bạn muốn dùng playlist riêng, truyền vào component:

```tsx
import MusicPlayer from "@/components/ui/MusicPlayer";

const myPlaylist = [
  {
    id: 1,
    title: "My Song",
    artist: "My Artist",
    duration: "3:30",
    audioUrl: "/music/my-song.mp3",
  },
  // ... more songs
];

<MusicPlayer playlist={myPlaylist} />;
```
