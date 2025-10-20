# 🎯 Hawkeye Studio (Next.js)

Hawkeye Studio là ứng dụng web (Next.js) cho hệ thống hỗ trợ trọng tài và kỹ thuật viên (referee/operator) trong các trận đấu. Dự án cung cấp UI điều khiển, thông báo real‑time, quản lý người dùng/phân quyền, tải bản đồ sân 2D và các API quản trị an toàn.

## 🚀 Tính Năng Chính

- **Auth & Roles:** đăng ký/đăng nhập, refresh token, quên/đổi mật khẩu; phân quyền `user/admin/super_admin` (middleware bảo vệ `/admin`).
- **Notifications:** gửi/broadcast thông báo theo người dùng/role, lịch sử đã gửi, đánh dấu đã đọc; tùy chọn gửi email.
- **Real‑time:** tích hợp Socket.IO (gateway độc lập) + phát sự kiện tới room `user:{id}` qua REST `/emit` của gateway.
- **Camera Streaming:** 4 RTSP camera streams với MediaMTX gateway, convert sang WebRTC (WHEP) và HLS; giao diện referee/operator với 1 main video + 4 thumbnails có thể switch.
- **🎬 Challenge Review System (NEW):** Hệ thống xem lại video challenge với:
  - Auto-recording RTSP streams (rolling buffer)
  - Video playback với timeline controls chính xác (milliseconds)
  - Frame-by-frame analysis (30fps)
  - Playback speed: 0.25x → 2x (slow motion & fast forward)
  - Multi-camera switching trong review mode
  - Keyboard shortcuts (Space, Arrow keys)
  - Auto-cleanup recordings (giữ N files mới nhất)
- **2D Court Map:** API tải ảnh base64, lấy bản mới nhất/danh sách.
- **Admin SQL Tool:** endpoint chạy SQL dành cho super admin (có chặn pattern nguy hiểm, yêu cầu flag khi ghi dữ liệu).
- **Healthcheck:** `/api/health` kiểm tra kết nối DB.
- **i18n:** hỗ trợ `vi/en`, tự động phát hiện locale và redirect.

## 🏗️ Tech Stack

- Next.js 15 (App Router, TS), React 19, Tailwind CSS 4
- PostgreSQL (Docker: `postgres:16-alpine`), Redis 7 (tùy chọn)
- Socket.IO 4 (client + gateway), JWT (`jose`), `bcrypt`, Nodemailer

## 📂 Cấu Trúc Thư Mục

```
app/
  [locale]/
    (admin)/admin/{referee,operator}/   # Giao diện trọng tài & kỹ thuật viên
    (pages)/{login,register,forgot-password,reset-password,users}
  api/
    auth/               # login, register, me, refresh, change-password
    notifications/      # list/patch, send, broadcast, sent
    admin/sql-query/    # Super admin chạy SQL an toàn
    map2d/              # Tải/lấy bản đồ 2D dạng base64
    utils/verify-email/ # Xác thực email đơn giản
    health/             # Healthcheck
components/
  admin/{referee,operator}/            # UI referee/operator
  admin/notifications/                 # UI gửi/broadcast thông báo
database/setup_database.sql            # Schema users, user_roles, refresh_tokens, logs, notifications, cameras, map_2d
realtime/{client,server,types}.ts      # Socket.IO client + gateway (standalone)
lib/{models,modules,utils,constants}   # Logic, helpers, enums
```

## ⚙️ Cài Đặt & Chạy Local

Yêu cầu: Node 18+, Docker & Docker Compose, npm.

1) Cài dependencies

```bash
npm install
```

2) Khởi động PostgreSQL + Redis + MediaMTX bằng Docker

```bash
# Dùng script tiện ích
npm run docker:local:up
# hoặc trực tiếp
docker compose -f docker-compose.local.yml up -d
```

Dịch vụ Docker bao gồm:
- **hawkeye-studio-db** (PostgreSQL) - Port 5435
- **hawkeye-studio-redis** (Redis) - Port 6381
- **hawkeye-studio-mediamtx** (MediaMTX) - Ports 8888 (HLS), 8889 (WebRTC), 8189 (ICE)

3) (Tùy chọn) Chạy RTSP test server cho 4 cameras

Nếu cần test streaming với 4 camera RTSP:

```bash
# Chuẩn bị video test (đặt trong scripts/)
# Tải 4 video MP4 mẫu và đặt tên: cam1.mp4, cam2.mp4, cam3.mp4, cam4.mp4

# Chạy script tạo 4 RTSP streams
./scripts/test_4cam_rtsp.sh

# Verify streams đang chạy
docker logs rtsp-server
```

MediaMTX sẽ tự động pull streams từ rtsp-server và convert sang WebRTC/HLS.

4) Tạo `.env.local` (tham khảo `.env.example`), ví dụ khớp docker-compose.local.yml:

```bash
# Database (khớp service: hawkeye-studio-db)
DATABASE_URL=postgres://hawkeye-studio:hawkeye-studio@localhost:5435/hawkeye-studio

# Redis (tùy chọn – khớp service: hawkeye-studio-redis)
REDIS_HOST=localhost
REDIS_PORT=6381
REDIS_PASSWORD=hawkeye-studio
REDIS_OPTIONAL=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Realtime Gateway (tùy chọn)
WS_PORT=4000
# Nếu chạy gateway riêng, có thể trỏ trực tiếp:
# WS_GATEWAY_URL=http://localhost:4000/emit

# Admin/Security
SUPER_ADMIN_EMAILS=admin@example.com

# Email (tùy chọn)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_PORT=587

# Camera RTSP Streams (nếu chạy test server)
CAM1_RTSP_URL=rtsp://host.docker.internal:8554/cam1
CAM2_RTSP_URL=rtsp://host.docker.internal:8554/cam2
CAM3_RTSP_URL=rtsp://host.docker.internal:8554/cam3
CAM4_RTSP_URL=rtsp://host.docker.internal:8554/cam4

# Video Recordings (NEW - for Challenge Review)
RECORDINGS_PATH=./public/recordings
```

5) Seed DB tự động: container Postgres sẽ chạy script `database/setup_database.sql` lần đầu (tạo bảng + 1 super admin `admin@example.com` với role `super_admin`). Mật khẩu mặc định có trong seed (hash); nên đặt lại qua flow quên mật khẩu hoặc SQL.

6) Chạy Realtime Gateway (tùy chọn, để nhận thông báo socket)

```bash
# Cửa sổ riêng
node realtime/server/standalone.cjs            # dùng WS_PORT=4000 (mặc định)
# Bảo vệ bằng API key (khuyến nghị): WS_API_KEY=your-key node realtime/server/standalone.cjs
```

7) Chạy ứng dụng

```bash
npm run dev         # hoặc: npm run dev_v2 (Turbopack)
# http://localhost:3000
```

Truy cập:
- **Trang chủ:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/vi/admin
- **Referee Interface:** http://localhost:3000/vi/admin/referee (với 4 camera streams)
- **Operator Interface:** http://localhost:3000/vi/admin/operator (với 4 camera streams)

8) Dừng dịch vụ Docker

```bash
npm run docker:local:down
# hoặc: docker compose -f docker-compose.local.yml down
```

## 🔌 API Chính (tóm tắt)

- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`, `POST /api/forgot-password`, `POST /api/reset-password`
- **Notifications:**
  - `GET /api/notifications` — danh sách của tôi; `PATCH /api/notifications` — đánh dấu đã đọc/xóa
  - `POST /api/notifications/send` — gửi tới 1 user; `POST /api/notifications/broadcast` — gửi nhiều user/role
  - `GET /api/notifications/sent` — lịch sử tôi đã gửi
- **Cameras:**
  - `GET /api/cameras` — danh sách cameras active
  - `POST /api/cameras` — tạo camera mới
  - `GET /api/cameras/:id` — lấy camera theo ID
  - `PUT /api/cameras/:id` — update camera
  - `DELETE /api/cameras/:id` — soft delete (hoặc `?permanent=true` để hard delete)
- **Streaming:**
  - `POST /api/webrtc/whep?path={cam1|cam2|cam3|cam4}` — WebRTC WHEP negotiation
  - `DELETE /api/webrtc/whep?location={session}` — Terminate WebRTC session
- **Recordings (NEW):**
  - `GET /api/recordings?camera={cam1|cam2|cam3|cam4}&limit=N` — List recorded videos
  - `GET /api/recordings/stream?camera={cam}&file={filename}` — Stream recorded video với HTTP Range Requests
- **Admin:** `POST /api/admin/sql-query` — chạy SQL an toàn (super admin)
- **Map2D:** `POST /api/map2d` (upload base64), `GET /api/map2d?mode=list|latest`
- **Utils:** `POST /api/utils/verify-email`
- **Health:** `GET /api/health`

OpenAPI JSON: `public/openapi.json` (có thể cập nhật bằng script `node scripts/generate-openapi.mjs`).

## 🖥️ UI Điều Hành

- Admin shell: `/{locale}/admin` (VD: `/vi/admin`)
- Tabs: Trọng tài (referee), Kỹ thuật viên (operator)
- Middleware bảo vệ bằng role (admin/super_admin)

## 🎬 Challenge Review System (Chi Tiết)

Hệ thống xem lại video challenge dành cho trọng tài, với khả năng phân tích từng frame và so sánh đa góc camera.

### ✨ Tính Năng

#### **1. Auto-Recording**
- MediaMTX tự động ghi RTSP streams thành Fragmented MP4 (fmp4)
- Rolling buffer: mỗi 60 giây tạo 1 file mới
- Auto-cleanup: giữ 5 recordings mới nhất mỗi camera (configurable)
- Cleanup chạy mỗi 5 phút trong background

#### **2. Video Playback Controls**
- **Timeline Slider:** Tua đến bất kỳ thời điểm nào với độ chính xác millisecond (`MM:SS.mmm`)
- **Play/Pause:** Phát và tạm dừng video
- **Frame-by-frame:** Di chuyển từng frame (30fps = 0.033s/frame) bằng nút ◄ ►
- **Skip ±5s:** Nhảy nhanh/lùi 5 giây bằng nút ⏪ ⏩ hoặc arrow keys
- **Playback Speed:** 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- **Multi-camera Switch:** Chuyển đổi giữa 4 camera bằng nút ⏮ ⏭

#### **3. Keyboard Shortcuts**

| Phím | Chức năng |
|------|-----------|
| `Space` | Play/Pause |
| `← Arrow` | Lùi 5 giây |
| `→ Arrow` | Tiến 5 giây |

**Button Controls:**
- ⏮ — Previous Camera
- ⏪ — Lùi 5s (← Arrow)
- ◄ — Lùi 1 frame
- ▶/⏸ — Play/Pause (Space)
- ► — Tiến 1 frame
- ⏩ — Tiến 5s (→ Arrow)
- ⏭ — Next Camera

### 📋 Workflow Sử Dụng

1. **Live Streaming Mode** (Mặc định)
   - Xem 4 camera live streams qua WebRTC/HLS
   - MediaMTX tự động ghi video vào `/recordings/`

2. **Challenge Review Mode**
   - Nhấn nút **"🎬 Bắt đầu Review Challenge"**
   - Hệ thống load recording gần nhất của camera đang chọn
   - Video player hiển thị với full controls

3. **Phân Tích Challenge**
   - **Slow Motion:** Chọn 0.25x để xem chậm 4 lần
   - **Frame-by-frame:** Pause và dùng ◄ ► để xem từng frame
   - **Multi-angle:** Nhấn ⏮ ⏭ để so sánh góc nhìn từ camera khác
   - **Timeline:** Tua đến thời điểm chính xác cần review

4. **Quay Lại Live Stream**
   - Nhấn **"← Quay lại Live Stream"**

### ⚙️ Cấu Hình

#### **MediaMTX Recording Settings** (trong `mediamtx.yml`)
```yaml
record: yes
recordPath: /recordings/%path/%Y-%m-%d_%H-%M-%S
recordFormat: fmp4                    # Fragmented MP4 (hỗ trợ seeking)
recordSegmentDuration: 60s            # 60 giây mỗi file
```

#### **Auto-Cleanup Settings** (trong `docker-compose.local.yml`)
```yaml
mediamtx:
  environment:
    - MAX_RECORDINGS=5         # Giữ 5 recordings mới nhất
    - CLEANUP_INTERVAL=300     # Cleanup mỗi 5 phút (300s)
```

### 🛠️ Quick Start

```bash
# 1. Thêm vào .env.local
RECORDINGS_PATH=./public/recordings

# 2. Rebuild MediaMTX container với recording enabled
npm run docker:local:down
npm run docker:local:up

# 3. Đợi RTSP stream ghi ít nhất 60 giây

# 4. Kiểm tra recordings
docker exec hawkeye-studio-mediamtx ls -lh /recordings/cam1

# 5. Truy cập Referee Interface
# http://localhost:3000/vi/admin/referee

# 6. Nhấn "🎬 Bắt đầu Review Challenge"
```

### 📚 Documentation

- **Quick Start:** [CHALLENGE_REVIEW_QUICKSTART.md](CHALLENGE_REVIEW_QUICKSTART.md)
- **Detailed Guide:** [docs/challenge-review-system.md](docs/challenge-review-system.md)
- **Keyboard Shortcuts:** [docs/keyboard-shortcuts.md](docs/keyboard-shortcuts.md)

### 🔧 Troubleshooting

**Không có recordings:**
```bash
# Check MediaMTX logs
docker logs hawkeye-studio-mediamtx | Select-String -Pattern "record"

# Check recordings folder
docker exec hawkeye-studio-mediamtx ls /recordings/cam1

# Manual cleanup (giữ 5 files mới nhất)
# Xem scripts/cleanup-recordings.sh
```

**Video không phát:**
```bash
# Test API endpoint
curl -I http://localhost:3000/api/recordings/stream?camera=cam1&file=2025-10-18_08-22-58.mp4

# Sync recordings từ container sang host
docker cp hawkeye-studio-mediamtx:/recordings/cam1 ./public/recordings/
```

**Disk space issues:**
- Mặc định giữ 5 recordings/camera (~10MB total)
- Adjust `MAX_RECORDINGS` trong docker-compose.local.yml
- Cleanup chạy tự động mỗi 5 phút

## 📦 Scripts hữu ích

```bash
npm run dev              # Next.js dev server
npm run dev_v2           # Dev với Turbopack
npm run build            # Build production
npm run start            # Start production server

# Docker tiện ích
npm run docker:local:up
npm run docker:local:down
npm run docker:local:ps
npm run docker:local:logs

# i18n & dọn dẹp
npm run i18n:check       # kiểm tra thiếu key
npm run i18n:dedupe      # loại bỏ key trùng
npm run cleanup:console  # xóa console.log

npm run lint             # ESLint
```

## 🐛 Gỡ Lỗi Nhanh

### Database & Redis
- **DB:** kiểm tra `docker compose -f docker-compose.local.yml ps`; hoặc khởi động lại service `db`
- **Kết nối DB:** đảm bảo `DATABASE_URL` trỏ `localhost:5435` và user/password khớp `docker-compose.local.yml`
- **Redis không bắt buộc:** đặt `REDIS_OPTIONAL=true` để tránh retry

### Camera Streaming
- **Video không hiển thị:**
  1. Check rtsp-server: `docker logs rtsp-server --tail 50`
  2. Check MediaMTX: `docker logs hawkeye-studio-mediamtx --tail 50`
  3. Check browser console cho WebRTC errors
  4. Verify network: `docker exec hawkeye-studio-mediamtx ping host.docker.internal`

- **WebRTC timeout:**
  - Verify port 8189 exposed: `docker port hawkeye-studio-mediamtx`
  - Check firewall không block port 8189 UDP/TCP
  - Refresh browser với hard reload (Cmd+Shift+R hoặc Ctrl+Shift+R)

- **Layout issues:**
  - Hard refresh browser (Cmd+Shift+R)
  - Clear browser cache

### General
- **Cổng bận:** `kill -9 $(lsof -ti:3000)`
- **Làm sạch cache:** `rm -rf .next && npm run build`

### Chi tiết thêm
Xem file `docs/4-camera-rtsp-integration.md` để biết thêm về kiến trúc camera streaming.

---

## 📅 Changelog

### Version 1.1.0 (18/10/2025) - Challenge Review System

#### 🎬 New Features
- **Challenge Review System** - Hệ thống xem lại video challenge hoàn chỉnh
  - Auto-recording RTSP streams với MediaMTX
  - Video playback player với timeline controls
  - Frame-by-frame analysis (30fps precision)
  - Multi-speed playback (0.25x - 2x)
  - Multi-camera switching trong review mode
  - Keyboard shortcuts (Space, Arrow keys)
  - Auto-cleanup recordings (configurable rolling buffer)

#### 📁 New Files
- `components/video/RecordedVideoPlayer.tsx` - Video player component với full controls
- `app/api/recordings/route.ts` - API list recordings
- `app/api/recordings/stream/route.ts` - API stream recorded videos với HTTP Range Requests
- `docs/challenge-review-system.md` - Comprehensive documentation
- `docs/keyboard-shortcuts.md` - Keyboard shortcuts guide
- `CHALLENGE_REVIEW_QUICKSTART.md` - Quick start guide
- `scripts/cleanup-recordings.sh` - Manual cleanup utility

#### 🔧 Modified Files
- `mediamtx.yml` - Added recording configuration (fmp4, 60s segments, HLS)
- `docker-compose.local.yml` - Added recordings volume & environment variables
- `docker/mediamtx/entrypoint.sh` - Added background cleanup job
- `components/admin/referee/RefereeInterface.tsx` - Integrated review mode & camera switching
- `components/video/WhepPlayer.tsx` - Silent cleanup error handling
- `.env.example` - Added `RECORDINGS_PATH` variable

#### ✨ Key Improvements
- **Layout Optimization:** Restructured RefereeInterface for better video player rendering
- **State Synchronization:** Fixed play/pause icon sync when switching cameras
- **Auto-update:** Video URL auto-updates when recordings change (camera switching)
- **BusyBox Compatibility:** Cleanup script optimized for Alpine Linux containers
- **HTTP Range Requests:** Video seeking support với 206 Partial Content

#### 🎮 Controls Summary
| Control | Function |
|---------|----------|
| Space | Play/Pause |
| ← → | Skip ±5 seconds |
| ⏮ ⏭ | Previous/Next Camera |
| ◄ ► | Frame-by-frame |
| ⏪ ⏩ | Skip ±5 seconds |
| 0.25x-2x | Playback speed |
| Timeline | Millisecond-precision seeking |

---

## 📜 License

Private project — All rights reserved.
