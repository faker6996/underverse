export class User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password_hash?: string;
  avatar_url?: string;
  email_verified?: boolean;
  provider?: string;
  provider_id?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  phone_number?: string;
  address?: string;
  is_active?: boolean;
  preferences?: Record<string, any>;
  needs_password_change?: boolean;
  is_sso?: boolean;
  sub?: string;
  role?: string;

  static table = "users";
  static columns = {
    id: "id",
    name: "name",
    username: "username",
    email: "email",
    password_hash: "password_hash",
    avatar_url: "avatar_url",
    email_verified: "email_verified",
    provider: "provider",
    provider_id: "provider_id",
    created_at: "created_at",
    updated_at: "updated_at",
    last_login_at: "last_login_at",
    phone_number: "phone_number",
    address: "address",
    is_active: "is_active",
    preferences: "preferences",
    needs_password_change: "needs_password_change",
    is_sso: "is_sso",
    sub: "sub",
  } as const;

  constructor(data: Partial<User> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === "object") {
      Object.assign(this, data);
    }
  }
}

export interface UserInfoSso {
  sub: string;
  name: string;
  email: string;
  verified_email: boolean;
  given_name: string;
  family_name: string;
  picture: picture;
  locale: string;
  id: number;
}
export interface UserInfoSsoGg {
  sub: string;
  name: string;
  email: string;
  verified_email: boolean;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
export interface picture {
  data: pictureData;
}
export interface pictureData {
  is_silhouette: boolean;
  height: number;
  width: number;
  url: string;
}
