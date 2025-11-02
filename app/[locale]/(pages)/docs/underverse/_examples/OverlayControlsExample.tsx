"use client";

import React from "react";
import OverlayControls from "@/components/ui/OverlayControls";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function OverlayControlsExample() {
  // Review mode with auto-hide
  const [time1, setTime1] = React.useState(12);
  const [duration1] = React.useState(120);
  const [playing1, setPlaying1] = React.useState(false);
  const [volume1, setVolume1] = React.useState(0.7);
  const [muted1, setMuted1] = React.useState(false);
  const [rate1, setRate1] = React.useState(1);

  // Live mode
  const [playing2, setPlaying2] = React.useState(true);
  const [volume2, setVolume2] = React.useState(0.8);
  const [muted2, setMuted2] = React.useState(false);

  // Without auto-hide
  const [time3, setTime3] = React.useState(30);
  const [duration3] = React.useState(180);
  const [playing3, setPlaying3] = React.useState(false);
  const [volume3, setVolume3] = React.useState(0.6);
  const [muted3, setMuted3] = React.useState(false);
  const [rate3, setRate3] = React.useState(1);

  // Custom skip seconds
  const [time4, setTime4] = React.useState(45);
  const [duration4] = React.useState(300);
  const [playing4, setPlaying4] = React.useState(false);
  const [volume4, setVolume4] = React.useState(0.5);
  const [muted4, setMuted4] = React.useState(false);
  const [rate4, setRate4] = React.useState(1);

  // Fake timer for review mode 1
  React.useEffect(() => {
    if (!playing1) return;
    const id = setInterval(() => {
      setTime1((t) => {
        const next = Math.min(duration1, t + 0.2 * rate1);
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing1, duration1, rate1]);

  // Fake timer for review mode 3
  React.useEffect(() => {
    if (!playing3) return;
    const id = setInterval(() => {
      setTime3((t) => {
        const next = Math.min(duration3, t + 0.2 * rate3);
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing3, duration3, rate3]);

  // Fake timer for review mode 4
  React.useEffect(() => {
    if (!playing4) return;
    const id = setInterval(() => {
      setTime4((t) => {
        const next = Math.min(duration4, t + 0.2 * rate4);
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing4, duration4, rate4]);

  const code =
    `import { OverlayControls } from '@underverse-ui/underverse'\n` +
    `import { useState, useEffect } from 'react'\n\n` +
    `// Review Mode with Auto-hide\n` +
    `const [time, setTime] = useState(12)\n` +
    `const [duration] = useState(120)\n` +
    `const [playing, setPlaying] = useState(false)\n` +
    `const [volume, setVolume] = useState(0.7)\n` +
    `const [muted, setMuted] = useState(false)\n` +
    `const [rate, setRate] = useState(1)\n\n` +
    `<div className="relative group aspect-video w-full rounded-lg overflow-hidden bg-muted">\n` +
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
    `</div>\n\n` +
    `// Live Mode\n` +
    `<div className="relative group aspect-video w-full rounded-lg overflow-hidden bg-muted">\n` +
    `  <div className="absolute inset-0 grid place-items-center text-muted-foreground">\n` +
    `    <div className="text-center">\n` +
    `      <p>Live Stream</p>\n` +
    `      <p className="text-xs mt-1 text-destructive font-medium">● LIVE</p>\n` +
    `    </div>\n` +
    `  </div>\n` +
    `  <OverlayControls\n` +
    `    mode="live"\n` +
    `    value={0}\n` +
    `    max={0}\n` +
    `    playing={playing}\n` +
    `    onTogglePlay={() => setPlaying((p) => !p)}\n` +
    `    volume={volume}\n` +
    `    muted={muted}\n` +
    `    onVolumeChange={setVolume}\n` +
    `    onToggleMute={() => setMuted((m) => !m)}\n` +
    `    onToggleFullscreen={() => alert('Toggle fullscreen')}\n` +
    `  />\n` +
    `</div>\n\n` +
    `// Without Auto-hide\n` +
    `<OverlayControls\n` +
    `  mode="review"\n` +
    `  value={time}\n` +
    `  max={duration}\n` +
    `  onChange={setTime}\n` +
    `  onCommit={(t) => setTime(t)}\n` +
    `  playing={playing}\n` +
    `  onTogglePlay={() => setPlaying((p) => !p)}\n` +
    `  skipSeconds={10}\n` +
    `  onSkip={(s) => setTime((t) => Math.max(0, Math.min(duration, t + s)))}\n` +
    `  volume={volume}\n` +
    `  muted={muted}\n` +
    `  onVolumeChange={setVolume}\n` +
    `  onToggleMute={() => setMuted((m) => !m)}\n` +
    `  rate={rate}\n` +
    `  onChangeRate={setRate}\n` +
    `  onToggleFullscreen={() => alert('Toggle fullscreen')}\n` +
    `  autoHide={false}\n` +
    `/>\n\n` +
    `// Custom Skip Seconds (30s)\n` +
    `<OverlayControls\n` +
    `  mode="review"\n` +
    `  value={time}\n` +
    `  max={duration}\n` +
    `  onChange={setTime}\n` +
    `  onCommit={(t) => setTime(t)}\n` +
    `  playing={playing}\n` +
    `  onTogglePlay={() => setPlaying((p) => !p)}\n` +
    `  skipSeconds={30}\n` +
    `  onSkip={(s) => setTime((t) => Math.max(0, Math.min(duration, t + s)))}\n` +
    `  volume={volume}\n` +
    `  muted={muted}\n` +
    `  onVolumeChange={setVolume}\n` +
    `  onToggleMute={() => setMuted((m) => !m)}\n` +
    `  rate={rate}\n` +
    `  onChangeRate={setRate}\n` +
    `  onToggleFullscreen={() => alert('Toggle fullscreen')}\n` +
    `  autoHide\n` +
    `/>`;;

  const demo = (
    <div className="space-y-6">
      {/* Review Mode with Auto-hide */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Review Mode with Auto-hide</p>
        <div className="relative group aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">
          <div className="absolute inset-0 grid place-items-center text-muted-foreground select-none pointer-events-none">
            Video Placeholder
          </div>
          <OverlayControls
            mode="review"
            value={time1}
            max={duration1}
            onChange={setTime1}
            onCommit={(t) => setTime1(t)}
            playing={playing1}
            onTogglePlay={() => setPlaying1((p) => !p)}
            skipSeconds={10}
            onSkip={(s) => setTime1((t) => Math.max(0, Math.min(duration1, t + s)))}
            volume={volume1}
            muted={muted1}
            onVolumeChange={setVolume1}
            onToggleMute={() => setMuted1((m) => !m)}
            rate={rate1}
            onChangeRate={setRate1}
            onToggleFullscreen={() => alert("Toggle fullscreen")}
            autoHide
            autoHideDelay={2500}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Controls auto-hide after inactivity. Supports keyboard shortcuts and playback rate control.
        </p>
      </div>

      {/* Live Mode */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Live Mode</p>
        <div className="relative group aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">
          <div className="absolute inset-0 grid place-items-center text-muted-foreground select-none pointer-events-none">
            <div className="text-center">
              <p>Live Stream</p>
              <p className="text-xs mt-1 text-destructive font-medium">● LIVE</p>
            </div>
          </div>
          <OverlayControls
            mode="live"
            value={0}
            max={0}
            onChange={() => {}}
            playing={playing2}
            onTogglePlay={() => setPlaying2((p) => !p)}
            volume={volume2}
            muted={muted2}
            onVolumeChange={setVolume2}
            onToggleMute={() => setMuted2((m) => !m)}
            onToggleFullscreen={() => alert("Toggle fullscreen")}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Live mode shows no progress bar, skip buttons, or playback rate controls
        </p>
      </div>

      {/* Without Auto-hide */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Without Auto-hide</p>
        <div className="relative group aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">
          <div className="absolute inset-0 grid place-items-center text-muted-foreground select-none pointer-events-none">
            Video Placeholder
          </div>
          <OverlayControls
            mode="review"
            value={time3}
            max={duration3}
            onChange={setTime3}
            onCommit={(t) => setTime3(t)}
            playing={playing3}
            onTogglePlay={() => setPlaying3((p) => !p)}
            skipSeconds={10}
            onSkip={(s) => setTime3((t) => Math.max(0, Math.min(duration3, t + s)))}
            volume={volume3}
            muted={muted3}
            onVolumeChange={setVolume3}
            onToggleMute={() => setMuted3((m) => !m)}
            rate={rate3}
            onChangeRate={setRate3}
            onToggleFullscreen={() => alert("Toggle fullscreen")}
            autoHide={false}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Controls remain visible at all times
        </p>
      </div>

      {/* Custom Skip Seconds */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Skip Seconds (30s)</p>
        <div className="relative group aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">
          <div className="absolute inset-0 grid place-items-center text-muted-foreground select-none pointer-events-none">
            Video Placeholder
          </div>
          <OverlayControls
            mode="review"
            value={time4}
            max={duration4}
            onChange={setTime4}
            onCommit={(t) => setTime4(t)}
            playing={playing4}
            onTogglePlay={() => setPlaying4((p) => !p)}
            skipSeconds={30}
            onSkip={(s) => setTime4((t) => Math.max(0, Math.min(duration4, t + s)))}
            volume={volume4}
            muted={muted4}
            onVolumeChange={setVolume4}
            onToggleMute={() => setMuted4((m) => !m)}
            rate={rate4}
            onChangeRate={setRate4}
            onToggleFullscreen={() => alert("Toggle fullscreen")}
            autoHide
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Skip forward/backward buttons jump 30 seconds instead of 10
        </p>
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
