export class RefreshToken {
  id?: number;
  user_id!: number;
  token_hash!: string;
  expires_at!: string;
  created_at?: string;
  last_used_at?: string;
  is_revoked?: boolean;

  static table = "refresh_tokens";
  static columns = {
    id: "id",
    user_id: "user_id",
    token_hash: "token_hash", 
    expires_at: "expires_at",
    created_at: "created_at",
    last_used_at: "last_used_at",
    is_revoked: "is_revoked"
  } as const;

  constructor(data: Partial<RefreshToken> = {}) {
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}