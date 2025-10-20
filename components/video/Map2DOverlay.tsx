"use client";

import Button from "@/components/ui/Button";

interface Map2DOverlayProps {
  imageBase64: string;
  contentType?: string;
  onClose?: () => void;
}

export default function Map2DOverlay({
  imageBase64,
  contentType = "image/png",
  onClose,
}: Map2DOverlayProps) {
  // Construct data URL from base64
  const imageUrl = `data:${contentType};base64,${imageBase64}`;

  return (
    <div className="absolute top-4 right-4 z-20 w-64 md:w-80 bg-background/95 backdrop-blur-sm border-2 border-primary rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-foreground">Hawk-Eye 3D Court Map</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
            title="Đóng bản đồ"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>

      {/* Map Image */}
      <div className="relative aspect-video bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="2D Court Map"
          className="w-full h-full object-contain"
        />

        {/* Optional: Ball position indicator (placeholder) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-warning rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-3 h-3 bg-warning rounded-full"></div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 bg-muted/50 border-t border-border">
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Real-time tracking</span>
          <span className="text-success font-semibold">● ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
