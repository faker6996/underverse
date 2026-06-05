import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadDir = join(tmpdir(), "underverse-ueditor-demo-uploads");
const maxFileSize = 10 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  const extension = imageExtensions[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "Image file is too large." }, { status: 400 });
  }

  await mkdir(uploadDir, { recursive: true });

  const id = `${randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(join(uploadDir, id), new Uint8Array(arrayBuffer));

  return NextResponse.json({
    url: `/api/ueditor-demo-upload/${id}`,
    originalName: file.name,
    size: file.size,
    demoUpload: true,
  });
}
