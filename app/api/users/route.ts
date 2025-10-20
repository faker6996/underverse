import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { APP_ROLE } from "@/lib/constants/enum";
import { userApp } from "@/lib/modules/user/applications/user_app";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a paginated list of all users in the system. Requires admin privileges.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserListResponse'
 *             example:
 *               success: true
 *               message: "OK"
 *               data:
 *                 users:
 *                   - id: 1
 *                     email: "admin@example.com"
 *                     name: "Admin User"
 *                     role: "ADMIN"
 *                     needs_password_change: false
 *                     created_at: "2023-01-01T00:00:00Z"
 *                     updated_at: "2023-01-01T00:00:00Z"
 *                 total: 50
 *                 page: 1
 *                 pageSize: 20
 *                 totalPages: 3
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create new user (Admin only)
 *     description: Create a new user account. Requires admin privileges. Super admin role can only be assigned by existing super admins.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           example:
 *             name: "Jane Smith"
 *             email: "jane@example.com"
 *             role: "USER"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Created"
 *               data:
 *                 id: 42
 *                 email: "jane@example.com"
 *                 name: "Jane Smith"
 *                 role: "USER"
 *                 needs_password_change: true
 *                 created_at: "2023-12-01T10:30:00Z"
 *                 updated_at: "2023-12-01T10:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

function computeIsAdmin(role: string | undefined) {
  return role === APP_ROLE.ADMIN || role === APP_ROLE.SUPER_ADMIN;
}

async function getHandler(req: NextRequest) {
  // Require admin
  const me = await getUserFromRequest(req);
  // Simple role assignment for basic setup
  let myRole = "user";
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes((me.email || "").toLowerCase())) myRole = APP_ROLE.SUPER_ADMIN;
  if (!computeIsAdmin(myRole)) return createResponse(null, "Forbidden", 403);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "20")));
  const q = (searchParams.get("q") || "").trim();

  try {
    const result = await userApp.getUsersForAdmin(page, pageSize, q, me.id!);
    return createResponse(result, "OK");
  } catch (error: any) {
    return createResponse(null, error.message || "Failed to get users", error.status || 500);
  }
}

async function postHandler(req: NextRequest) {
  // Require admin
  const me = await getUserFromRequest(req);
  // Simple role assignment for basic setup
  let myRole = "user";
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes((me.email || "").toLowerCase())) myRole = APP_ROLE.SUPER_ADMIN;
  if (!computeIsAdmin(myRole)) return createResponse(null, "Forbidden", 403);

  const body = await req.json().catch(() => ({}));
  const name = String((body as any)?.name || "").trim();
  const email = String((body as any)?.email || "").trim();
  const role = String((body as any)?.role || APP_ROLE.USER).trim();

  if (role === APP_ROLE.SUPER_ADMIN && myRole !== APP_ROLE.SUPER_ADMIN) {
    return createResponse(null, "Forbidden to assign super_admin role", 403);
  }

  try {
    const created = await userApp.createUserByAdmin(name, email, role);
    return createResponse(created, "Created", 201);
  } catch (error: any) {
    return createResponse(null, error.message || "Failed to create user", error.status || 500);
  }
}

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
