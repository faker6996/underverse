"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import WhepPlayer from "@/components/video/WhepPlayer";
import RecordedVideoPlayer from "@/components/video/RecordedVideoPlayer";
import HighlightListItem from "@/components/video/HighlightListItem";
import Map2DOverlay from "@/components/video/Map2DOverlay";

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

export default function OperatorInterface() {
  const [cameras] = useState<Camera[]>(DEFAULT_CAMERAS);
  const [selectedCamera, setSelectedCamera] = useState<Camera>(cameras[0]);

  // Highlight replay state
  const [highlights, setHighlights] = useState<any[]>([]);
  const [playingHighlight, setPlayingHighlight] = useState<string | null>(null);
  const [isProgramShowingHighlight, setIsProgramShowingHighlight] = useState(false);

  // Hawk-Eye 3D Map overlay state
  const [showHawkEyeMap, setShowHawkEyeMap] = useState(false);
  const [map2DData, setMap2DData] = useState<{ image_base64: string; content_type: string } | null>(null);

  // Fetch available recordings (highlights) for current camera
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch(`/api/recordings?camera=${selectedCamera.path}&limit=3`);
        const result = await response.json();
        const data = result.data || result;
        const recordingsList = data.recordings || [];
        console.log(`[OperatorInterface] Loaded ${recordingsList.length} highlights for ${selectedCamera.path}`, recordingsList);
        setHighlights(recordingsList);
      } catch (error) {
        console.error("Failed to fetch highlights:", error);
        setHighlights([]);
      }
    };

    fetchHighlights();

    // If currently playing a highlight and camera changed, exit highlight mode
    if (isProgramShowingHighlight) {
      console.log(`[OperatorInterface] Camera changed, exiting highlight mode`);
      setIsProgramShowingHighlight(false);
      setPlayingHighlight(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera.path]);

  // Handle play highlight on PROGRAM screen
  const handlePlayHighlight = (videoUrl: string) => {
    console.log(`[OperatorInterface] Playing highlight on PROGRAM:`, videoUrl);
    setPlayingHighlight(videoUrl);
    setIsProgramShowingHighlight(true);
  };

  // Exit highlight mode and return to live stream
  const handleExitHighlight = () => {
    console.log(`[OperatorInterface] Exiting highlight mode, returning to live stream`);
    setIsProgramShowingHighlight(false);
    setPlayingHighlight(null);
  };

  // Fetch latest 2D map from API
  useEffect(() => {
    const fetchMap2D = async () => {
      try {
        const response = await fetch("/api/map2d");
        const result = await response.json();
        if (result.success && result.data) {
          const { image_base64, content_type } = result.data;
          setMap2DData({ image_base64, content_type: content_type || "image/png" });
          console.log("[OperatorInterface] Loaded 2D map from API");
        } else {
          console.log("[OperatorInterface] No 2D map available");
        }
      } catch (error) {
        console.error("[OperatorInterface] Failed to fetch 2D map:", error);
      }
    };

    fetchMap2D();
  }, []);

  // Toggle Hawk-Eye 3D map overlay
  const handleToggleHawkEye = () => {
    if (!map2DData) {
      alert("Chưa có bản đồ 2D. Vui lòng tải lên trong phần Cài đặt.");
      return;
    }
    setShowHawkEyeMap(!showHawkEyeMap);
    console.log(`[OperatorInterface] Hawk-Eye 3D map: ${!showHawkEyeMap ? "ON" : "OFF"}`);
  };

  return (
    <div className="grid grid-cols-[250px_1fr_320px] grid-rows-[auto_1fr_180px] gap-4 h-[calc(100vh-120px)] min-h-0 p-4">
      <div className="col-span-full">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Trận Đấu Pickleball - Live Broadcast</h2>
              <p className="text-sm text-muted-foreground">Court 1 | Nam Đơn - Vòng Tứ Kết</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="animate-pulse">
                  ● LIVE
                </Badge>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Recording</div>
                  <div className="font-bold">01:15:42</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">⚙️ Cài Đặt</Button>
                <Button variant="destructive">⏹ Dừng</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-2">
        <div className="text-xs text-muted-foreground px-2">Camera Inputs</div>
        {cameras.map((camera) => (
          <div
            key={camera.id}
            onClick={() => setSelectedCamera(camera)}
            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer aspect-video mb-2 ${
              selectedCamera.id === camera.id ? "border-destructive" : "border-transparent"
            }`}
          >
            <WhepPlayer path={camera.path} showUnmute={false} controls={false} />
            <div className="bg-background/80 text-xs rounded-sm px-1 absolute top-2 left-2">
              {camera.name} - {camera.label}
            </div>
            {selectedCamera.id === camera.id && <div className="w-2 h-2 bg-destructive rounded-full absolute top-2 right-2 animate-pulse"></div>}
          </div>
        ))}
      </Card>

      <div className="flex flex-col gap-4 h-full min-h-0">
        {isProgramShowingHighlight && playingHighlight ? (
          // PROGRAM showing highlight replay
          <Card className="h-full flex flex-col min-h-0 relative" innerClassName="h-full min-h-0" contentClassName="h-full min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="warning">📹 PROGRAM - HIGHLIGHT REPLAY</Badge>
              <Button variant="outline" size="sm" onClick={handleExitHighlight}>
                ← Quay lại Live
              </Button>
            </div>
            <div className="flex-1 min-h-0 relative">
              <RecordedVideoPlayer videoUrl={playingHighlight} className="h-full" autoPlay={true} />

              {/* Hawk-Eye 3D Map Overlay (also show on highlight) */}
              {showHawkEyeMap && map2DData && (
                <Map2DOverlay imageBase64={map2DData.image_base64} contentType={map2DData.content_type} onClose={() => setShowHawkEyeMap(false)} />
              )}
            </div>
          </Card>
        ) : (
          // PROGRAM showing live stream
          <Card
            className="h-full relative border-2 border-destructive overflow-hidden min-h-0"
            innerClassName="h-full min-h-0"
            contentClassName="h-full min-h-0 p-0"
            noPadding
          >
            <Badge className="absolute top-4 left-4 z-10" variant="destructive">
              🔴 PROGRAM - {selectedCamera.name} ({selectedCamera.label})
            </Badge>
            <div className="absolute inset-0">
              <WhepPlayer path={selectedCamera.path} key={selectedCamera.path} />
            </div>

            {/* Hawk-Eye 3D Map Overlay */}
            {showHawkEyeMap && map2DData && (
              <Map2DOverlay imageBase64={map2DData.image_base64} contentType={map2DData.content_type} onClose={() => setShowHawkEyeMap(false)} />
            )}

            <div className="absolute bottom-4 right-4 text-xs bg-background/80 px-2 py-1 rounded-sm z-10">1920x1080 @ 60fps</div>
          </Card>
        )}
        <Card className="h-[180px] relative border-2 border-warning overflow-hidden " noPadding>
          <Badge className="absolute top-2 left-2 z-10" variant="secondary">
            PREVIEW
          </Badge>
          <div className="grid grid-cols-3 gap-2 h-full pt-8">
            {highlights.length > 0 ? (
              highlights.slice(0, 3).map((highlight, i) => (
                <div
                  key={highlight.id}
                  className="relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handlePlayHighlight(highlight.path)}
                >
                  <video src={highlight.path} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">H{i + 1}</div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl mb-1">📹</div>
                  <div className="text-xs">Đang chờ highlights...</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="pb-2">
            <h3 className="text-base font-semibold">📊 Graphics Overlay</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Score", "Player Names", "Timer", "Set Info", "Challenge", "Stats", "Lower Third"].map((g) => (
              <Button variant="outline" key={g}>
                {g}
              </Button>
            ))}
            <Button
              variant={showHawkEyeMap ? "primary" : "outline"}
              onClick={handleToggleHawkEye}
              className={showHawkEyeMap ? "ring-2 ring-primary" : ""}
            >
              Hawk-Eye 3D
            </Button>
          </div>
        </Card>

        <Card>
          <div className="pb-2">
            <h3 className="text-base font-semibold">🎬 Video Highlights</h3>
            <p className="text-xs text-muted-foreground">3 recordings gần nhất - Click để phát lên PROGRAM</p>
          </div>
          <div>
            <div className="space-y-2">
              {highlights.length > 0 ? (
                highlights
                  .slice(0, 3)
                  .map((highlight, i) => (
                    <HighlightListItem
                      key={highlight.id}
                      title={`Highlight ${i + 1}`}
                      timestamp={highlight.timestamp}
                      duration="15s"
                      isActive={isProgramShowingHighlight && playingHighlight === highlight.path}
                      onPlay={() => handlePlayHighlight(highlight.path)}
                    />
                  ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <div className="text-3xl mb-2">📹</div>
                  <div>Không có highlights</div>
                  <div className="text-xs mt-1">Đang chờ recordings từ {selectedCamera.name}...</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="pb-2">
            <h3 className="text-base font-semibold">⚡ Quick Actions</h3>
          </div>
          <div className="grid gap-2">
            <Button variant="outline">Show Slow Motion</Button>
            <Button variant="outline">Show Statistics</Button>
            <Button variant="outline">Instant Replay</Button>
          </div>
        </Card>
      </div>

      {/* <div className="col-span-full">
        <Card>
          <div className="pb-2">
            <h3 className="text-base font-semibold">Video Switcher / Router</h3>
          </div>
          <div>
            <div className="grid grid-cols-4 gap-2">
              {cameras.map((camera) => (
                <Button
                  key={camera.id}
                  variant={selectedCamera.id === camera.id ? "destructive" : "outline"}
                  onClick={() => setSelectedCamera(camera)}
                  className="!h-auto !min-h-0 py-3 px-3"
                  asContainer
                >
                  <div className="flex flex-col items-center w-full gap-0.5">
                    <div className="font-semibold text-sm">{camera.name}</div>
                    <div className="text-xs text-muted-foreground">{camera.label}</div>
                    <div className={`text-xs mt-1 ${selectedCamera.id === camera.id ? "text-destructive-foreground/70" : "text-muted-foreground"}`}>
                      {selectedCamera.id === camera.id ? "● PGM" : " "}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button size="lg" variant="destructive">
                CUT (Auto)
              </Button>
              <Button size="lg" variant="outline">
                FADE
              </Button>
            </div>
          </div>
        </Card>
      </div> */}
    </div>
  );
}
