import { baseRepo } from "@/lib/modules/common/base_repo";
import { userRepo } from "../repositories/user_repo";
import { User, UserRole } from "@/lib/models";
import { comparePassword, hashPassword } from "@/lib/utils/hash";
import { ApiError } from "@/lib/utils/error";
import { safeQuery } from "@/lib/modules/common/safe_query";
import { sendMail } from "@/lib/utils/send-mail";
import { APP_ROLE } from "@/lib/constants/enum";
import { invalidateUser } from "@/lib/cache/user";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger('UserApp');

// Interface for user creation with plain password
interface CreateUserData {
  username?: string;
  name?: string;
  email?: string;
  password: string;
  phone_number?: string;
  address?: string;
  last_login_at?: string;
}

export const userApp = {
  async verifyUser(login: string, password: string): Promise<User> {
    // Allow login by email or username. If input contains '@', treat it as email.
    let user: User | null = null;
    if (login && login.includes('@')) {
      user = await baseRepo.getByField<User>(User, User.columns.email, login);
    } else {
      // Try username first; if not found, fallback to email just in case
      user = await baseRepo.getByField<User>(User, (User.columns as any).username || 'username', login);
      if (!user) {
        user = await baseRepo.getByField<User>(User, User.columns.email, login);
      }
    }
    if (!user) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

    const ok = await comparePassword(password, user.password_hash ?? "");
    if (!ok) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

    return user;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return await baseRepo.getByField<User>(User, User.columns.email, email);
  },

  async createUser(userData: CreateUserData): Promise<User> {
    // New registration rule: require username + password only. Others optional (nullable)
    if (!userData?.username || !userData?.password) {
      throw new ApiError("Username và password là bắt buộc", 400);
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new ApiError("Mật khẩu phải có ít nhất 6 ký tự", 400);
    }

    // Ensure username is unique
    const existingByUsername = await baseRepo.getByField<User>(User, (User.columns as any).username || 'username', userData.username);
    if (existingByUsername) {
      throw new ApiError("Username đã được sử dụng", 400);
    }

    // If email is provided, validate and ensure unique, else leave null
    let email: string | null = null;
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new ApiError("Email không hợp lệ", 400);
      }
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) throw new ApiError("Email đã được sử dụng", 400);
      email = userData.email;
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);

    const newUserData: Partial<User> = {
      username: userData.username,
      name: userData.name ?? null as any,
      email: email as any, // can be null
      password_hash: hashedPassword,
      email_verified: false,
      provider: "local",
      is_active: true,
      is_sso: false,
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: userData.last_login_at,
      phone_number: userData.phone_number ?? null as any,
      address: userData.address ?? null as any,
    };

    const newUser = new User(newUserData);
    return await baseRepo.insert<User>(newUser);
  },

  async execute(data: Partial<User>): Promise<User> {
    if (!data.email || !data.password_hash) {
      throw new ApiError("Email and password are required", 400);
    }

    // Check if user already exists
    const existingUser = await baseRepo.getByField<User>(User, User.columns.email, data.email);
    if (existingUser) {
      throw new ApiError("User with this email already exists", 409);
    }

    const newUser = await baseRepo.insert<User>(data);
    return newUser;
  },

  async getAll(): Promise<User[]> {
    return await baseRepo.getAll<User>(User, {
      orderBy: ["created_at"],
      orderDirections: { created_at: "DESC" },
      allowedOrderFields: ["id", "created_at", "name", "email"],
    });
  },

  async getById(id: number): Promise<User> {
    const user = await baseRepo.getById<User>(User, id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    return user;
  },

  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      throw new ApiError("Search query must be at least 2 characters", 400);
    }

    return await userRepo.searchByNameOrEmail(query.trim());
  },

  async searchUsersForMessenger(currentUserId: number, query: string): Promise<any[]> {
    if (!query || query.trim().length < 2) {
      throw new ApiError("Search query must be at least 2 characters", 400);
    }

    return await userRepo.searchUsersWithConversation(currentUserId, query.trim());
  },

  async searchUsersForGroupInvite(currentUserId: number, query: string, groupId: number): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      throw new ApiError("Search query must be at least 2 characters", 400);
    }

    return await userRepo.searchUsersForGroupInvite(currentUserId, query.trim(), groupId);
  },

  // Admin functions
  async getUsersForAdmin(page: number = 1, pageSize: number = 20, query: string = "", currentUserId: number) {
    const where: string[] = [];
    const params: any[] = [];

    // Exclude current user from listing
    where.push(`u.id <> $${params.length + 1}`);
    params.push(currentUserId);

    if (query.trim()) {
      params.push(`%${query}%`, `%${query}%`);
      where.push(`(LOWER(u.name) LIKE LOWER($${params.length - 1}) OR LOWER(u.email) LIKE LOWER($${params.length}))`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    const listSql = `
      SELECT u.*,
             (NOT COALESCE(u.is_active, TRUE)) AS is_deleted,
             COALESCE(ur.role, 'standard') AS user_role,
             CASE
               WHEN u.preferences->>'super_admin' = 'true' THEN 'super_admin'
               ELSE COALESCE(ur.role, 'standard')
             END AS role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      ${whereSQL}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const countSql = `SELECT COUNT(*)::int AS cnt FROM users u ${whereSQL}`;

    const listRes = await safeQuery(listSql, [...params, pageSize, offset]);
    const countRes = await safeQuery(countSql, params);

    const rows = listRes.rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.created_at,
      updated_at: u.updated_at,
      is_deleted: u.is_deleted,
      is_active: u.is_active,
      role: u.role as APP_ROLE.USER | APP_ROLE.ADMIN | APP_ROLE.SUPER_ADMIN,
    }));

    return { data: rows, total: countRes.rows[0]?.cnt || 0 };
  },

  async createUserByAdmin(name: string, email: string, role: string = APP_ROLE.USER) {
    // Validation
    if (!name || !email) throw new ApiError("Thiếu tên hoặc email", 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new ApiError("Email không hợp lệ", 400);

    // Check duplicate email
    const dup = await safeQuery(`SELECT 1 FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`, [email]);
    if (dup.rowCount && dup.rows.length) throw new ApiError("Email đã tồn tại", 400);

    // Generate random password: 12 characters with letters and numbers
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const password = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    const hash = await hashPassword(password);
    const user = new User({
      name,
      email,
      password_hash: hash,
      is_active: true,
      email_verified: false,
      provider: "local",
      is_sso: false,
    });
    const created = await baseRepo.insert<User>(user);

    // Mark user for forced password change
    await safeQuery(
      `UPDATE users SET needs_password_change = TRUE, preferences = COALESCE(preferences,'{}'::jsonb) || '{"force_password_change":true}'::jsonb WHERE id = $1`,
      [created.id]
    );

    // Assign role
    await this.assignUserRole(created.id!, role);

    // Send welcome email (non-blocking). Do not block API on SMTP issues.
    this.sendWelcomeEmail(name, email, password).catch((err) => {
      logger.error("sendWelcomeEmail error", err);
    });

    return created;
  },

  async assignUserRole(userId: number, role: string) {
    // First, deactivate all current roles
    await safeQuery(`UPDATE user_roles SET expires_at = NOW() WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())`, [userId]);

    if (role === APP_ROLE.ADMIN) {
      await safeQuery(`UPDATE users SET preferences = COALESCE(preferences,'{}'::jsonb) - 'super_admin' WHERE id = $1`, [userId]);
      const r = new UserRole({ user_id: userId, role: APP_ROLE.ADMIN });
      await baseRepo.insert<UserRole>(r);
    } else if (role === APP_ROLE.USER || role === "user") {
      await safeQuery(`UPDATE users SET preferences = COALESCE(preferences,'{}'::jsonb) - 'super_admin' WHERE id = $1`, [userId]);
      const r = new UserRole({ user_id: userId, role: APP_ROLE.USER });
      await baseRepo.insert<UserRole>(r);
    } else if (role === APP_ROLE.SUPER_ADMIN) {
      await safeQuery(`UPDATE users SET preferences = COALESCE(preferences,'{}'::jsonb) || '{"super_admin":true}'::jsonb WHERE id = $1`, [userId]);
      const r = new UserRole({ user_id: userId, role: APP_ROLE.SUPER_ADMIN });
      await baseRepo.insert<UserRole>(r);
    }
  },

  async updateUserStatus(userId: number, isActive: boolean) {
    await baseRepo.update(
      new User({
        id: userId,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
    );
    await invalidateUser(userId);
  },

  async toggleUserDelete(userId: number, isDeleted: boolean) {
    const newActive = !isDeleted;
    await baseRepo.update(
      new User({
        id: userId,
        is_active: newActive,
        updated_at: new Date().toISOString(),
      })
    );
    await invalidateUser(userId);
  },

  async updateUserProfile(userId: number, data: any) {
    const existing = await baseRepo.getById<User>(User, userId);
    if (!existing) throw new ApiError("User not found", 404);

    // Email validation & uniqueness if changed
    let nextEmail = typeof data.email === "string" ? data.email.trim() : existing.email;
    if (nextEmail && nextEmail !== existing.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nextEmail)) throw new ApiError("Email không hợp lệ", 400);
      const dup = await safeQuery(`SELECT 1 FROM users WHERE LOWER(email)=LOWER($1) AND id <> $2 LIMIT 1`, [nextEmail, userId]);
      if (dup.rowCount && dup.rows.length) throw new ApiError("Email đã tồn tại", 400);
    }

    // citizen_id removed from schema; skip related updates

    // Password hash if requested
    let password_hash: string | undefined = undefined;
    if (typeof data.new_password === "string" && data.new_password.trim()) {
      if (data.new_password.trim().length < 6) throw new ApiError("Mật khẩu quá ngắn (>= 6 ký tự)", 400);
      password_hash = await hashPassword(data.new_password.trim());

      // Clear force_password_change flag when admin sets new password
      await safeQuery(`UPDATE users SET preferences = COALESCE(preferences,'{}'::jsonb) - 'force_password_change' WHERE id = $1`, [userId]);
    }

    // Build update payload
    const toUpdate = new User({
      id: userId,
      name: typeof data.name === "string" ? data.name : existing.name,
      email: nextEmail,
      phone_number: typeof data.phone_number === "string" ? data.phone_number : existing.phone_number,
      address: typeof data.address === "string" ? data.address : existing.address,
      ...(password_hash ? { password_hash } : {}),
      updated_at: new Date().toISOString(),
    });

    await baseRepo.update<User>(toUpdate);
    await invalidateUser(userId);
  },

  async sendWelcomeEmail(name: string, email: string, password: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    try {
      const emailSubject = "Tài khoản mới đã được tạo / New Account Created";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Vietnamese Section -->
          <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 15px;">🇻🇳 Chào ${name},</h2>
            <p style="font-size: 16px; line-height: 1.5;">Tài khoản của bạn đã được tạo thành công trên hệ thống.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Thông tin đăng nhập:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Mật khẩu:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${password}</code></p>
            </div>
            <p><strong>Lưu ý:</strong> Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.</p>
            <p>Trân trọng,<br><strong>Đội ngũ hỗ trợ</strong></p>
          </div>

          <!-- English Section -->
          <div>
            <h2 style="color: #333; margin-bottom: 15px;">🇺🇸 Hello ${name},</h2>
            <p style="font-size: 16px; line-height: 1.5;">Your account has been successfully created in our system.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Login Information:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${password}</code></p>
            </div>
            <p><strong>Note:</strong> Please change your password after first login.</p>
            <p>Best regards,<br><strong>Support Team</strong></p>
          </div>
        </div>
      `;
      await sendMail({ to: email, subject: emailSubject, html: emailHtml });
    } catch (emailError) {
      logger.error("Failed to send welcome email", emailError);
    }
  },

  async getUserWithRole(userId: number) {
    const res = await safeQuery(`SELECT *, (NOT COALESCE(is_active, TRUE)) AS is_deleted FROM users WHERE id = $1`, [userId]);
    const u = res.rows[0];
    if (!u) throw new ApiError("User not found", 404);

    // compute role for UI display
    let role: APP_ROLE.USER | APP_ROLE.ADMIN | APP_ROLE.SUPER_ADMIN = APP_ROLE.USER;
    const pref = (u.preferences || {}) as any;
    if (pref && pref.super_admin) role = APP_ROLE.SUPER_ADMIN;
    else {
      try {
        const ar = "user"; // Default role
        role = ar as any;
      } catch {}
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone_number: u.phone_number,
      address: u.address,
      citizen_id: u.citizen_id,
      created_at: u.created_at,
      updated_at: u.updated_at,
      is_active: u.is_active,
      is_deleted: u.is_deleted,
      role,
    };
  },
};
