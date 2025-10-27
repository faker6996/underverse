"use client";

import React from "react";
import OverlayControls from "@/components/ui/OverlayControls";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function OverlayControlsExample() {
  const [time, setTime] = React.useState(12);
  const [duration, setDuration] = React.useState(120);
  const [playing, setPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(0.7);
  const [muted, setMuted] = React.useState(false);
  const [rate, setRate] = React.useState(1);

  // Fake timer when playing
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        const next = Math.min(duration, t + 0.2 * rate);
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing, duration, rate]);

  const code =
    `import { OverlayControls } from '@underverse-ui/underverse'\n\n` +
    `const [time, setTime] = useState(12)\n` +
    `const [duration] = useState(120)\n` +
    `const [playing, setPlaying] = useState(false)\n` +
    `const [volume, setVolume] = useState(0.7)\n` +
    `const [muted, setMuted] = useState(false)\n` +
    `const [rate, setRate] = useState(1)\n\n` +
    `<div className="relative group aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">\n` +
    `  {/* Fake player canvas */}\n` +
    `  <div className="absolute inset-0 grid place-items-center text-muted-foreground">Video Placeholder</div>\n` +
    `  <OverlayControls\n` +
    `    mode="review"\n` +
    `    value={time}\n` +
    `    max={duration}\n` +
    `    onChange={setTime}\n` +
    `    onCommit={(t) => setTime(t)}\n` +
    `    playing={playing}\n` +
    `    onTogglePlay={() => setPlaying((p) => !p)}\n` +
    `    skipSeconds={10}\n` +
    `    onSkip={(s) => setTime((t) => Math.max(0, Math.min(duration, t + s)))}\n` +
    `    volume={volume}\n` +
    `    muted={muted}\n` +
    `    onVolumeChange={setVolume}\n` +
    `    onToggleMute={() => setMuted((m) => !m)}\n` +
    `    rate={rate}\n` +
    `    onChangeRate={setRate}\n` +
    `    onToggleFullscreen={() => alert('Toggle fullscreen')}\n` +
    `    autoHide\n` +
    `    autoHideDelay={2500}\n` +
    `  />\n` +
    `</div>`;

  const demo = (
    <div className="space-y-3">
      <div className="relative group aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">
        {/* Fake player canvas */}
        <div className="absolute inset-0 grid place-items-center text-muted-foreground select-none pointer-events-none">
          Video Placeholder
        </div>
        <OverlayControls
          mode="review"
          value={time}
          max={duration}
          onChange={setTime}
          onCommit={(t) => setTime(t)}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          skipSeconds={10}
          onSkip={(s) => setTime((t) => Math.max(0, Math.min(duration, t + s)))}
          volume={volume}
          muted={muted}
          onVolumeChange={setVolume}
          onToggleMute={() => setMuted((m) => !m)}
          rate={rate}
          onChangeRate={setRate}
          onToggleFullscreen={() => alert("Toggle fullscreen")}
          autoHide
          autoHideDelay={2500}
        />
      </div>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

