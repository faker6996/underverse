import { NextRequest } from "next/server";
import { spawn } from "child_process";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Stream RTSP as MJPEG multipart for simple <img> preview in browsers.
// WARNING: This is for development/debug preview only (no audio, CPU heavy).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Prefer query ?url=..., otherwise fallback to environment
  const rtspUrl =
    searchParams.get("url") ||
    process.env.REFEREE_RTSP_URL ||
    process.env.RTSP_URL ||
    process.env.NEXT_PUBLIC_RTSP_URL ||
    "";

  if (!rtspUrl) {
    return new Response("Missing RTSP URL. Provide ?url=... or set REFEREE_RTSP_URL.", {
      status: 400,
    });
  }

  const boundary = "mjpeg-boundary";

  const headers = new Headers();
  headers.set("Content-Type", `multipart/x-mixed-replace; boundary=${boundary}`);
  headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Connection", "close");

  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      // Try using system ffmpeg to pull frames
      const args = [
        "-rtsp_transport",
        "tcp",
        "-i",
        rtspUrl,
        "-an", // no audio
        "-vf",
        "fps=10", // limit frame rate for dev
        "-f",
        "image2pipe",
        "-qscale:v",
        "5",
        "-vcodec",
        "mjpeg",
        "pipe:1",
      ];

      let ffmpeg: ReturnType<typeof spawn> | null = null;
      try {
        ffmpeg = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
      } catch (e) {
        controller.enqueue(
          new TextEncoder().encode(
            `--${boundary}\r\nContent-Type: text/plain\r\n\r\nffmpeg not found on server. Please install ffmpeg.\r\n\r\n`
          )
        );
        controller.close();
        return;
      }

      // Buffer to extract complete JPEG frames (SOI 0xFFD8 ... EOI 0xFFD9)
      let buffer = Buffer.alloc(0);

      const pushFrame = (jpeg: Buffer) => {
        const header = `--${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`;
        controller.enqueue(new TextEncoder().encode(header));
        controller.enqueue(jpeg);
        controller.enqueue(new TextEncoder().encode("\r\n"));
      };

      ffmpeg.stdout?.on("data", (chunk: Buffer) => {
        buffer = Buffer.concat([buffer, chunk]);
        // find JPEG frames
        let start = buffer.indexOf(Buffer.from([0xff, 0xd8]));
        let end = buffer.indexOf(Buffer.from([0xff, 0xd9]), start + 2);
        while (start !== -1 && end !== -1) {
          const frame = buffer.subarray(start, end + 2);
          pushFrame(frame);
          buffer = buffer.subarray(end + 2);
          start = buffer.indexOf(Buffer.from([0xff, 0xd8]));
          end = buffer.indexOf(Buffer.from([0xff, 0xd9]), start + 2);
        }
      });

      const sendText = (text: string) => {
        controller.enqueue(
          new TextEncoder().encode(
            `--${boundary}\r\nContent-Type: text/plain\r\n\r\n${text}\r\n\r\n`
          )
        );
      };

      ffmpeg.stderr?.on("data", () => {
        // Be quiet or log minimal; avoid flooding the stream
      });

      const closeAll = () => {
        try { ffmpeg?.kill("SIGKILL"); } catch {}
        controller.close();
      };

      ffmpeg.on("error", (err) => {
        sendText(`ffmpeg error: ${String(err?.message || err)}`);
        closeAll();
      });

      ffmpeg.on("close", (code) => {
        sendText(`ffmpeg exited (${code}).`);
        closeAll();
      });

      // Abort when client disconnects
      const abort = (req as any).signal as AbortSignal | undefined;
      if (abort) {
        abort.addEventListener("abort", () => {
          try { ffmpeg?.kill("SIGKILL"); } catch {}
        });
      }
    },
    cancel() {
      // Consumer closed
    },
  });

  return new Response(readable, { headers });
}
