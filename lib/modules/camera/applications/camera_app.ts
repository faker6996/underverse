import { cameraRepo } from "../repositories/camera_repo";
import { Camera } from "@/lib/models/camera";
import { ApiError } from "@/lib/utils/error";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("CameraApp");

interface CreateCameraData {
  name: string;
  rtsp_url: string;
  stream_mode?: "main" | "sub";
  resolution_width?: number;
  resolution_height?: number;
  fps?: number;
  metadata?: Record<string, any>;
}

interface UpdateCameraData {
  id: number;
  name?: string;
  rtsp_url?: string;
  stream_mode?: "main" | "sub";
  resolution_width?: number;
  resolution_height?: number;
  fps?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export const cameraApp = {
  /**
   * Get all active cameras for display
   */
  async getActiveCameras(): Promise<Camera[]> {
    try {
      return await cameraRepo.getAllActiveCameras();
    } catch (error) {
      logger.error("Failed to get active cameras:", error);
      throw new ApiError("Failed to fetch cameras", 500);
    }
  },

  /**
   * Get all cameras (admin only)
   */
  async getAllCameras(): Promise<Camera[]> {
    try {
      return await cameraRepo.getAllCameras();
    } catch (error) {
      logger.error("Failed to get all cameras:", error);
      throw new ApiError("Failed to fetch cameras", 500);
    }
  },

  /**
   * Get camera by ID
   */
  async getCameraById(id: number): Promise<Camera> {
    try {
      const camera = await cameraRepo.getCameraById(id);
      if (!camera) {
        throw new ApiError("Camera not found", 404);
      }
      return camera;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Failed to get camera ${id}:`, error);
      throw new ApiError("Failed to fetch camera", 500);
    }
  },

  /**
   * Create new camera
   */
  async createCamera(data: CreateCameraData): Promise<Camera> {
    try {
      // Validate required fields
      if (!data.name || !data.rtsp_url) {
        throw new ApiError("Name and RTSP URL are required", 400);
      }

      // Check if RTSP URL already exists
      const existing = await cameraRepo.getCameraByRtspUrl(data.rtsp_url);
      if (existing) {
        throw new ApiError("Camera with this RTSP URL already exists", 400);
      }

      // Create camera
      const camera = await cameraRepo.createCamera({
        name: data.name,
        rtsp_url: data.rtsp_url,
        stream_mode: data.stream_mode || "main",
        resolution_width: data.resolution_width,
        resolution_height: data.resolution_height,
        fps: data.fps,
        is_active: true,
        metadata: data.metadata || {},
      });

      logger.info(`Camera created: ${camera.id} - ${camera.name}`);
      return camera;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Failed to create camera:", error);
      throw new ApiError("Failed to create camera", 500);
    }
  },

  /**
   * Update camera
   */
  async updateCamera(data: UpdateCameraData): Promise<Camera> {
    try {
      // Check if camera exists
      const existing = await cameraRepo.getCameraById(data.id);
      if (!existing) {
        throw new ApiError("Camera not found", 404);
      }

      // If updating RTSP URL, check for duplicates
      if (data.rtsp_url && data.rtsp_url !== existing.rtsp_url) {
        const duplicate = await cameraRepo.getCameraByRtspUrl(data.rtsp_url);
        if (duplicate && duplicate.id !== data.id) {
          throw new ApiError("Another camera with this RTSP URL already exists", 400);
        }
      }

      // Update camera
      const updated = await cameraRepo.updateCamera(data);
      if (!updated) {
        throw new ApiError("Failed to update camera", 500);
      }

      logger.info(`Camera updated: ${updated.id} - ${updated.name}`);
      return updated;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Failed to update camera ${data.id}:`, error);
      throw new ApiError("Failed to update camera", 500);
    }
  },

  /**
   * Deactivate camera (soft delete)
   */
  async deactivateCamera(id: number): Promise<Camera> {
    try {
      const camera = await cameraRepo.getCameraById(id);
      if (!camera) {
        throw new ApiError("Camera not found", 404);
      }

      const updated = await cameraRepo.deactivateCamera(id);
      if (!updated) {
        throw new ApiError("Failed to deactivate camera", 500);
      }

      logger.info(`Camera deactivated: ${id} - ${camera.name}`);
      return updated;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Failed to deactivate camera ${id}:`, error);
      throw new ApiError("Failed to deactivate camera", 500);
    }
  },

  /**
   * Delete camera permanently
   */
  async deleteCamera(id: number): Promise<void> {
    try {
      const camera = await cameraRepo.getCameraById(id);
      if (!camera) {
        throw new ApiError("Camera not found", 404);
      }

      await cameraRepo.deleteCamera(id);
      logger.info(`Camera deleted: ${id} - ${camera.name}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Failed to delete camera ${id}:`, error);
      throw new ApiError("Failed to delete camera", 500);
    }
  },

  /**
   * Get camera statistics
   */
  async getCameraStats(): Promise<{ total: number; active: number; inactive: number }> {
    try {
      const allCameras = await cameraRepo.getAllCameras();
      const activeCount = await cameraRepo.countActiveCameras();

      return {
        total: allCameras.length,
        active: activeCount,
        inactive: allCameras.length - activeCount,
      };
    } catch (error) {
      logger.error("Failed to get camera stats:", error);
      throw new ApiError("Failed to get camera statistics", 500);
    }
  },
};
