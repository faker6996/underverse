import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { Notification, User } from "@/lib/models";
import { safeQuery } from "@/lib/modules/common/safe_query";
import { sendEmail } from "@/lib/utils/email";
import { emitEvent } from "@/lib/utils/realtime";
import { APP_ROLE } from "@/lib/constants/enum";

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification to a user (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId: { type: integer }
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string, enum: [info, success, warning, error], default: info }
 *               email: { type: boolean, description: "Also send email" }
 *     responses:
 *       200: { description: Sent }
 *       400: { description: Missing userId or message }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
function computeIsAdmin(role: string | undefined) {
  return role === APP_ROLE.ADMIN || role === APP_ROLE.SUPER_ADMIN;
}

async function postHandler(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me?.id) return createResponse(null, "Unauthorized", 401);
  let myRole = "user";
  try {
    const r = "user";
    myRole = r;
  } catch {}
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes((me.email || "").toLowerCase())) myRole = APP_ROLE.SUPER_ADMIN;
  const pref: any = (me as any).preferences || {};
  if (pref && pref.super_admin) myRole = APP_ROLE.SUPER_ADMIN;
  if (!computeIsAdmin(myRole)) return createResponse(null, "Forbidden", 403);

  const body = await req.json().catch(() => ({}));
  const userId = Number((body as any)?.userId || 0);
  const title = String((body as any)?.title || "").trim();
  const message = String((body as any)?.message || "").trim();
  const type = String((body as any)?.type || "info").trim();
  const withEmail = Boolean((body as any)?.email);
  if (!userId || !message) return createResponse(null, "Missing userId or message", 400);

  // Ensure table exists
  await safeQuery(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT,
    body TEXT,
    type VARCHAR(16),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`);

  const batchId = randomUUID();
  const n = await baseRepo.insert<Notification>(
    new Notification({ user_id: userId, title, body: message, type, is_read: false, created_by: me.id!, metadata: { batch_id: batchId } as any })
  );

  // Socket emit to user's room
  try {
    await emitEvent("notification", `user:${userId}`, { id: n.id, title, body: message, type, created_at: new Date().toISOString() });
  } catch {}

  // Send email
  if (withEmail) {
    let emailSent = false;
    let emailAddr: string | undefined = undefined;
    let emailError: string | undefined = undefined;
    try {
      const u = await baseRepo.getById<User>(User as any, userId);
      if (u?.email) {
        emailAddr = u.email!;
        await sendEmail({ to: u.email!, subject: title || "Notification", html: `<p>${message}</p>` });
        emailSent = true;
      }
    } catch (e: any) {
      console.error("Email send failed:", e);
      emailError = e?.message || "send failed";
    } finally {
      try {
        await safeQuery(
          `UPDATE notifications SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('email_sent', $1, 'email_to', $2, 'email_error', $3) WHERE id = $4`,
          [emailSent, emailAddr || null, emailError || null, n.id]
        );
      } catch {}
    }
  }

  return createResponse(n, "Sent");
}

export const POST = withApiHandler(postHandler);
