import { NextRequest } from "next/server";
import { createResponse } from "@/lib/utils/response";
import { getUserFromRequest } from "@/lib/utils/auth-helper";
import { APP_ROLE } from "@/lib/constants/enum";
import dns from "dns";

function isAdminRole(role: string | undefined) {
  return role === APP_ROLE.ADMIN || role === APP_ROLE.SUPER_ADMIN;
}

async function ensureAdmin(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me) return { ok: false, status: 401, msg: "Unauthorized" } as const;
  // Simple role assignment for basic setup
  let myRole = "user";
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes((me.email || "").toLowerCase())) myRole = APP_ROLE.SUPER_ADMIN;
  if (!isAdminRole(myRole)) return { ok: false, status: 403, msg: "Forbidden" } as const;
  return { ok: true } as const;
}

async function hasMxOrA(domain: string, timeoutMs = 2000): Promise<boolean> {
  const p = dns.promises;
  const withTimeout = async <T>(op: Promise<T>): Promise<T | null> =>
    await Promise.race([
      op,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  try {
    const mx = await withTimeout(p.resolveMx(domain));
    if (Array.isArray(mx) && mx.length > 0) return true;
  } catch {}
  try {
    const a = await withTimeout(p.resolve4(domain));
    if (Array.isArray(a) && a.length > 0) return true;
  } catch {}
  try {
    const aaaa = await withTimeout(p.resolve6(domain));
    if (Array.isArray(aaaa) && aaaa.length > 0) return true;
  } catch {}
  return false;
}

/**
 * @swagger
 * /api/utils/verify-email:
 *   post:
 *     tags:
 *       - Utilities
 *     summary: Verify email address
 *     description: Verify if an email address has valid DNS records (MX, A, or AAAA). Admin only. Useful for checking if email domain exists before sending emails.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: Email address to verify
 *     responses:
 *       200:
 *         description: Email verification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *                       description: Whether the email domain has valid DNS records
 *                 message:
 *                   type: string
 *                   example: "OK"
 *       400:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid email"
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error during verification
 */
export async function POST(req: NextRequest) {
  const gate = await ensureAdmin(req);
  if (!gate.ok) return createResponse({ exists: false }, gate.msg, gate.status, false);

  const body = await req.json().catch(() => ({} as any));
  const email = String(body?.email || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return createResponse({ exists: false }, "Invalid email", 400, false);
  }

  const domain = email.split("@")[1];
  try {
    const exists = await hasMxOrA(domain);
    return createResponse({ exists }, exists ? "OK" : "Domain has no MX/A records", 200, true);
  } catch (e: any) {
    return createResponse({ exists: false }, e?.message || "Verification failed", 200, true);
  }
}

export async function GET() {
  return createResponse({ exists: false }, "Method not allowed", 405, false);
}

