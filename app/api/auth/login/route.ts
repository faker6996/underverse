// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

import { userApp } from "@/lib/modules/user/applications/user_app";
import { createTokenPair } from "@/lib/utils/jwt";
import { createResponse } from "@/lib/utils/response";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { saveToLocalStorage } from "@/lib/utils/local-storage";
import { normalLoginApp } from "@/lib/modules/auth/normal_login/applications/normal_login_app";
import { cacheUser } from "@/lib/cache/user";
import { refreshTokenApp } from "@/lib/modules/auth/refresh_token/applications/refresh_token_app";
import { applyRateLimit, loginRateLimit } from "@/lib/middlewares/auth-rate-limit";
import { getAuthCookieBaseOptions } from "@/lib/utils/cookies";
import { safeQuery } from "@/lib/modules/common/safe_query";
import { APP_ROLE } from "@/lib/constants/enum";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 role: "USER"
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation Error"
 *               message: "Email and password are required"
 *               statusCode: 400
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authentication Failed"
 *               message: "Invalid email or password"
 *               statusCode: 401
 */
async function handler(req: NextRequest) {
  // Apply rate limiting first
  await applyRateLimit(req, loginRateLimit);

  const { email, password, rememberMe } = await req.json();

  const userVerify = await userApp.verifyUser(email, password);
  const user = await normalLoginApp.handleAfterLogin(userVerify);

  if (!user) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

  // Determine effective role BEFORE creating token
  let role: APP_ROLE.USER | APP_ROLE.ADMIN | APP_ROLE.SUPER_ADMIN = APP_ROLE.USER;
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
  } catch {
    // Fallback: leave as USER role
  }

  // Generate token pair with role included in JWT payload
  const { accessToken, refreshToken } = createTokenPair(
    {
      sub: user.id!.toString(),
      email: user.email,
      name: user.name,
      id: user.id!,
      role, // Include role in JWT for secure verification
    },
    rememberMe
  );

  // Store refresh token in database
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + (rememberMe ? 30 : 7)); // 30 days or 7 days

  await refreshTokenApp.createRefreshToken(user.id!, refreshToken, refreshTokenExpiry);
  await cacheUser(user);

  /* ✅ KHÔNG đưa token vào JSON */
  const res = createResponse({ needs_password_change: user.needs_password_change || false }, "Đăng nhập thành công");

  const baseOpts = getAuthCookieBaseOptions(true);
  res.cookies.set("access_token", accessToken, {
    ...baseOpts,
    maxAge: 2 * 60 * 60,
  });
  res.cookies.set("refresh_token", refreshToken, {
    ...baseOpts,
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60,
  });

  // Set role cookie for UI display only (middleware will verify from JWT)
  res.cookies.set("role", role, {
    ...getAuthCookieBaseOptions(false),
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60,
  });

  return res; // { success:true, data:null }
}

export const POST = withApiHandler(handler);
