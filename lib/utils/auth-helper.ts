import { NextRequest } from "next/server";
import { verifyJwt } from "./jwt";
import { getCachedUser } from "@/lib/cache/user";
import { userRepo } from "@/lib/modules/user/repositories/user_repo";
import { ApiError } from "./error";
import { User } from "@/lib/models/user";

export async function getUserFromToken(token: string): Promise<User> {
  try {
    const payload = verifyJwt(token);

    // Try cache first
    let user = await getCachedUser(payload.id);

    // Fallback to database if not in cache
    if (!user) {
      user = await userRepo.getUserById(payload.id);
    }

    if (!user) {
      throw new ApiError("User not found", 401);
    }

    // Override role from JWT payload (JWT is the source of truth for role)
    if (payload.role) {
      user.role = payload.role;
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Invalid token", 401);
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<User> {
  // Try cookie first (main method)
  let token = req.cookies.get("access_token")?.value;

  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.get("Authorization");
    token = authHeader?.split(" ")[1];
  }

  if (!token) {
    throw new ApiError("No token provided", 401);
  }

  return await getUserFromToken(token);
}

export function extractTokenFromRequest(req: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get("Authorization");
  let token = authHeader?.split(" ")[1];

  // Fallback to cookie
  if (!token) {
    token = req.cookies.get("access_token")?.value;
  }

  return token || null;
}
