"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

interface RecordedVideoPlayerProps {
  videoUrl: string;
  className?: string;
  autoPlay?: boolean; // Auto-play when video loads
  seekToTime?: number | null; // External seek command (set to time in seconds)
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPreviousCamera?: () => void;
  onNextCamera?: () => void;
}

export default function RecordedVideoPlayer({
  videoUrl,
  className,
  autoPlay = false,
  seekToTime = null,
  onTimeUpdate,
  onPreviousCamera,
  onNextCamera
}: RecordedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  // Playback speed options
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  // Reset state when video URL changes (e.g., camera switch)
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Auto-play if enabled
      if (autoPlay) {
        video.play().catch((err) => {
          console.error("Failed to auto-play video:", err);
        });
      }
      // Sync playing state with actual video state
      setIsPlaying(!video.paused);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime);
        onTimeUpdate?.(video.currentTime, video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isSeeking, onTimeUpdate, videoUrl, autoPlay]);

  // Handle external seek command from timeline
  useEffect(() => {
    if (seekToTime !== null && seekToTime >= 0) {
      const video = videoRef.current;
      if (video && isFinite(duration) && duration > 0) {
        video.currentTime = Math.max(0, Math.min(seekToTime, duration));
        console.log(`[RecordedVideoPlayer] Seeking to ${seekToTime}s`);
      }
    }
  }, [seekToTime, duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          skip(-5); // Rewind 5 seconds
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(5); // Forward 5 seconds
          break;
        case " ": // Spacebar
          e.preventDefault();
          togglePlayPause();
          break;
        default:
          return; // Don't prevent default for other keys
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration]); // Dependencies for skip and togglePlayPause

  // Play/Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  // Seek to specific time
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    seekTo(currentTime + seconds);
  };

  // Jump to start/end
  const jumpToStart = () => seekTo(0);
  const jumpToEnd = () => seekTo(duration);

  // Frame-by-frame stepping (assuming 30fps = 0.033s per frame)
  const stepFrame = (direction: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    seekTo(currentTime + (direction * 0.033));
  };

  // Change playback speed
  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackRate(speed);
  };

  // Handle timeline slider change
  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsSeeking(true);
  };

  const handleTimelineMouseUp = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = currentTime;
    setIsSeeking(false);
  };

  // Format time display (MM:SS.mmm)
  const formatTime = (time: number): string => {
    if (!isFinite(time)) return "00:00.000";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  return (
    <div className={`flex flex-col gap-2 h-full ${className ?? ""}`}>
      {/* Video Element */}
      <div className="relative flex-1 w-full bg-black rounded overflow-hidden min-h-0">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
        />
      </div>

      {/* Timeline Slider */}
      <div className="px-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className="font-mono">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.001}
              value={currentTime}
              onChange={handleTimelineChange}
              onMouseUp={handleTimelineMouseUp}
              onTouchEnd={handleTimelineMouseUp}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) 100%)`
              }}
            />
          </div>
          <span className="font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous Camera */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousCamera}
          title="Camera trước (Previous)"
          disabled={!onPreviousCamera}
        >
          ⏮
        </Button>

        {/* Rewind 5s */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => skip(-5)}
          title="Lùi 5 giây (← Arrow Key)"
        >
          ⏪
        </Button>

        {/* Frame Step Backward */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => stepFrame(-1)}
          title="Lùi 1 frame"
        >
          ◄
        </Button>

        {/* Play/Pause */}
        <Button
          variant="primary"
          size="lg"
          onClick={togglePlayPause}
          title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}
        >
          {isPlaying ? "⏸" : "▶"}
        </Button>

        {/* Frame Step Forward */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => stepFrame(1)}
          title="Tiến 1 frame"
        >
          ►
        </Button>

        {/* Forward 5s */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => skip(5)}
          title="Tiến 5 giây (→ Arrow Key)"
        >
          ⏩
        </Button>

        {/* Next Camera */}
        <Button
          variant="outline"
          size="icon"
          onClick={onNextCamera}
          title="Camera tiếp theo (Next)"
          disabled={!onNextCamera}
        >
          ⏭
        </Button>
      </div>

      {/* Playback Speed Controls */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        <span className="text-xs text-muted-foreground mr-2">Tốc độ:</span>
        {speedOptions.map((speed) => (
          <Button
            key={speed}
            variant={playbackRate === speed ? "primary" : "outline"}
            size="sm"
            onClick={() => changeSpeed(speed)}
            className="min-w-[60px]"
          >
            {speed}x
          </Button>
        ))}
      </div>
    </div>
  );
}
