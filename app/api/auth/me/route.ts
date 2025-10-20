// app/api/auth/me/route.ts              ⬅︎ đổi path tuỳ dự án
import { NextRequest } from "next/server";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { User } from "@/lib/models";
import { comparePassword, hashPassword } from "@/lib/utils/hash";
import { ApiError } from "@/lib/utils/error";
import { invalidateUser } from "@/lib/cache/user";
import { safeQuery } from "@/lib/modules/common/safe_query";
import { APP_ROLE } from "@/lib/constants/enum";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   patch:
 *     summary: Update profile or change password
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone_number: { type: string }
 *               address: { type: string }
 *               citizen_id: { type: string }
 *               current_password: { type: string }
 *               new_password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Updated }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
async function getHandler(req: NextRequest) {
  const user = await getUserFromRequest(req);
  let role: APP_ROLE.USER | APP_ROLE.ADMIN | APP_ROLE.SUPER_ADMIN = APP_ROLE.USER;

  // Resolve role in the same way as login: SUPER_ADMIN_EMAILS/prefs override, then DB user_roles
  try {
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (superAdmins.includes((user.email || "").toLowerCase())) role = APP_ROLE.SUPER_ADMIN;
    const pref: any = (user as any).preferences || {};
    if (pref && pref.super_admin) role = APP_ROLE.SUPER_ADMIN;

    if (role !== APP_ROLE.SUPER_ADMIN) {
      const r = await safeQuery(
        `SELECT role FROM user_roles
           WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
           ORDER BY effective_from DESC NULLS LAST, created_at DESC NULLS LAST
           LIMIT 1`,
        [user.id]
      );
      const dbRole = (r.rows?.[0]?.role || "").toLowerCase();
      if (dbRole === "admin") role = APP_ROLE.ADMIN;
      if (dbRole === "super_admin") role = APP_ROLE.SUPER_ADMIN;
    }
  } catch {}
  const pref: any = (user as any).preferences || {};
  const forcePasswordChange = pref.force_password_change === true;
  // Normalize unified flag for frontend: prefer explicit column, fallback to preferences flag
  const needs_password_change = (user as any).needs_password_change === true || forcePasswordChange === true;
  return createResponse({ ...user, role, needs_password_change }, "Authenticated");
}

/* Xuất route GET đã bọc HOF */
export const GET = withApiHandler(getHandler);

async function patchHandler(req: NextRequest) {
  const me = await getUserFromRequest(req);

  const body = await req.json().catch(() => ({}));
  const name = String((body as any)?.name ?? me.name ?? "").trim();
  const email = String(me.email || "").trim(); // email is immutable
  const phone_number = String((body as any)?.phone_number ?? me.phone_number ?? "").trim();
  const address = String((body as any)?.address ?? me.address ?? "").trim();
  const citizen_idRaw = (body as any)?.citizen_id;
  const citizen_id = typeof citizen_idRaw === "string" ? citizen_idRaw.trim() : citizen_idRaw ?? (me as any).citizen_id ?? null;
  const current_password = String((body as any)?.current_password ?? "").trim();
  const new_password = String((body as any)?.new_password ?? "").trim();

  // Only require phone/address when user is updating profile fields.
  // Do NOT enforce when changing password only (e.g., first-time password change flow).
  const bodyHasProfileFields =
    (body as any)?.name !== undefined ||
    (body as any)?.phone_number !== undefined ||
    (body as any)?.address !== undefined ||
    (body as any)?.citizen_id !== undefined;
  if (bodyHasProfileFields) {
    if (!phone_number || !address) {
      throw new ApiError("Thiếu thông tin bắt buộc (số điện thoại, địa chỉ)", 400);
    }
  }

  // Only require and verify current password when changing password,
  // except when user is flagged to change password on first login
  if (new_password) {
    const firstTimeForce = (me as any).needs_password_change === true || (me as any).preferences?.force_password_change === true;
    if (!firstTimeForce) {
      if (!current_password) {
        throw new ApiError("Vui lòng nhập mật khẩu hiện tại", 400);
      }
      const ok = await comparePassword(current_password, me.password_hash || "");
      if (!ok) {
        throw new ApiError("Mật khẩu hiện tại không đúng", 401);
      }
    }
  }

  // Email không cho phép thay đổi: luôn giữ nguyên me.email

  // Ensure citizen_id unique if provided and changed
  if (citizen_id && citizen_id !== (me as any).citizen_id) {
    const existCccdResult = await safeQuery("SELECT id FROM users WHERE citizen_id = $1 AND id <> $2 LIMIT 1", [citizen_id, me.id]);
    if (existCccdResult.rows.length > 0) {
      throw new ApiError("CCCD đã được sử dụng", 400);
    }
  }

  let password_hash: string | undefined = undefined;
  if (new_password) {
    if (new_password.length < 6) {
      throw new ApiError("Mật khẩu mới phải có ít nhất 6 ký tự", 400);
    }
    password_hash = await hashPassword(new_password);
  }

  const updateData: any = {
    id: me.id,
    name,
    email,
    phone_number,
    address,
    ...(password_hash ? { password_hash } : {}),
    updated_at: new Date().toISOString(),
  };

  if (citizen_id !== undefined) {
    updateData.citizen_id = citizen_id;
  }

  const updated = await baseRepo.update<User>(new User(updateData));

  // Clear force_password_change flag if password was changed
  if (password_hash) {
    // Clear both legacy and current flags that enforce password change
    await safeQuery(
      `UPDATE users 
         SET preferences = COALESCE(preferences,'{}'::jsonb) - 'force_password_change',
             needs_password_change = FALSE,
             updated_at = NOW()
       WHERE id = $1`,
      [me.id]
    );
  }

  try {
    await invalidateUser(me.id!);
  } catch {}

  return createResponse(updated, "Cập nhật hồ sơ thành công");
}

export const PATCH = withApiHandler(patchHandler);
