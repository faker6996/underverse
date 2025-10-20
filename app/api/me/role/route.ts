import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";

/**
 * @swagger
 * /api/me/role:
 *   get:
 *     summary: Get current user's role
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         role: { type: string, example: "user" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getHandler(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user?.id) return createResponse(null, "Unauthorized", 401);
  const role = "user"; // Default role for basic setup
  return createResponse({ role }, "OK");
}

export const GET = withApiHandler(getHandler);
