import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get("file");

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  // Basic security check to prevent directory traversal
  // Allow only alphanumeric characters, dots, dashes, and underscores
  // And must end with .md
  if (!/^[a-zA-Z0-9._-]+\.md$/.test(filename) || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  // Docs live in this repo under `docs/underverseui-usage`
  const docsDir = path.join(process.cwd(), "docs/underverseui-usage");
  const filePath = path.join(docsDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/markdown",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error reading doc file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
