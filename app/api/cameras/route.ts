import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { cameraApp } from "@/lib/modules/camera/applications/camera_app";

/**
 * GET /api/cameras
 * Returns list of all active cameras
 */
async function getHandler() {
  const cameras = await cameraApp.getActiveCameras();
  return createResponse(cameras, "OK");
}

/**
 * POST /api/cameras
 * Create a new camera
 */
async function postHandler(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const camera = await cameraApp.createCamera(body);
  return createResponse(camera, "Created", 201);
}

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
