export class Map2D {
  static table = "map_2d";
  static jsonbColumns = ["metadata"];

  id?: number;
  name?: string | null;
  content_type?: string | null;
  image_base64!: string;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;

  constructor(data?: Partial<Map2D>) {
    Object.assign(this, data);
  }
}

