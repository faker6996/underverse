import { NextRequest, NextResponse } from 'next/server';

export async function withCors(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const origin = req.headers.get('origin') || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowAll = allowed.includes('*');
  const isAllowed = allowAll || allowed.includes(origin);

  if (isAllowed && origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (allowAll) {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }

  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight for API routes (middleware runs for /api requests too)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  return res;
}
