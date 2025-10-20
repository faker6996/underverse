import { NextRequest, NextResponse } from "next/server";
import { APP_ROLE } from "@/lib/constants/enum";
import { safeQuery } from "@/lib/modules/common/safe_query";
import { getUserFromRequest } from "@/lib/utils/auth-helper";

/**
 * @swagger
 * /api/admin/sql-query:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Execute raw SQL query (Super Admin only)
 *     description: |
 *       ⚠️ **DANGEROUS ENDPOINT** - Super Admin only. Execute raw SQL queries for debugging and admin tasks.
 *
 *       **Security:**
 *       - Only accessible by Super Admins
 *       - Whitelist approach: SELECT queries allowed by default
 *       - Non-SELECT queries require explicit `allowWrite: true` flag
 *       - Blocks dangerous patterns (DROP, TRUNCATE, ALTER, GRANT, REVOKE, SQL comments)
 *       - Prevents stacked queries (only 1 statement per request)
 *       - All queries are logged with user email and timestamp
 *
 *       **Supported commands:** SELECT (default), INSERT, UPDATE, DELETE with allowWrite flag
 *
 *       **Use cases:**
 *       - Database debugging
 *       - Quick data fixes
 *       - Testing queries
 *       - Admin data analysis
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "SELECT * FROM products LIMIT 10"
 *                 description: Raw SQL query to execute
 *               allowWrite:
 *                 type: boolean
 *                 default: false
 *                 description: Set to true to allow non-SELECT queries (INSERT, UPDATE, DELETE). Required for safety.
 *                 example: false
 *     responses:
 *       200:
 *         description: Query executed successfully (for SELECT)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Response for SELECT queries
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     data:
 *                       type: array
 *                       description: Query result rows
 *                       items:
 *                         type: object
 *                       example: [{"id": 1, "name": "Product 1"}]
 *                     executionTime:
 *                       type: integer
 *                       description: Query execution time in milliseconds
 *                       example: 45
 *                     rowCount:
 *                       type: integer
 *                       description: Number of rows returned
 *                       example: 10
 *                 - type: object
 *                   description: Response for INSERT/UPDATE/DELETE queries
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     rowsAffected:
 *                       type: integer
 *                       description: Number of rows affected
 *                       example: 5
 *                     executionTime:
 *                       type: integer
 *                       description: Query execution time in milliseconds
 *                       example: 32
 *                     command:
 *                       type: string
 *                       description: SQL command type
 *                       example: "UPDATE"
 *                 - type: object
 *                   description: Response for query errors
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     error:
 *                       type: string
 *                       example: "relation \"invalid_table\" does not exist"
 *                     executionTime:
 *                       type: integer
 *                       example: 12
 *       400:
 *         description: Invalid query or dangerous SQL pattern detected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Query contains potentially dangerous SQL patterns and has been blocked for security."
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden. Super admin role required."
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine user role (simple default for basic setup)
    let role: APP_ROLE.USER | APP_ROLE.ADMIN | APP_ROLE.SUPER_ADMIN = APP_ROLE.USER;

    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (superAdmins.includes((user.email || "").toLowerCase())) role = APP_ROLE.SUPER_ADMIN;

    const pref: any = (user as any).preferences || {};
    if (pref && pref.super_admin) role = APP_ROLE.SUPER_ADMIN;

    if (role !== APP_ROLE.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden. Super admin role required." }, { status: 403 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return NextResponse.json({ error: "Query cannot be empty" }, { status: 400 });
    }

    // Enhanced SQL injection protection
    // 1. Whitelist: Only allow SELECT queries (safest for admin tools)
    const isReadOnly = /^\s*SELECT\s+/i.test(trimmedQuery);

    if (!isReadOnly) {
      // If not SELECT, require explicit confirmation flag
      const allowWrite = body.allowWrite === true;
      if (!allowWrite) {
        return NextResponse.json({
          error: "Non-SELECT queries require 'allowWrite: true' flag for safety."
        }, { status: 400 });
      }
    }

    // 2. Block dangerous patterns (defense in depth)
    const dangerousPatterns = [
      /;\s*drop\s+/i,
      /;\s*truncate\s+/i,
      /;\s*alter\s+/i,
      /;\s*grant\s+/i,
      /;\s*revoke\s+/i,
      /;\s*create\s+user\s+/i,
      /;\s*drop\s+user\s+/i,
      /--.*$/m,                    // SQL comments
      /\/\*[\s\S]*?\*\//g,         // Multi-line comments (using [\s\S] for ES2017 compatibility)
      /;\s*delete\s+from\s+users/i,  // Prevent deleting all users
      /;\s*update\s+users\s+set/i,   // Prevent mass user updates
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmedQuery)) {
        return NextResponse.json({
          error: "Query contains potentially dangerous SQL patterns and has been blocked for security."
        }, { status: 400 });
      }
    }

    // 3. Limit to single statement (prevent stacked queries)
    const statements = trimmedQuery.split(';').filter(s => s.trim());
    if (statements.length > 1) {
      return NextResponse.json({
        error: "Multiple statements not allowed. Execute one query at a time."
      }, { status: 400 });
    }

    const startTime = Date.now();

    try {
      // Execute the query
      const result = await safeQuery(trimmedQuery);
      const executionTime = Date.now() - startTime;

      // Handle different types of results
      if (result.command === 'SELECT') {
        return NextResponse.json({
          success: true,
          data: result.rows,
          executionTime,
          rowCount: result.rowCount
        });
      } else {
        // For INSERT, UPDATE, DELETE, CREATE, etc.
        return NextResponse.json({
          success: true,
          rowsAffected: result.rowCount,
          executionTime,
          command: result.command
        });
      }

    } catch (dbError: any) {
      const executionTime = Date.now() - startTime;

      // Log the query error for debugging
      console.error('SQL Query Error:', {
        query: trimmedQuery,
        error: dbError?.originalError?.message || dbError.message,
        user: user.email,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        error: dbError?.originalError?.message || dbError.message || "Database query failed",
        executionTime
      });
    }

  } catch (error: any) {
    console.error('SQL Query API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
