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
 * /api/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to multiple users (Admin only)
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
 *             required: [message]
 *             properties:
 *               all: { type: boolean, description: "Send to all active users (excluding sender)" }
 *               roles: { type: array, items: { type: string, enum: [admin, super_admin] } }
 *               userIds: { type: array, items: { type: integer } }
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string, enum: [info, success, warning, error], default: info }
 *               email: { type: boolean, description: "Also send email" }
 *     responses:
 *       200: { description: Sent count returned }
 *       400: { description: No targets or missing message }
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
  const all = Boolean((body as any)?.all);
  const roles = Array.isArray((body as any)?.roles) ? ((body as any)?.roles as string[]) : [];
  const userIdsBody = Array.isArray((body as any)?.userIds) ? (body as any)?.userIds : [];
  const title = String((body as any)?.title || "").trim();
  const message = String((body as any)?.message || "").trim();
  const type = String((body as any)?.type || "info").trim();
  const withEmail = Boolean((body as any)?.email);
  if (!message) return createResponse(null, "Missing message", 400);

  // Targets
  let targets: number[] = [];
  if (all) {
    const rows = await safeQuery(`SELECT id FROM users WHERE is_active IS DISTINCT FROM FALSE AND id != $1`, [me.id]);
    targets = rows.rows.map((r: any) => Number(r.id)).filter(Boolean);
  } else {
    targets = userIdsBody.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n) && n > 0);
    // Role-based targets (admin, super_admin)
    if (roles && roles.length) {
      if (roles.includes(APP_ROLE.ADMIN)) {
        const r = await safeQuery(
          `SELECT DISTINCT user_id FROM user_roles WHERE role = 'admin' AND (expires_at IS NULL OR expires_at > NOW()) AND user_id != $1`,
          [me.id]
        );
        targets = [...targets, ...r.rows.map((x: any) => Number(x.user_id)).filter(Boolean)];
      }
      if (roles.includes(APP_ROLE.SUPER_ADMIN)) {
        const emails = (process.env.SUPER_ADMIN_EMAILS || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (emails.length) {
          const r = await safeQuery(`SELECT id FROM users WHERE LOWER(email) = ANY($1::text[]) AND id != $2`, [emails, me.id]);
          targets = [...targets, ...r.rows.map((x: any) => Number(x.id)).filter(Boolean)];
        }
        const r2 = await safeQuery(`SELECT id FROM users WHERE (preferences->>APP_ROLE.SUPER_ADMIN)::boolean IS TRUE AND id != $1`, [me.id]);
        targets = [...targets, ...r2.rows.map((x: any) => Number(x.id)).filter(Boolean)];
      }
      // Deduplicate and ensure sender is not included
      targets = Array.from(new Set(targets)).filter((id) => id !== me.id);
    }

    // Always exclude the sender from targets
    targets = targets.filter((id) => id !== me.id);
  }
  if (!targets.length) return createResponse(null, "No targets (excluding sender)", 400);

  // Table is created by setup script; keep runtime safety just in case
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

  // Prepare a batch id to group this send operation
  const batchId = randomUUID();

  // Send
  for (const uid of targets) {
    const n = await baseRepo.insert<Notification>(
      new Notification({ user_id: uid, title, body: message, type, is_read: false, created_by: me.id!, metadata: { batch_id: batchId } as any })
    );
    try {
      await emitEvent("notification", `user:${uid}`, { id: n.id, title, body: message, type, created_at: new Date().toISOString() });
    } catch {}
    if (withEmail) {
      let emailSent = false;
      let emailAddr: string | undefined = undefined;
      let emailError: string | undefined = undefined;
      try {
        const u = await baseRepo.getById<User>(User as any, uid);
        if (u?.email) {
          emailAddr = u.email!;
          await sendEmail({ to: u.email!, subject: title || "Notification", html: `<p>${message}</p>` });
          emailSent = true;
        }
      } catch (e: any) {
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
  }

  return createResponse({ sent: targets.length }, "Sent");
}

export const POST = withApiHandler(postHandler);
