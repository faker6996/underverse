import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import fs from "fs";
import path from "path";

/**
 * @swagger
 * /api/recordings/stream:
 *   get:
 *     summary: Stream a recorded video file
 *     tags: [Recordings]
 *     parameters:
 *       - in: query
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *           enum: [cam1, cam2, cam3, cam4]
 *       - in: query
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename of the recording
 *     responses:
 *       200:
 *         description: Video stream
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       206:
 *         description: Partial content (for seeking)
 *       404:
 *         description: Recording not found
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const camera = searchParams.get("camera");
  const file = searchParams.get("file");

  if (!camera || !file) {
    throw new ApiError(400, "Missing camera or file parameter");
  }

  // Validate camera name
  if (!["cam1", "cam2", "cam3", "cam4"].includes(camera)) {
    throw new ApiError(400, "Invalid camera name");
  }

  // Security: prevent path traversal
  if (file.includes("..") || file.includes("/") || file.includes("\\")) {
    throw new ApiError(400, "Invalid filename");
  }

  const recordingsBasePath = process.env.RECORDINGS_PATH || "./public/recordings";
  const filePath = path.join(recordingsBasePath, camera, file);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "Recording not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get("range");

  // Support range requests for video seeking
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": "video/mp4",
    };

    return new NextResponse(fileStream as any, {
      status: 206,
      headers,
    });
  } else {
    // Full file
    const fileStream = fs.createReadStream(filePath);
    return new NextResponse(fileStream as any, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
      },
    });
  }
});
