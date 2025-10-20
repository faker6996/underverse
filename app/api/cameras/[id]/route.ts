import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { cameraApp } from "@/lib/modules/camera/applications/camera_app";
import { ApiError } from "@/lib/utils/error";

/**
 * GET /api/cameras/[id]
 * Get camera by ID
 */
async function getHandler(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw new ApiError("Invalid camera ID", 400);
  }

  const camera = await cameraApp.getCameraById(id);
  return createResponse(camera, "OK");
}

/**
 * PUT /api/cameras/[id]
 * Update camera
 */
async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw new ApiError("Invalid camera ID", 400);
  }

  const body = await req.json().catch(() => ({}));
  const camera = await cameraApp.updateCamera({ ...body, id });
  return createResponse(camera, "Updated");
}

/**
 * DELETE /api/cameras/[id]
 * Delete camera (soft delete by default, ?permanent=true for hard delete)
 */
async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw new ApiError("Invalid camera ID", 400);
  }

  const { searchParams } = new URL(req.url);
  const permanent = searchParams.get("permanent") === "true";

  if (permanent) {
    await cameraApp.deleteCamera(id);
    return createResponse(null, "Camera permanently deleted");
  } else {
    const camera = await cameraApp.deactivateCamera(id);
    return createResponse(camera, "Camera deactivated");
  }
}

export const GET = withApiHandler(getHandler);
export const PUT = withApiHandler(putHandler);
export const DELETE = withApiHandler(deleteHandler);
