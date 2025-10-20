import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { safeQuery } from "@/lib/modules/common/safe_query";
import bcrypt from "bcrypt";

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Password changed }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
async function postHandler(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me?.id) return createResponse(null, "Unauthorized", 401);

  const { currentPassword, newPassword } = await req.json();
  
  if (!newPassword || newPassword.length < 6) {
    return createResponse(null, "Mật khẩu mới phải có ít nhất 6 ký tự", 400);
  }

  // Get current user data
  const userResult = await safeQuery(
    `SELECT password_hash, needs_password_change FROM users WHERE id = $1`,
    [me.id]
  );
  
  if (!userResult.rows.length) {
    return createResponse(null, "Không tìm thấy người dùng", 404);
  }

  const user = userResult.rows[0];

  // Verify current password (skip if user needs password change on first login)
  if (!user.needs_password_change) {
    if (!currentPassword) {
      return createResponse(null, "Vui lòng nhập mật khẩu hiện tại", 400);
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return createResponse(null, "Mật khẩu hiện tại không đúng", 400);
    }
  }

  // Hash new password
  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password and clear needs_password_change flag
  await safeQuery(
    `UPDATE users 
     SET 
       password_hash = $1, 
       needs_password_change = FALSE, 
       preferences = COALESCE(preferences, '{}'::jsonb) - 'force_password_change',
       updated_at = NOW() 
     WHERE id = $2`,
    [newPasswordHash, me.id]
  );

  // Invalidate user cache to ensure fresh data on next request
  try {
    const { invalidateUser } = await import("@/lib/cache/user");
    await invalidateUser(me.id);
  } catch (e) {
    console.warn("Failed to invalidate user cache:", e);
  }

  return createResponse({ ok: true }, "Đổi mật khẩu thành công");
}

export const POST = withApiHandler(postHandler);
