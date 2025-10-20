import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  if (!file) return new Response("Missing file", { status: 400 });

  const dir = path.join("/tmp", "rtsp-hls");
  const full = path.join(dir, path.basename(file));
  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "video/MP2T", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
