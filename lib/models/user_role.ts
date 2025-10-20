import { APP_ROLE } from "@/lib/constants/enum";

export class UserRole {
  id?: number;
  user_id?: number;
  role?: APP_ROLE.SUPER_ADMIN | APP_ROLE.ADMIN | APP_ROLE.USER;
  effective_from?: Date;
  expires_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  metadata?: Record<string, any>;

  static table = "user_roles";
  static columns = {
    id: "id",
    user_id: "user_id",
    role: "role",
    effective_from: "effective_from",
    expires_at: "expires_at",
    created_at: "created_at",
    updated_at: "updated_at",
    metadata: "metadata",
  } as const;

  constructor(data: Partial<UserRole> = {}) {
    if (data && typeof data === "object") {
      Object.assign(this, data);
      if (typeof data.effective_from === "string") this.effective_from = new Date(data.effective_from);
      if (typeof data.expires_at === "string") this.expires_at = new Date(data.expires_at);
      if (typeof data.created_at === "string") this.created_at = new Date(data.created_at);
      if (typeof data.updated_at === "string") this.updated_at = new Date(data.updated_at);
    }
  }
}
