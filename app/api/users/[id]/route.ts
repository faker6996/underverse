import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { APP_ROLE } from "@/lib/constants/enum";
import { userApp } from "@/lib/modules/user/applications/user_app";

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid id
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Update user (role/status/profile) (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: ["admin","user","super_admin"] }
 *               isDeleted: { type: boolean }
 *               is_active: { type: boolean }
 *               name: { type: string }
 *               email: { type: string }
 *               phone_number: { type: string }
 *               address: { type: string }
 *               citizen_id: { type: string }
 *               new_password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Internal server error
 */
function computeIsAdmin(role: string | undefined) {
  return role === APP_ROLE.ADMIN || role === APP_ROLE.SUPER_ADMIN;
}

async function getHandler(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req);
  // Simple role assignment for basic setup
  let myRole = "user";
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes((me.email || "").toLowerCase())) myRole = APP_ROLE.SUPER_ADMIN;
  if (!computeIsAdmin(myRole)) return createResponse(null, "Forbidden", 403);

  const { id: idParam } = await ctx.params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) return createResponse(null, "Invalid id", 400);

  try {
    const user = await userApp.getUserWithRole(id);
    return createResponse(user, "OK");
  } catch (error: any) {
    return createResponse(null, error.message || "User not found", error.status || 404);
  }
}

async function patchHandler(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req);
  // Simple role assignment for basic setup
  let myRole = "user";
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes((me.email || "").toLowerCase())) myRole = APP_ROLE.SUPER_ADMIN;

  if (!computeIsAdmin(myRole)) return createResponse(null, "Forbidden", 403);

  const { id: idParam } = await ctx.params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) return createResponse(null, "Invalid id", 400);

  const body = await req.json().catch(() => ({}));
  const role = (body as any)?.role as string | undefined;
  const isDeleted = (body as any)?.isDeleted as boolean | undefined;
  const isActive = (body as any)?.is_active as boolean | undefined;

  try {
    // Update role
    if (typeof role === "string") {
      await userApp.assignUserRole(id, role);
    }

    // Toggle delete → map to is_active
    if (typeof isDeleted === "boolean") {
      await userApp.toggleUserDelete(id, isDeleted);
    }

    // Update is_active directly when provided
    if (typeof isActive === "boolean") {
      await userApp.updateUserStatus(id, isActive);
    }

    // Update other profile fields
    const profileFields = [
      'name', 'email', 'phone_number', 'address', 'citizen_id', 'new_password'
    ];
    const hasProfileUpdate = profileFields.some(field => field in body);

    if (hasProfileUpdate) {
      await userApp.updateUserProfile(id, body);
    }

    const updatedUser = await userApp.getUserWithRole(id);
    return createResponse(updatedUser, "Updated");
  } catch (error: any) {
    return createResponse(null, error.message || "Failed to update user", error.status || 500);
  }
}

export const GET = withApiHandler(getHandler);
export const PATCH = withApiHandler(patchHandler);
