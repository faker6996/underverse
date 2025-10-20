// app/api/auth/logout/route.ts
import { JwtPayload, verifyJwt } from "@/lib/utils/jwt";
import { invalidateUser } from "@/lib/cache/user";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { NextRequest } from "next/server";
import { refreshTokenApp } from "@/lib/modules/auth/refresh_token/applications/refresh_token_app";
import { getAuthCookieBaseOptions } from "@/lib/utils/cookies";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and revoke tokens
 *     tags: [Authentication]
 *     responses:
 *       200: { description: Logged out }
 */
async function handler(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (accessToken) {
    try {
      const payload = verifyJwt(accessToken);
      if (payload?.sub) {
        await invalidateUser(Number(payload.sub));
        
        // Revoke all refresh tokens for this user
        await refreshTokenApp.revokeAllUserTokens(Number(payload.sub));
      }
    } catch {}
  }

  // Also revoke the specific refresh token if available
  if (refreshToken) {
    try {
      await refreshTokenApp.revokeRefreshToken(refreshToken);
    } catch {}
  }

  const res = createResponse(null, "Đăng xuất thành công");
  // Clear both cookies via cookies API
  res.cookies.set("access_token", "", { ...getAuthCookieBaseOptions(true), expires: new Date(0) });
  res.cookies.set("refresh_token", "", { ...getAuthCookieBaseOptions(true), expires: new Date(0) });
  // Clear role cookie
  res.cookies.set("role", "", { ...getAuthCookieBaseOptions(false), expires: new Date(0) });

  return res;
}

export const POST = withApiHandler(handler);
