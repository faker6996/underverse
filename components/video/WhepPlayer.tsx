"use client";

import { useEffect, useRef, useState } from "react";

interface WhepPlayerProps {
  path?: string; // mediamtx path name
  className?: string;
  muted?: boolean;
  controls?: boolean;
  showUnmute?: boolean;
}

export default function WhepPlayer({ path = "cam1", className, muted = true, controls = false, showUnmute = true }: WhepPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const locationRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(muted);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pc = new RTCPeerConnection();
        pcRef.current = pc;
        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });

        const ensureStream = () => {
          const v = videoRef.current;
          if (!v) return null;
          let s = v.srcObject as MediaStream | null;
          if (!s) {
            s = new MediaStream();
            v.srcObject = s;
          }
          return s;
        };

        pc.ontrack = (ev) => {
          if (!mounted) return;
          const v = videoRef.current;
          if (!v) return;
          const [stream] = ev.streams;
          if (stream) {
            if (!v.srcObject) {
              v.srcObject = stream;
            } else {
              const dst = ensureStream();
              if (dst) {
                stream.getTracks().forEach(t => { try { dst.addTrack(t); } catch {} });
              }
            }
          } else if (ev.track) {
            const dst = ensureStream();
            if (dst) {
              try { dst.addTrack(ev.track); } catch {}
            }
          }
          v.play().catch(() => {});
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const res = await fetch(`/api/webrtc/whep?path=${encodeURIComponent(path)}`, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp || "",
        });

        const answer = await res.text();
        locationRef.current = res.headers.get("x-location");
        await pc.setRemoteDescription({ type: "answer", sdp: answer });
      } catch (e: any) {
        setError(e?.message || "Failed to start WebRTC");
      }
    })();

    return () => {
      mounted = false;
      const pc = pcRef.current;
      try { pc && pc.close(); } catch {}
      const loc = locationRef.current;
      if (loc) {
        // Silent cleanup - ignore 404 if session already closed
        fetch(`/api/webrtc/whep?location=${encodeURIComponent(loc)}`, { method: "DELETE" })
          .catch((err) => {
            // Suppress error logging for expected 404 during component unmount
            if (err.status !== 404) {
              console.warn('[WhepPlayer] Cleanup failed:', err);
            }
          });
      }
    };
  }, [path]);

  const handleUnmute = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = false;
      setIsMuted(false);
      await v.play().catch(() => {});
    } catch {}
  };

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <video ref={videoRef} autoPlay muted={isMuted} controls={controls} playsInline className="w-full h-full object-contain bg-black" />
      {showUnmute && isMuted && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Unmute"
          onClick={(e) => { e.stopPropagation(); handleUnmute(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleUnmute(); } }}
          className="absolute bottom-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded shadow cursor-pointer select-none"
        >
          Unmute
        </div>
      )}
      {error && <div className="absolute bottom-2 left-2 text-xs bg-background/70 px-2 py-1 rounded">{error}</div>}
    </div>
  );
}
