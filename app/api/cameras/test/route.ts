import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rtsp_url = String(body?.rtsp_url || "").trim();
    const stream_mode = (String(body?.stream_mode || "main").toLowerCase() as "main" | "sub");

    if (!rtsp_url) {
      return Response.json({ success: false, error: "Missing rtsp_url" }, { status: 400 });
    }

    // Placeholder: In real implementation, forward this RTSP to a probe service (e.g., ffprobe worker)
    // For now, return a mocked detection so UI can proceed.
    const mocked = {
      width: 1920,
      height: 1080,
      fps: 30,
      streamMode: stream_mode,
    };

    return Response.json({ success: true, data: mocked });
  } catch (err) {
    return Response.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

