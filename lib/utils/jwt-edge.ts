// Edge-compatible JWT utilities using jose instead of jsonwebtoken
import { jwtVerify, SignJWT } from 'jose';

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = process.env;

export interface JwtPayload {
  id: number;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Verify JWT token (Edge Runtime compatible)
 */
export async function verifyJwtEdge(token: string): Promise<JwtPayload> {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET env var');
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return payload as JwtPayload;
  } catch (err: any) {
    throw new Error(`Invalid or expired token: ${err.message}`);
  }
}

/**
 * Sign JWT token (Edge Runtime compatible)
 */
export async function signJwtEdge(payload: JwtPayload, expiresIn: string = '2h'): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET env var');
  }

  const secret = new TextEncoder().encode(JWT_SECRET);
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER || '')
    .setAudience(JWT_AUDIENCE || '')
    .setExpirationTime(expiresIn)
    .sign(secret);

  return jwt;
}
