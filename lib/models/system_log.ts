import { LOG_LEVEL } from "@/lib/constants";

export class SystemLog {
  id?: number;
  level?: LOG_LEVEL.WARN | LOG_LEVEL.ERROR;
  event?: string;
  module?: string | null;
  action?: string | null;
  message?: string | null;
  user_id?: number | null;
  task_id?: number | null;
  video_id?: number | null;
  request_id?: string | null;
  route?: string | null;
  method?: string | null;
  status_code?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  details?: Record<string, any> | null;
  error_stack?: string | null;
  created_at?: Date;

  static table = "system_logs";
  static columns = {
    id: "id",
    level: "level",
    event: "event",
    module: "module",
    action: "action",
    message: "message",
    user_id: "user_id",
    task_id: "task_id",
    video_id: "video_id",
    request_id: "request_id",
    route: "route",
    method: "method",
    status_code: "status_code",
    ip_address: "ip_address",
    user_agent: "user_agent",
    details: "details",
    error_stack: "error_stack",
    created_at: "created_at",
  } as const;

  // JSONB columns handled specially by BaseRepo
  static jsonbColumns = ["details"] as const;

  constructor(data: Partial<SystemLog> = {}) {
    if (data && typeof data === "object") {
      Object.assign(this, data);
      if (typeof data.created_at === "string") this.created_at = new Date(data.created_at);
    }
  }
}
