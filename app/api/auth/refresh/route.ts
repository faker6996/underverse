import { NextRequest } from "next/server";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { refreshTokenApp } from "@/lib/modules/auth/refresh_token/applications/refresh_token_app";
import { verifyJwt } from "@/lib/utils/jwt";
import { getAuthCookieBaseOptions } from "@/lib/utils/cookies";
import { safeQuery } from "@/lib/modules/common/safe_query";
import { APP_ROLE } from "@/lib/constants/enum";

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
async function handler(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    throw new ApiError("Refresh token not found", 401);
  }

  // Use application layer to handle token refresh
  const { accessToken, refreshToken: newRefreshToken } = await refreshTokenApp.refreshAccessToken(refreshToken);

  const res = createResponse({ accessToken }, "Token refreshed successfully");

  // Set new cookies
  const baseOpts = getAuthCookieBaseOptions(true);
  res.cookies.set("access_token", accessToken, {
    ...baseOpts,
    maxAge: 2 * 60 * 60,
  });
  res.cookies.set("refresh_token", newRefreshToken, {
    ...baseOpts,
    maxAge: 30 * 24 * 60 * 60,
  });

  // Also sync role cookie based on DB/user prefs
  try {
    const payload = verifyJwt(accessToken);
    if (payload?.id) {
      let role: APP_ROLE.USER | APP_ROLE.ADMIN | APP_ROLE.SUPER_ADMIN = APP_ROLE.USER;
      const userRes = await safeQuery(`SELECT email, preferences FROM users WHERE id = $1`, [payload.id]);
      const row = userRes.rows?.[0];
      const email = String(row?.email || "");
      const pref: any = row?.preferences || {};
      const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (superAdmins.includes(email.toLowerCase())) role = APP_ROLE.SUPER_ADMIN;
      if (pref && pref.super_admin) role = APP_ROLE.SUPER_ADMIN;
      if (role !== APP_ROLE.SUPER_ADMIN) {
        const r = await safeQuery(
          `SELECT role FROM user_roles 
             WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
             ORDER BY effective_from DESC NULLS LAST, created_at DESC NULLS LAST
             LIMIT 1`,
          [payload.id]
        );
        const dbRole = (r.rows?.[0]?.role || "").toLowerCase();
        if (dbRole === APP_ROLE.ADMIN) role = APP_ROLE.ADMIN;
        if (dbRole === APP_ROLE.SUPER_ADMIN) role = APP_ROLE.SUPER_ADMIN;
      }

      res.cookies.set("role", role, {
        ...getAuthCookieBaseOptions(false),
        maxAge: 30 * 24 * 60 * 60,
      });
    }
  } catch {}

  return res;
}

export const POST = withApiHandler(handler);
