"use client";

import { useRef, useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface HighlightThumbnailProps {
  videoUrl: string;
  title: string;
  timestamp: string | null;
  duration?: string;
  isActive?: boolean; // Whether this highlight is currently playing
  onPlay: () => void;
  autoLoop?: boolean; // Auto-play and loop the video
  onVideoEnded?: () => void; // Callback when video ends (for cycling)
}

export default function HighlightThumbnail({
  videoUrl,
  title,
  timestamp,
  duration = "~15s",
  isActive = false,
  onPlay,
  autoLoop = false,
  onVideoEnded,
}: HighlightThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play when autoLoop is enabled
  useEffect(() => {
    if (autoLoop && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Auto-play prevented:", err);
      });
    }
  }, [autoLoop, videoUrl]);

  // Handle video ended event
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoLoop) return;

    const handleEnded = () => {
      if (onVideoEnded) {
        onVideoEnded();
      }
    };

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [autoLoop, onVideoEnded]);

  // Format timestamp for display
  const formatTimestamp = (ts: string | null): string => {
    if (!ts) return "N/A";
    // Input format: "YYYY-MM-DD HH:MM:SS" or similar
    // Output: "HH:MM:SS" only
    try {
      const parts = ts.split(" ");
      if (parts.length === 2) {
        return parts[1]; // Return time part only
      }
      return ts;
    } catch {
      return ts;
    }
  };

  return (
    <div
      className={`relative bg-muted rounded-lg overflow-hidden cursor-pointer transition-all ${
        isActive
          ? "ring-4 ring-warning shadow-xl border-2 border-warning"
          : isHovered
            ? "ring-2 ring-primary shadow-lg"
            : ""
      }`}
      onClick={onPlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />

        {/* Play Overlay (hidden when autoLoop is enabled) */}
        {!autoLoop && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-900 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>

      {/* Info Section (hidden when autoLoop is enabled) */}
      {!autoLoop && (
        <div className="p-2">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{title}</div>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(timestamp)}
              </div>
            </div>
            <Button size="sm" className="ml-2">
              Play
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
