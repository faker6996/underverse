export class Notification {
  id?: number;
  user_id!: number;
  title?: string | null;
  body?: string | null;
  type?: string | null; // info | success | warning | error
  is_read?: boolean;
  metadata?: Record<string, any> | null;
  created_by?: number | null;
  created_at?: Date;
  updated_at?: Date;

  static table = "notifications";
  static jsonbColumns = ["metadata"] as const;
  static columns = {
    id: "id",
    user_id: "user_id",
    title: "title",
    body: "body",
    type: "type",
    is_read: "is_read",
    metadata: "metadata",
    created_by: "created_by",
    created_at: "created_at",
    updated_at: "updated_at",
  } as const;

  constructor(data: Partial<Notification> = {}) {
    if (data && typeof data === "object") {
      Object.assign(this, data);
      if (typeof data.created_at === "string") this.created_at = new Date(data.created_at);
      if (typeof data.updated_at === "string") this.updated_at = new Date(data.updated_at);
    }
  }
}

