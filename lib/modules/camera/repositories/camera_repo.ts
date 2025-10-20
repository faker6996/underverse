import { baseRepo } from "@/lib/modules/common/base_repo";
import { Camera } from "@/lib/models/camera";

export const cameraRepo = {
  /**
   * Get all active cameras
   */
  async getAllActiveCameras(): Promise<Camera[]> {
    return await baseRepo.findManyByFields<Camera>(
      Camera,
      { is_active: true },
      {
        orderBy: ["id"],
        orderDirections: { id: "ASC" },
        allowedOrderFields: ["id", "created_at", "name"],
      }
    );
  },

  /**
   * Get all cameras (including inactive)
   */
  async getAllCameras(): Promise<Camera[]> {
    return await baseRepo.getAll<Camera>(Camera, {
      orderBy: ["id"],
      orderDirections: { id: "ASC" },
      allowedOrderFields: ["id", "created_at", "name"],
    });
  },

  /**
   * Get camera by ID
   */
  async getCameraById(id: number): Promise<Camera | null> {
    return await baseRepo.getById<Camera>(Camera, id);
  },

  /**
   * Get camera by RTSP URL
   */
  async getCameraByRtspUrl(rtspUrl: string): Promise<Camera | null> {
    return await baseRepo.getByField<Camera>(Camera, "rtsp_url", rtspUrl);
  },

  /**
   * Create a new camera
   */
  async createCamera(cameraData: Partial<Camera>): Promise<Camera> {
    const camera = new Camera(cameraData);
    return await baseRepo.insert<Camera>(camera);
  },

  /**
   * Update camera
   */
  async updateCamera(camera: Partial<Camera> & { id: number }): Promise<Camera | null> {
    return await baseRepo.update<Camera>(camera);
  },

  /**
   * Delete camera (soft delete by setting is_active = false)
   */
  async deactivateCamera(id: number): Promise<Camera | null> {
    return await baseRepo.update<Camera>({ id, is_active: false } as Camera);
  },

  /**
   * Delete camera permanently
   */
  async deleteCamera(id: number): Promise<void> {
    await baseRepo.deleteById(Camera, id);
  },

  /**
   * Count active cameras
   */
  async countActiveCameras(): Promise<number> {
    return await baseRepo.count<Camera>(Camera, { is_active: true });
  },
};
