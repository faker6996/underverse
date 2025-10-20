import { NextRequest } from "next/server";
import { safeQuery } from "@/lib/modules/common/safe_query";

export const dynamic = "force-dynamic";

// Create a new 2D map (base64 image)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const image_base64 = String(body?.image_base64 || "").trim();
    const name = body?.name ? String(body.name) : null;
    const content_type = body?.content_type ? String(body.content_type) : null;
    const width = body?.width != null ? Number(body.width) : null;
    const height = body?.height != null ? Number(body.height) : null;

    if (!image_base64) {
      return Response.json({ success: false, error: "Missing image_base64" }, { status: 400 });
    }

    const sql = `
      INSERT INTO map_2d (name, content_type, image_base64, width, height)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, content_type, width, height, created_at
    `;
    const { rows } = await safeQuery(sql, [name, content_type, image_base64, width, height]);
    return Response.json({ success: true, data: rows[0] }, { status: 201 });
  } catch (err) {
    return Response.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// Get latest uploaded map (or list when mode=list)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  try {
    if (mode === "list") {
      const { rows } = await safeQuery(
        `SELECT id, name, content_type, width, height, created_at FROM map_2d ORDER BY created_at DESC LIMIT 50`
      );
      return Response.json({ success: true, data: rows });
    }
    const { rows } = await safeQuery(
      `SELECT id, name, content_type, image_base64, width, height, created_at FROM map_2d ORDER BY created_at DESC LIMIT 1`
    );
    return Response.json({ success: true, data: rows[0] || null });
  } catch (err) {
    return Response.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

