"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import HlsPlayer from "@/components/video/HlsPlayer";
import WhepPlayer from "@/components/video/WhepPlayer";
import RecordedVideoPlayer from "@/components/video/RecordedVideoPlayer";
import RecordingTimeline from "@/components/video/RecordingTimeline";

interface Camera {
  id: number;
  name: string;
  path: string; // MediaMTX path (cam1, cam2, cam3, cam4)
  label: string;
}

// Default 4 cameras - can be fetched from API later
const DEFAULT_CAMERAS: Camera[] = [
  { id: 1, name: "Camera 1", path: "cam1", label: "Cạnh Trái" },
  { id: 2, name: "Camera 2", path: "cam2", label: "Cạnh Phải" },
  { id: 3, name: "Camera 3", path: "cam3", label: "Phía Sau" },
  { id: 4, name: "Camera 4", path: "cam4", label: "Phía Trước" },
];

export default function RefereeInterface() {
  const [cameras] = useState<Camera[]>(DEFAULT_CAMERAS);
  const [selectedCamera, setSelectedCamera] = useState<Camera>(cameras[0]);

  // Challenge review mode state
  const [reviewMode, setReviewMode] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);

  // Timeline state - track video playback
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  // Fetch available recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await fetch(`/api/recordings?camera=${selectedCamera.path}&limit=10`);
        const result = await response.json();
        // API returns: { success: true, data: { recordings: [...] } }
        const data = result.data || result;
        const recordingsList = data.recordings || [];
        console.log(`[RefereeInterface] Loaded ${recordingsList.length} recordings for ${selectedCamera.path}`, recordingsList);
        setRecordings(recordingsList);
      } catch (error) {
        console.error("Failed to fetch recordings:", error);
      }
    };

    fetchRecordings();
  }, [selectedCamera.path]);

  // Auto-update video URL when recordings change (for camera switching in review mode)
  useEffect(() => {
    if (reviewMode && recordings.length > 0) {
      const newVideoUrl = recordings[0].path;
      console.log(`[RefereeInterface] Auto-updating video URL for ${selectedCamera.path}:`, newVideoUrl);
      setRecordedVideoUrl(newVideoUrl);
    }
  }, [recordings, reviewMode, selectedCamera.path]);

  // Handle challenge button click - load most recent recording
  const handleStartReview = () => {
    console.log(`[RefereeInterface] handleStartReview called. Recordings count: ${recordings.length}`, recordings);
    if (recordings.length > 0) {
      const videoUrl = recordings[0].path;
      console.log(`[RefereeInterface] Loading video: ${videoUrl}`);
      setRecordedVideoUrl(videoUrl);
      setReviewMode(true);
    } else {
      // No recordings available, show alert
      console.warn("[RefereeInterface] No recordings available");
      alert("Không có video recording nào. Vui lòng đợi hệ thống ghi hình.");
    }
  };

  // Exit review mode and return to live
  const handleExitReview = () => {
    setReviewMode(false);
    setRecordedVideoUrl(null);
  };

  // Camera navigation - previous/next camera
  const switchCamera = (direction: number) => {
    const currentIndex = cameras.findIndex((cam) => cam.id === selectedCamera.id);
    const nextIndex = (currentIndex + direction + cameras.length) % cameras.length;
    const nextCamera = cameras[nextIndex];
    console.log(`[RefereeInterface] Switching camera: ${selectedCamera.name} → ${nextCamera.name}`);
    setSelectedCamera(nextCamera);
    // Video URL will be auto-updated by useEffect when recordings load
  };

  // Handle video time update from RecordedVideoPlayer
  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    setVideoCurrentTime(currentTime);
    setVideoDuration(duration);
  };

  // Handle timeline seek - jump to specific time
  const handleTimelineSeek = (time: number) => {
    console.log(`[RefereeInterface] Timeline seek to: ${time}s`);
    setSeekToTime(time);
    // Reset seekToTime after a brief moment to allow re-seeking to same position
    setTimeout(() => setSeekToTime(null), 100);
  };

  return (
    <div className="grid grid-cols-[1fr_350px] grid-rows-[auto_1fr_auto] gap-4 h-[calc(100vh-120px)] min-h-0 p-4">
      <Card className="col-span-full bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-shrink-0">
            <Badge variant="outline" className="mb-2 font-normal">
              Trận đấu
            </Badge>
            <div className="font-bold text-lg">Nam Đơn - Vòng Tứ Kết</div>
          </div>

          <div className="flex-1 flex items-center justify-center gap-6">
            <div className="flex-1 flex flex-col items-end gap-3 min-w-0">
              <div className="text-right w-full">
                <div className="text-sm font-semibold text-foreground tracking-wide truncate">NGUYỄN VĂN A</div>
                <div className="text-xs text-muted-foreground mt-0.5">Cầu thủ 1</div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-4xl font-bold text-primary">11</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">VS</span>
              </div>
              <div className="h-px w-full bg-border"></div>
            </div>

            <div className="flex-1 flex flex-col items-start gap-3 min-w-0">
              <div className="text-left w-full">
                <div className="text-sm font-semibold text-foreground tracking-wide truncate">TRẦN VĂN B</div>
                <div className="text-xs text-muted-foreground mt-0.5">Cầu thủ 2</div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border-2 border-border">
                  <span className="text-4xl font-bold">9</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-6">
            <div className="h-16 w-px bg-border"></div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Set</span>
              <span className="text-4xl font-bold text-primary">2</span>
            </div>
            <div className="h-16 w-px bg-border"></div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Thời gian</span>
              <span className="text-4xl font-bold tabular-nums">15:42</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4 h-full min-h-0">
        {reviewMode && recordedVideoUrl ? (
          // Review Mode: RecordedVideoPlayer with controls below
          <Card className="flex-1 flex flex-col min-h-0">
            <Badge className="mb-2">
              {selectedCamera.name} - {selectedCamera.label} (REVIEW)
            </Badge>
            <div className="flex-1 min-h-0">
              <RecordedVideoPlayer
                videoUrl={recordedVideoUrl}
                className="h-full"
                seekToTime={seekToTime}
                onTimeUpdate={handleVideoTimeUpdate}
                onPreviousCamera={() => switchCamera(-1)}
                onNextCamera={() => switchCamera(1)}
              />
            </div>
          </Card>
        ) : (
          // Live Mode: WhepPlayer fills container
          <Card className="h-full relative overflow-hidden min-h-0" innerClassName="h-full min-h-0" contentClassName="h-full min-h-0 p-0" noPadding>
            <Badge className="absolute top-2 left-2 z-10">
              {selectedCamera.name} - {selectedCamera.label}
            </Badge>
            <div className="absolute inset-0">
              <WhepPlayer path={selectedCamera.path} key={selectedCamera.path} />
            </div>
          </Card>
        )}
        <div className="grid grid-cols-4 gap-2">
          {cameras.map((camera) => (
            <Button
              key={camera.id}
              variant={selectedCamera.id === camera.id ? "primary" : "outline"}
              asContainer
              className={`!h-auto !min-h-0 py-3 px-3 ${selectedCamera.id === camera.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedCamera(camera)}
            >
              <div className="flex flex-col items-center gap-0.5 w-full">
                <span className="text-sm font-semibold">{camera.name}</span>
                <span className="text-xs text-muted-foreground">{camera.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="border-l-4 border-primary">
          <div className="flex-row items-center justify-between flex">
            <div>
              <h3 className="text-lg font-semibold">Challenge #3</h3>
              <p className="text-sm text-muted-foreground">Yêu cầu bởi: Nguyễn Văn A</p>
            </div>
            <Badge variant="warning">ĐANG XEM XÉT</Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
            <div>
              <div className="text-muted-foreground">Loại Challenge</div>
              <div className="font-semibold">Bóng OUT/IN</div>
            </div>
            <div>
              <div className="text-muted-foreground">Quyết Định Ban Đầu</div>
              <div className="font-semibold">OUT</div>
            </div>
            <div>
              <div className="text-muted-foreground">Thời Điểm</div>
              <div className="font-semibold">15:38:42</div>
            </div>
            <div>
              <div className="text-muted-foreground">Vị Trí</div>
              <div className="font-semibold">Baseline Trái</div>
            </div>
          </div>
        </Card>

        <Card className="flex-1 flex items-center justify-center relative">
          <Badge className="absolute top-2 left-2">Quỹ Đạo 3D - Hawk-Eye</Badge>
          <div className="text-center text-muted-foreground">
            <div className="text-6xl">📐</div>
            <div>3D Trajectory Visualization</div>
            <div className="text-sm">Tái tạo đường bay bóng chính xác</div>
          </div>
        </Card>

        <Card>
          <div className="p-0">
            <div className="mb-2">
              <div className="text-sm text-muted-foreground mb-1">Độ tin cậy</div>
              <div className="flex items-center gap-2">
                <Progress value={95} className="flex-1" />
                <div className="font-bold text-success">95%</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Điểm chạm</div>
                <div className="font-bold">X: 5.23m, Y: 11.8m</div>
              </div>
              <div>
                <div className="text-muted-foreground">Khoảng cách đến line</div>
                <div className="font-bold text-success">2.3 cm (IN)</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            size="lg"
            asContainer
            className="!h-auto !min-h-0 py-4 px-6 shadow-md hover:shadow-lg transition-all overflow-visible"
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="font-bold text-base">✓ XÁC NHẬN</span>
              <span className="text-xs opacity-80 whitespace-nowrap">Giữ nguyên quyết định</span>
            </div>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            asContainer
            className="!h-auto !min-h-0 py-4 px-6 shadow-md hover:shadow-lg transition-all overflow-visible"
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="font-bold text-base">✗ PHỦ QUYẾT</span>
              <span className="text-xs opacity-80 whitespace-nowrap">Thay đổi quyết định</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="col-span-full">
        <Card>
          <div className="pb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold">{reviewMode ? "Challenge Review - Playback Control" : "Live Stream"}</h3>
            {reviewMode ? (
              <Button variant="outline" size="sm" onClick={handleExitReview}>
                ← Quay lại Live Stream
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleStartReview}>
                🎬 Bắt đầu Review Challenge
              </Button>
            )}
          </div>
          {!reviewMode ? (
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-4">
                Đang xem live stream. Nhấn &ldquo;Bắt đầu Review Challenge&rdquo; để xem lại video đã ghi.
              </div>
            </div>
          ) : (
            <div>
              <RecordingTimeline currentTime={videoCurrentTime} duration={videoDuration} onSeek={handleTimelineSeek} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
