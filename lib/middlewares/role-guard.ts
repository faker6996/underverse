import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtEdge } from '@/lib/utils/jwt-edge';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('RoleGuard');

export async function withRoleGuard(req: NextRequest, res: NextResponse, requiredRoles: string[]): Promise<NextResponse> {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      // No token - redirect to login to avoid /admin ↔ / home loops
      const segments = req.nextUrl.pathname.split('/').filter(Boolean);
      const locale = segments[0] || 'vi';
      const target = new URL(`/${locale}/login`, req.url);
      return NextResponse.redirect(target);
    }

    // Verify JWT and extract role (async for Edge Runtime)
    const payload = await verifyJwtEdge(accessToken);
    const role = payload.role as string;

    // Check if user has required role
    if (!role || !requiredRoles.includes(role)) {
      // Insufficient permissions - redirect to login for explicit auth
      const segments = req.nextUrl.pathname.split('/').filter(Boolean);
      const locale = segments[0] || 'vi';
      const target = new URL(`/${locale}/login`, req.url);
      return NextResponse.redirect(target);
    }

    // Role verified from JWT - allow access
    return res;
  } catch (error) {
    // JWT verification failed - redirect to login
    logger.error('JWT verification failed', error);
    const segments = req.nextUrl.pathname.split('/').filter(Boolean);
    const locale = segments[0] || 'vi';
    const target = new URL(`/${locale}/login`, req.url);
    return NextResponse.redirect(target);
  }
}
