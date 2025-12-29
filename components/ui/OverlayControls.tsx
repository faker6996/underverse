"use client";

import Button from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/utils/cn";
import { Dot, Maximize2, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import React from "react";

interface OverlayControlsProps {
  mode: "live" | "review";
  value: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void; // Called when user releases drag
  playing?: boolean; // review only
  onTogglePlay?: () => void; // review only
  onGoLive?: () => void; // review only: exit to live
  // Volume controls (review)
  volume?: number; // 0..1
  muted?: boolean;
  onVolumeChange?: (v: number) => void;
  onToggleMute?: () => void;
  // Playback rate (review)
  rate?: number;
  onChangeRate?: (r: number) => void;
  // Fullscreen toggle (review)
  onToggleFullscreen?: () => void;
  showOnHover?: boolean; // live: true -> only show when parent has group-hover
  className?: string;
  showTime?: boolean; // review: show current/total label
  // Skip controls (review)
  skipSeconds?: number; // default 10s
  onSkip?: (seconds: number) => void; // positive = forward, negative = backward
  // Preview thumbnail
  onSeekPreview?: (time: number) => string | undefined; // return thumbnail URL for given time
  // Auto-hide behavior
  autoHide?: boolean; // default false for review, true for live
  autoHideDelay?: number; // ms, default 3000
  // Keyboard shortcuts
  enableKeyboardShortcuts?: boolean; // default true
}

export default function OverlayControls({
  mode,
  value,
  max,
  step = 0.1,
  onChange,
  onCommit,
  playing = false,
  onTogglePlay,
  onGoLive,
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
  rate = 1,
  onChangeRate,
  onToggleFullscreen,
  showOnHover = false,
  className,
  showTime,
  skipSeconds = 10,
  onSkip,
  onSeekPreview,
  autoHide = false,
  autoHideDelay = 3000,
  enableKeyboardShortcuts = true,
}: OverlayControlsProps) {
  const hoverClasses = showOnHover
    ? "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
    : "opacity-100 pointer-events-auto";

  const showControlsBar = mode === "review";
  const [rateOpen, setRateOpen] = React.useState(false);
  const rateWrapRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-hide state
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Preview thumbnail state
  const [previewData, setPreviewData] = React.useState<{ time: number; x: number; url?: string } | null>(null);
  const sliderRef = React.useRef<HTMLDivElement | null>(null);

  // Track the current dragging value
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragValue, setDragValue] = React.useState(value);

  // Update dragValue when value prop changes (from external source)
  React.useEffect(() => {
    if (!isDragging) {
      setDragValue(value);
    }
  }, [value, isDragging]);

  // Keyboard feedback state
  const [keyboardFeedback, setKeyboardFeedback] = React.useState<{
    type: "play" | "pause" | "seek" | "volume" | "mute" | "unmute";
    value?: number; // For seek: accumulated seconds, for volume: percentage
  } | null>(null);
  const feedbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const seekAccumulatorRef = React.useRef<number>(0);
  const seekAccumulatorTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close rate dropdown on outside click
  React.useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!rateOpen) return;
      const wrap = rateWrapRef.current;
      if (wrap && !wrap.contains(e.target as Node)) {
        setRateOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [rateOpen]);

  // Auto-hide controls
  React.useEffect(() => {
    if (!autoHide || showOnHover) return;

    const resetTimer = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(true);
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, autoHideDelay);
    };

    const handleMouseMove = () => resetTimer();
    const handleMouseLeave = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, autoHideDelay);
    };

    resetTimer();
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [autoHide, autoHideDelay, showOnHover]);

  // Helper to show keyboard feedback
  const showFeedback = (type: "play" | "pause" | "seek" | "volume" | "mute" | "unmute", value?: number) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setKeyboardFeedback({ type, value });
    feedbackTimerRef.current = setTimeout(() => {
      setKeyboardFeedback(null);
    }, 800);
  };

  // Helper for seek accumulation
  const accumulateSeek = (seconds: number) => {
    if (seekAccumulatorTimerRef.current) clearTimeout(seekAccumulatorTimerRef.current);
    seekAccumulatorRef.current += seconds;
    showFeedback("seek", seekAccumulatorRef.current);
    seekAccumulatorTimerRef.current = setTimeout(() => {
      seekAccumulatorRef.current = 0;
    }, 1000);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          onTogglePlay?.();
          showFeedback(playing ? "pause" : "play");
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + Left: skip backward
            onSkip?.(-skipSeconds);
            accumulateSeek(-skipSeconds);
          } else {
            // Left: seek backward 5s
            {
              const newTime = Math.max(0, value - 5);
              onChange(newTime);
              onCommit?.(newTime);
            }
            accumulateSeek(-5);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + Right: skip forward
            onSkip?.(skipSeconds);
            accumulateSeek(skipSeconds);
          } else {
            // Right: seek forward 5s
            {
              const newTime = Math.min(max, value + 5);
              onChange(newTime);
              onCommit?.(newTime);
            }
            accumulateSeek(5);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (onVolumeChange && volume !== undefined) {
            const newVolume = Math.min(1, volume + 0.05);
            onVolumeChange(newVolume);
            showFeedback("volume", Math.round(newVolume * 100));
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (onVolumeChange && volume !== undefined) {
            const newVolume = Math.max(0, volume - 0.05);
            onVolumeChange(newVolume);
            showFeedback("volume", Math.round(newVolume * 100));
          }
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onToggleFullscreen?.();
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          onToggleMute?.();
          showFeedback(muted ? "unmute" : "mute");
          break;
        case "j":
          e.preventDefault();
          onSkip?.(-skipSeconds);
          accumulateSeek(-skipSeconds);
          break;
        case "l":
          e.preventDefault();
          onSkip?.(skipSeconds);
          accumulateSeek(skipSeconds);
          break;
        default:
          // 0-9 keys: jump to percentage
          if (e.key >= "0" && e.key <= "9") {
            e.preventDefault();
            const percent = parseInt(e.key) * 10;
            const newTime = (percent / 100) * max;
            onChange(newTime);
            onCommit?.(newTime);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enableKeyboardShortcuts,
    mode,
    onTogglePlay,
    onSkip,
    skipSeconds,
    onChange,
    value,
    max,
    onVolumeChange,
    volume,
    onToggleFullscreen,
    onToggleMute,
    playing,
    muted,
  ]);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Handle slider hover for preview
  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const time = percent * max;

    // Always show preview, optionally with thumbnail if onSeekPreview is provided
    const thumbnailUrl = onSeekPreview ? onSeekPreview(time) : undefined;
    setPreviewData({ time, x: e.clientX - rect.left, url: thumbnailUrl });
  };

  const handleSliderMouseLeave = () => {
    setPreviewData(null);
  };

  return (
    <>
      {/* Keyboard feedback overlay */}
      {keyboardFeedback && (
        <div
          className={cn(
            "absolute inset-0 flex items-center pointer-events-none z-50",
            keyboardFeedback.type === "seek" && (keyboardFeedback.value ?? 0) > 0
              ? "justify-end pr-32"
              : keyboardFeedback.type === "seek" && (keyboardFeedback.value ?? 0) < 0
              ? "justify-start pl-32"
              : "justify-center"
          )}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4 shadow-xl border border-white/10 animate-in fade-in zoom-in duration-200">
            {keyboardFeedback.type === "play" && <Play className="w-16 h-16 text-white" fill="white" />}
            {keyboardFeedback.type === "pause" && <Pause className="w-16 h-16 text-white" fill="white" />}
            {keyboardFeedback.type === "seek" && (
              <div className="flex items-center gap-3">
                {(keyboardFeedback.value ?? 0) > 0 ? <RotateCw className="w-12 h-12 text-white" /> : <RotateCcw className="w-12 h-12 text-white" />}
                <span className="text-3xl font-bold text-white">
                  {keyboardFeedback.value && keyboardFeedback.value > 0 ? "+" : ""}
                  {keyboardFeedback.value}s
                </span>
              </div>
            )}
            {keyboardFeedback.type === "volume" && (
              <div className="flex items-center gap-3">
                <Volume2 className="w-12 h-12 text-white" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xl font-bold text-white">{keyboardFeedback.value}%</span>
                  <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${keyboardFeedback.value}%` }} />
                  </div>
                </div>
              </div>
            )}
            {keyboardFeedback.type === "mute" && <VolumeX className="w-16 h-16 text-white" />}
            {keyboardFeedback.type === "unmute" && <Volume2 className="w-16 h-16 text-white" />}
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 pb-2 pt-8 bg-linear-to-t from-black/40 to-transparent z-20 transition-opacity duration-200",
          hoverClasses,
          autoHide && !controlsVisible && "opacity-0 pointer-events-none",
          className
        )}
      >
        <div className="px-4">
          <div ref={sliderRef} onMouseMove={handleSliderMouseMove} onMouseLeave={handleSliderMouseLeave} className="relative">
            <Slider
              min={0}
              max={max || 0}
              step={step}
              value={dragValue}
              onValueChange={(v) => {
                setIsDragging(true);
                setDragValue(v);
                onChange(v);
              }}
              onMouseUp={() => {
                onCommit?.(dragValue);
                setIsDragging(false);
              }}
              onTouchEnd={() => {
                onCommit?.(dragValue);
                setIsDragging(false);
              }}
              trackClassName="bg-muted"
              size="sm"
              noFocus
            />

            {/* Preview thumbnail */}
            {previewData && (
              <div className="absolute bottom-full mb-2 transform -translate-x-1/2 pointer-events-none z-30" style={{ left: `${previewData.x}px` }}>
                {previewData.url ? (
                  <div className="bg-background/95 backdrop-blur rounded-md border border-border shadow-lg overflow-hidden">
                    <img src={previewData.url} alt="Preview" className="w-40 h-24 object-cover" />
                    <div className="px-2 py-1 text-xs font-mono text-center bg-background/80">{formatTime(previewData.time)}</div>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-md bg-background/90 backdrop-blur border border-border shadow-lg">
                    <div className="text-xs font-mono text-center">{formatTime(previewData.time)}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {showControlsBar && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onTogglePlay}
                  title={playing ? "Tạm dừng" : "Phát"}
                  className="bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                {/* Skip backward button */}
                {onSkip && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSkip(-skipSeconds)}
                    title={`Lùi ${skipSeconds}s`}
                    className="bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}

                {/* Skip forward button */}
                {onSkip && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSkip(skipSeconds)}
                    title={`Tua ${skipSeconds}s`}
                    className="bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                )}

                {(showTime ?? true) && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-background/60 text-foreground shadow-sm border border-border whitespace-nowrap">
                    {formatTime(dragValue)} / {formatTime(max)}
                  </span>
                )}

                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMute}
                    title={muted ? "Bật tiếng" : "Tắt tiếng"}
                    className="bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                  >
                    {muted || (volume ?? 1) === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <div className="w-24">
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={Math.max(0, Math.min(volume ?? 1, 1))}
                      onValueChange={(v) => onVolumeChange?.(v)}
                      trackClassName="bg-muted"
                      size="sm"
                      noFocus
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">
                {onGoLive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGoLive}
                    title="Trực tiếp (về Live)"
                    className="bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                  >
                    <Dot className="w-10 h-10 text-destructive" />
                    Trực tiếp
                  </Button>
                )}
                {onChangeRate && (
                  <div className="relative" ref={rateWrapRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRateOpen((o) => !o)}
                      title="Tốc độ phát"
                      className="bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                    >
                      {rate}x
                    </Button>
                    {rateOpen && (
                      <div className="absolute bottom-9 right-0 bg-background/90 backdrop-blur rounded-md border border-border shadow-lg p-1 z-30">
                        {[0.5, 0.75, 1, 1.25, 1.5].map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              onChangeRate(r);
                              setRateOpen(false);
                            }}
                            className={cn("block w-full text-left px-3 py-1 text-sm rounded hover:bg-accent", rate === r && "bg-accent")}
                          >
                            {r}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {onToggleFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFullscreen}
                    title="Toàn màn hình"
                    className="px-3 bg-background/60 hover:bg-background/80 border-transparent shadow-sm outline-none focus:outline-none focus:ring-0"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

