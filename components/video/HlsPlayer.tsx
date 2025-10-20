"use client";

import { useEffect, useRef, useState } from "react";

interface HlsPlayerProps {
  src: string; // m3u8 URL
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export default function HlsPlayer({ src, poster, className, autoPlay = true, muted = true, controls = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: any = null;
    let destroyed = false;

    async function setup() {
      const video = videoRef.current;
      if (!video) return;

      // Native HLS support (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        try { await video.play().catch(() => {}); } catch {}
        return;
      }

      try {
        const Hls = (await import("hls.js")).default as any;
        if (destroyed) return;
        if (Hls.isSupported()) {
          hls = new Hls({
            maxLiveSyncPlaybackRate: 1.2,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 6,
            lowLatencyMode: true,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data?.fatal) setError(`HLS fatal: ${data?.type || "error"}`);
          });
        } else {
          setError("HLS not supported (no MSE)");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load hls.js");
      }
    }

    setup();
    return () => {
      destroyed = true;
      try { (hls && hls.destroy && hls.destroy()); } catch {}
    };
  }, [src]);

  return (
    <div className={className}>
      <video ref={videoRef} poster={poster} autoPlay={autoPlay} muted={muted} controls={controls} playsInline className="w-full h-full object-contain bg-black" />
      {error && (
        <div className="absolute bottom-2 left-2 text-xs bg-background/70 px-2 py-1 rounded">{error}</div>
      )}
    </div>
  );
}

