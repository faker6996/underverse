export type StreamMode = "main" | "sub";

export class Camera {
  static table = "cameras";
  static jsonbColumns = ["metadata"];

  id?: number;
  name!: string;
  rtsp_url!: string;
  stream_mode: StreamMode = "main";
  resolution_width?: number | null;
  resolution_height?: number | null;
  fps?: number | null;
  is_active: boolean = true;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;

  constructor(data?: Partial<Camera>) {
    Object.assign(this, data);
  }
}

