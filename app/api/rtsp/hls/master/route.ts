import { NextRequest } from "next/server";
import { spawn, type ChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HlsProc = {
  proc: ChildProcess;
  dir: string;
  url: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __RTSP_HLS__: HlsProc | undefined;
}

const ensureDir = async (dir: string) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
};

const startFfmpegIfNeeded = async (rtspUrl: string) => {
  const dir = path.join("/tmp", "rtsp-hls");
  await ensureDir(dir);

  // Restart if URL changed or process not running
  if (global.__RTSP_HLS__?.proc && global.__RTSP_HLS__.url === rtspUrl) {
    return global.__RTSP_HLS__;
  }
  try {
    global.__RTSP_HLS__?.proc.kill("SIGKILL");
  } catch {}

  const outPath = path.join(dir, "index.m3u8");

  const args = [
    "-rtsp_transport", "tcp",
    "-i", rtspUrl,
    "-an",
    // Try stream copy for low CPU and latency (most IP cams output H.264)
    "-c:v", "copy",
    // HLS params (short segments)
    "-f", "hls",
    "-hls_time", "1",
    "-hls_list_size", "6",
    "-hls_flags", "delete_segments+append_list+independent_segments",
    path.basename(outPath),
  ];

  const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "ignore"], cwd: dir });
  global.__RTSP_HLS__ = { proc, dir, url: rtspUrl };
  return global.__RTSP_HLS__;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rtspUrl =
    searchParams.get("url") ||
    process.env.REFEREE_RTSP_URL ||
    process.env.RTSP_URL ||
    process.env.NEXT_PUBLIC_RTSP_URL ||
    "";
  if (!rtspUrl) {
    return new Response("Missing RTSP URL. Provide ?url=... or set REFEREE_RTSP_URL.", { status: 400 });
  }

  const { dir } = await startFfmpegIfNeeded(rtspUrl);
  const m3u8Path = path.join(dir, "index.m3u8");

  try {
    const raw = await fs.readFile(m3u8Path, "utf8");
    // Rewrite segment URIs to our proxy route
    const rewritten = raw.replace(/^(.*\.ts)$/gm, (line) => `/api/rtsp/hls/segment?file=${encodeURIComponent(line.trim())}`);
    return new Response(rewritten, {
      headers: { "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" },
    });
  } catch {
    // If file not ready yet, instruct player to retry soon
    return new Response("#EXTM3U\n# Waiting for stream...", {
      headers: { "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" },
      status: 200,
    });
  }
}
