// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { serialize } from "cookie";

import { userApp } from "@/lib/modules/user/applications/user_app";
import { createTokenPair } from "@/lib/utils/jwt";
import { createResponse } from "@/lib/utils/response";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { cacheUser } from "@/lib/cache/user";
import { refreshTokenApp } from "@/lib/modules/auth/refresh_token/applications/refresh_token_app";
import { getAuthCookieBaseOptions } from "@/lib/utils/cookies";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { UserRole } from "@/lib/models";
import { applyRateLimit, registerRateLimit } from "@/lib/middlewares/auth-rate-limit";
import { APP_ROLE } from "@/lib/constants/enum";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone_number: { type: string }
 *               address: { type: string }
 *               citizen_id: { type: string }
 *     responses:
 *       200: { description: Registered }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
async function handler(req: NextRequest) {
  // Apply rate limiting first
  await applyRateLimit(req, registerRateLimit);

  const { username, name, email, password, phone_number, address } = await req.json();

  // Create new user (validation is handled in userApp.createUser)
  // Note: userApp.createUser expects a temporary 'password' field for processing
  const newUser = await userApp.createUser({
    username,
    name,
    email,
    password, // converted to password_hash inside userApp.createUser
    phone_number,
    address,
    last_login_at: new Date().toISOString(),
  } as any);

  if (!newUser) {
    throw new ApiError("Không thể tạo tài khoản", 500);
  }

  // Grant default role APP_ROLE.USER upon signup
  try {
    await baseRepo.insert<UserRole>(new UserRole({ user_id: newUser.id!, role: APP_ROLE.USER }));
  } catch {}

  // Generate token pair
  const { accessToken, refreshToken } = createTokenPair(
    {
      sub: newUser.id!.toString(),
      email: newUser.email,
      name: newUser.name,
      id: newUser.id!,
    },
    false
  ); // Default to not remember for new registrations

  // Store refresh token in database
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days for new users

  await refreshTokenApp.createRefreshToken(newUser.id!, refreshToken, refreshTokenExpiry);
  await cacheUser(newUser);

  const res = createResponse(null, "Đăng ký thành công");

  const cookieOptions = getAuthCookieBaseOptions(true);

  // Set both access token and refresh token
  res.headers.set(
    "Set-Cookie",
    [
      serialize("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 2 * 60 * 60, // 2 hours
      }),
      serialize("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      }),
    ].join(", ")
  );

  return res;
}

export const POST = withApiHandler(handler);
