"use client";

import { useRef, useState } from "react";

interface RecordingTimelineProps {
  currentTime: number;      // Current playback time in seconds
  duration: number;         // Total recording duration in seconds
  onSeek?: (time: number) => void;  // Callback when user seeks to a time
  className?: string;
}

export default function RecordingTimeline({
  currentTime,
  duration,
  onSeek,
  className = "",
}: RecordingTimelineProps) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Format time as MM:SS.mmm
  const formatTime = (time: number): string => {
    if (!isFinite(time) || time < 0) return "00:00.000";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  // Calculate time from mouse position
  const getTimeFromMouseEvent = (e: React.MouseEvent<HTMLDivElement>): number => {
    const timeline = timelineRef.current;
    if (!timeline) return 0;

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };

  // Handle click on timeline
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const time = getTimeFromMouseEvent(e);
    onSeek?.(time);
  };

  // Handle mouse move (for hover preview)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const time = getTimeFromMouseEvent(e);
    setHoverTime(time);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  // Calculate playhead position percentage
  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hoverPosition = hoverTime !== null && duration > 0 ? (hoverTime / duration) * 100 : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Time labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="text-xs font-medium">Recording Timeline</span>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>

      {/* Timeline bar */}
      <div
        ref={timelineRef}
        className="relative h-16 bg-muted rounded-lg cursor-pointer group overflow-hidden"
        onClick={handleTimelineClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Progress bar (recorded portion) */}
        <div
          className="absolute inset-0 bg-primary/20 transition-all"
          style={{ width: `${playheadPosition}%` }}
        />

        {/* Hover indicator */}
        {hoverPosition !== null && (
          <>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary/50 pointer-events-none"
              style={{ left: `${hoverPosition}%` }}
            />
            <div
              className="absolute -top-8 transform -translate-x-1/2 px-2 py-1 bg-background border border-border rounded text-xs font-mono whitespace-nowrap pointer-events-none shadow-lg"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime!)}
            </div>
          </>
        )}

        {/* Playhead bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-warning shadow-lg transition-all pointer-events-none"
          style={{ left: `${playheadPosition}%` }}
        >
          {/* Playhead handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-warning rounded-full border-2 border-background shadow-md" />
        </div>

        {/* Time markers (every 5 seconds) */}
        {duration > 0 &&
          Array.from({ length: Math.floor(duration / 5) + 1 }).map((_, i) => {
            const markerTime = i * 5;
            const markerPosition = (markerTime / duration) * 100;

            if (markerPosition > 100) return null;

            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-border/50"
                style={{ left: `${markerPosition}%` }}
              >
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                  {i * 5}s
                </div>
              </div>
            );
          })}

        {/* Center line indicator */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border/30 pointer-events-none" />
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground text-center">
        Click vào timeline để nhảy đến thời điểm bất kỳ
      </div>
    </div>
  );
}
