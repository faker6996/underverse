import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import fs from "fs/promises";
import path from "path";

/**
 * @swagger
 * /api/recordings:
 *   get:
 *     summary: Get list of recorded video segments
 *     tags: [Recordings]
 *     parameters:
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *           enum: [cam1, cam2, cam3, cam4]
 *         description: Filter by camera path
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of recordings to return
 *     responses:
 *       200:
 *         description: List of recordings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recordings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       camera:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       path:
 *                         type: string
 *                       size:
 *                         type: number
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const camera = searchParams.get("camera");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  // In Docker, recordings are at /recordings
  // In local dev, we'll use a local recordings folder
  const recordingsBasePath = process.env.RECORDINGS_PATH || "./public/recordings";

  try {
    // Check if directory exists
    try {
      await fs.access(recordingsBasePath);
    } catch {
      // Directory doesn't exist yet - return empty array
      return NextResponse.json({ recordings: [] });
    }

    const recordings: any[] = [];

    // If camera specified, only scan that camera's folder
    const camerasToScan = camera ? [camera] : ["cam1", "cam2", "cam3", "cam4"];

    for (const cam of camerasToScan) {
      const camPath = path.join(recordingsBasePath, cam);

      try {
        const files = await fs.readdir(camPath);

        for (const file of files) {
          if (file.endsWith(".mp4") || file.endsWith(".fmp4")) {
            const filePath = path.join(camPath, file);
            const stats = await fs.stat(filePath);

            // Extract timestamp from filename (format: YYYY-MM-DD_HH-MM-SS.mp4)
            const timestampMatch = file.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
            const timestamp = timestampMatch ? timestampMatch[1].replace(/_/g, " ").replace(/-/g, ":") : null;

            recordings.push({
              id: `${cam}_${file}`,
              camera: cam,
              filename: file,
              timestamp,
              path: `/api/recordings/stream?camera=${cam}&file=${encodeURIComponent(file)}`,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
            });
          }
        }
      } catch (err) {
        // Camera folder doesn't exist yet, skip
        continue;
      }
    }

    // Sort by creation time (newest first)
    recordings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    const limitedRecordings = recordings.slice(0, limit);

    return NextResponse.json({
      recordings: limitedRecordings,
      total: recordings.length,
    });
  } catch (error: any) {
    throw new ApiError(500, `Failed to list recordings: ${error.message}`);
  }
});
