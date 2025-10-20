import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { safeQuery } from "@/lib/modules/common/safe_query";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: List my notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200:
 *         description: List notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   patch:
 *     summary: Update notifications (mark read, clear, mark single)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties: { action: { type: string, enum: [mark_all_read] } }
 *               - type: object
 *                 properties: { action: { type: string, enum: [clear_all] } }
 *               - type: object
 *                 properties:
 *                   action: { type: string, enum: [mark_single_read] }
 *                   id: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Bad Request }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
async function ensureSchema() {
  // Run the optimized migration
  await safeQuery(`
    -- Ensure notifications table exists with all required columns
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT,
      body TEXT,
      type VARCHAR(16) DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{}',
      created_by INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure optimized indexes exist
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread_count ON notifications(user_id) WHERE is_read = FALSE;

    -- Clean up data
    UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;
    UPDATE notifications SET metadata = '{}' WHERE metadata IS NULL;
  `);
}

async function getHandler(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me?.id) return createResponse(null, "Unauthorized", 401);
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')));
  const offset = (page - 1) * pageSize;
  const list = await safeQuery(`SELECT * FROM notifications WHERE user_id = $1 AND (created_by IS NULL OR created_by != $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [me.id, pageSize, offset]);
  const count = await safeQuery(`SELECT COUNT(*)::int AS cnt, SUM(CASE WHEN is_read THEN 0 ELSE 1 END)::int AS unread FROM notifications WHERE user_id = $1 AND (created_by IS NULL OR created_by != $1)`, [me.id]);
  return createResponse({ data: list.rows, total: count.rows[0]?.cnt || 0, unread: count.rows[0]?.unread || 0, page, pageSize });
}

async function patchHandler(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me?.id) return createResponse(null, "Unauthorized", 401);
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const action = String((body as any)?.action || 'mark_all_read');
  
  if (action === 'mark_all_read') {
    await safeQuery(`UPDATE notifications SET is_read = TRUE, updated_at = NOW() WHERE user_id = $1 AND is_read = FALSE`, [me.id]);
    return createResponse({ ok: true }, 'Updated');
  } else if (action === 'clear_all') {
    await safeQuery(`DELETE FROM notifications WHERE user_id = $1`, [me.id]);
    return createResponse({ ok: true }, 'Cleared');
  } else if (action === 'mark_single_read') {
    const notificationId = Number((body as any)?.id);
    if (!notificationId || !Number.isFinite(notificationId)) {
      return createResponse(null, 'Missing or invalid notification ID', 400);
    }
    
    // Update single notification and verify it belongs to the user
    const result = await safeQuery(
      `UPDATE notifications SET is_read = TRUE, updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 AND is_read = FALSE`,
      [notificationId, me.id]
    );
    
    return createResponse({ 
      ok: true, 
      updated: result.rowCount || 0 
    }, (result.rowCount || 0) > 0 ? 'Updated' : 'No changes');
  }
  
  return createResponse(null, 'Bad Request', 400);
}

export const GET = withApiHandler(getHandler);
export const PATCH = withApiHandler(patchHandler);
