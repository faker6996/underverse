"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Combobox } from "@/components/ui/Combobox";
import { Tabs } from "@/components/ui/Tab";
import { Camera, Map } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SettingsContainerProps {
  className?: string;
}

export default function SettingsContainer({ className }: SettingsContainerProps) {
  const { addToast } = useToast();

  // Local camera form state (UI only for now)
  const [name, setName] = useState("");
  const [rtsp, setRtsp] = useState("");
  const [streamMode, setStreamMode] = useState<"main" | "sub">("main");
  const [detectedResolution, setDetectedResolution] = useState<string>("");
  const [detectedFps, setDetectedFps] = useState<string>("");
  const [testing, setTesting] = useState(false);

  const handleSaveCamera = () => {
    // Placeholder action
    addToast({ type: "success", title: "Đã lưu", message: "Đã lưu cấu hình camera", duration: 3000 });
  };

  const handleTestCamera = async () => {
    if (!rtsp) {
      addToast({ type: "error", message: "Vui lòng nhập RTSP URL" });
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/cameras/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rtsp_url: rtsp, stream_mode: streamMode }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || "Test thất bại");
      const { width, height, fps } = json.data || {};
      setDetectedResolution(width && height ? `${width}x${height}` : "");
      setDetectedFps(typeof fps !== "undefined" && fps !== null ? String(fps) : "");
      addToast({ type: "success", message: "Kết nối camera thành công" });
    } catch (e: any) {
      addToast({ type: "error", message: e?.message || "Không thể kiểm tra camera" });
    } finally {
      setTesting(false);
    }
  };

  const cameraTab = {
    label: "Cài đặt Camera",
    value: "camera",
    icon: Camera,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Tên camera" placeholder="VD: Sân 1" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="RTSP URL" placeholder="rtsp://user:pass@host:554/…" value={rtsp} onChange={(e) => setRtsp(e.target.value)} />
          <Combobox
            label="Chế độ stream"
            placeholder="Chọn chế độ"
            value={streamMode}
            onChange={(v) => setStreamMode((v as any) || "main")}
            options={[
              { label: "Main stream", value: "main" },
              { label: "Sub stream", value: "sub" },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Độ phân giải (phát hiện)" value={detectedResolution} placeholder="--" readOnly />
            <Input label="FPS (phát hiện)" value={detectedFps} placeholder="--" readOnly />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSaveCamera}>Lưu</Button>
          <Button variant="outline" onClick={() => { setName(""); setRtsp(""); setDetectedResolution(""); setDetectedFps(""); }}>Đặt lại</Button>
          <Button variant="default" onClick={handleTestCamera} loading={testing}>Test camera</Button>
        </div>
      </div>
    ),
  } as const;

  // Map 2D upload
  const [mapPreview, setMapPreview] = useState<string>("");
  const [mapFileName, setMapFileName] = useState<string>("");
  const [mapUploading, setMapUploading] = useState(false);

  const handleMapFile = async (file: File) => {
    setMapFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setMapPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMap = async () => {
    if (!mapPreview) {
      addToast({ type: "error", message: "Vui lòng chọn ảnh bản đồ" });
      return;
    }
    setMapUploading(true);
    try {
      // Parse data URL to get content type and base64 only
      const match = mapPreview.match(/^data:(.*?);base64,(.*)$/);
      const content_type = match?.[1] || null;
      const image_base64 = match?.[2] || mapPreview; // fallback if already base64 only

      const res = await fetch("/api/map2d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: mapFileName || null, content_type, image_base64 }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || "Tải bản đồ thất bại");
      addToast({ type: "success", message: "Đã lưu bản đồ 2D" });
    } catch (e: any) {
      addToast({ type: "error", message: e?.message || "Không thể lưu bản đồ" });
    } finally {
      setMapUploading(false);
    }
  };

  const mapTab = {
    label: "Bản đồ 2D",
    value: "map2d",
    icon: Map,
    content: (
      <div className="space-y-4">
        <div>
          <input
            id="map2d-file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleMapFile(f);
            }}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground file:cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-2">Hỗ trợ ảnh PNG/JPG. Ảnh sẽ được lưu dạng base64 trong cơ sở dữ liệu.</p>
        </div>

        {mapPreview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Xem trước</div>
              <div className="rounded-lg border border-border overflow-hidden bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mapPreview} alt="Map 2D preview" className="w-full h-auto" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="primary" onClick={handleSaveMap} loading={mapUploading}>Lưu bản đồ</Button>
              <Button variant="outline" onClick={() => { setMapPreview(""); setMapFileName(""); }}>Xoá</Button>
            </div>
          </div>
        )}
      </div>
    ),
  } as const;

  return (
    <div className={cn("container mx-auto px-6 py-8", className)}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">Quản lý cấu hình hệ thống</p>
        </div>

        <Tabs tabs={[cameraTab, mapTab]} variant="underline-card" size="md" />
      </div>
    </div>
  );
}
