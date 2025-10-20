import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { safeQuery } from "@/lib/modules/common/safe_query";

/**
 * @swagger
 * /api/notifications/sent:
 *   get:
 *     summary: List notifications I sent
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
async function getHandler(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me?.id) return createResponse(null, "Unauthorized", 401);
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')));
  const offset = (page - 1) * pageSize;
  await safeQuery(`CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, title TEXT, body TEXT, type VARCHAR(16), is_read BOOLEAN DEFAULT FALSE, metadata JSONB, created_by INTEGER, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`);
  const list = await safeQuery(`SELECT * FROM notifications WHERE created_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [me.id, pageSize, offset]);
  const count = await safeQuery(`SELECT COUNT(*)::int AS cnt FROM notifications WHERE created_by = $1`, [me.id]);
  return createResponse({ data: list.rows, total: count.rows[0]?.cnt || 0, page, pageSize });
}

export const GET = withApiHandler(getHandler);
