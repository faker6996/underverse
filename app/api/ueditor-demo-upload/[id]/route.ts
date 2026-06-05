import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadDir = join(tmpdir(), "underverse-ueditor-demo-uploads");
const contentTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = /^([a-f0-9-]+)\.(png|jpg|webp|gif)$/.exec(id);

  if (!match) {
    return NextResponse.json({ error: "Invalid image id." }, { status: 400 });
  }

  try {
    const bytes = await readFile(join(uploadDir, id));
    const extension = match[2] ?? "png";

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}
