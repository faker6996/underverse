import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the application and its services including database connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: ['up', 'down', 'unknown']
 *                       example: 'up'
 *             example:
 *               ok: true
 *               services:
 *                 database: 'up'
 *       500:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: 'down'
 *                 error:
 *                   type: string
 *                   example: 'DB connection failed'
 *             example:
 *               ok: false
 *               services:
 *                 database: 'down'
 *               error: 'Connection timeout'
 */
export async function GET(_req: NextRequest) {
  const status: any = { ok: true, services: {} };
  try {
    const res = await query("SELECT 1");
    status.services.database = res?.rows ? "up" : "unknown";
  } catch (e: any) {
    status.ok = false;
    status.services.database = "down";
    status.error = e?.message || "DB error";
  }

  return NextResponse.json(status, { status: status.ok ? 200 : 500 });
}
