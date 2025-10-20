import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function withTrailing(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const primaryBase = withTrailing(process.env.MEDIAMTX_URL || "http://127.0.0.1:8889");
const fallbackBase = withTrailing(process.env.MEDIAMTX_FALLBACK_URL || "http://127.0.0.1:8888");

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "cam1";
  const targets = [
    `${primaryBase}/${encodeURIComponent(path)}/whep`,
    `${fallbackBase}/${encodeURIComponent(path)}/whep`,
  ];

  const sdp = await req.text();
  let lastErrText = "";
  for (const target of targets) {
    try {
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: sdp,
      });
      const answer = await res.text();
      if (!res.ok || !answer?.startsWith("v=")) {
        lastErrText = answer || `${res.status} ${res.statusText}`;
        continue;
      }
      const location = res.headers.get("location") || "";
      return new Response(answer, {
        status: 200,
        headers: {
          "Content-Type": "application/sdp",
          "x-location": location,
          "Cache-Control": "no-store",
        },
      });
    } catch (e: any) {
      lastErrText = e?.message || String(e);
      continue;
    }
  }
  return new Response(`WHEP negotiation failed. ${lastErrText}`, { status: 502 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");
  if (!location) return new Response("Missing location", { status: 400 });
  const isAbsolute = /^https?:\/\//i.test(location);

  const attempt = async (url: string) => {
    try {
      const res = await fetch(url, { method: "DELETE" });
      return res;
    } catch {
      return null;
    }
  };

  // If MediaMTX returned an absolute location, use it directly.
  if (isAbsolute) {
    const res = await attempt(location);
    if (res && (res.ok || res.status === 404 || res.status === 410)) {
      // Treat not-found/gone as already-cleaned; return 204 to avoid noisy logs
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: res ? res.status : 502 });
  }

  // Otherwise try both primary and fallback bases.
  const targets = [
    `${primaryBase}${location}`,
    `${fallbackBase}${location}`,
  ];

  let lastStatus = 0;
  for (const t of targets) {
    const res = await attempt(t);
    if (!res) continue; // network error, try next
    lastStatus = res.status;
    if (res.ok || res.status === 404 || res.status === 410) {
      // Consider 2xx/404/410 as successfully cleaned up
      return new Response(null, { status: 204 });
    }
  }

  // If both attempts failed with network error, surface 502; otherwise pass through last status
  if (lastStatus === 0) return new Response("WHEP DELETE failed: network error", { status: 502 });
  return new Response(null, { status: lastStatus });
}
