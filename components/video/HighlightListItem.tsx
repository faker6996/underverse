"use client";

import Button from "@/components/ui/Button";

interface HighlightListItemProps {
  title: string;
  timestamp: string | null;
  duration?: string;
  isActive?: boolean; // Whether this highlight is currently playing on PROGRAM
  onPlay: () => void;
}

export default function HighlightListItem({
  title,
  timestamp,
  duration = "15s",
  isActive = false,
  onPlay,
}: HighlightListItemProps) {
  // Format timestamp for display (HH:MM:SS - duration)
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
      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
        isActive
          ? "bg-warning/20 border-2 border-warning shadow-lg"
          : "bg-muted hover:bg-muted/70"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{title}</div>
        <div className="text-xs text-muted-foreground">
          {formatTimestamp(timestamp)} - {duration}
        </div>
      </div>
      <Button
        size="sm"
        variant={isActive ? "warning" : "primary"}
        onClick={onPlay}
        className="ml-3"
      >
        {isActive ? "Playing" : "Play"}
      </Button>
    </div>
  );
}
