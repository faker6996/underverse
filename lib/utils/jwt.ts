// lib/utils/jwt.ts
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { randomBytes } from "crypto";

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = process.env;

export interface JwtPayload {
  id: number;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function signJwt(payload: JwtPayload, expiresIn: string = "2h"): string {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET env var");
  }

  const secret: Secret = JWT_SECRET;

  const options = {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn,
    jwtid: payload.sub,
  } as jwt.SignOptions;

  return jwt.sign(payload, secret, options);
}

export function verifyJwt(token: string): JwtPayload {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET env var");
  }

  try {
    return jwt.verify(token, JWT_SECRET as Secret, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JwtPayload;
  } catch (err: any) {
    throw new Error(`Invalid or expired token: ${err.message}`);
  }
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export function createTokenPair(payload: JwtPayload, rememberMe: boolean = false): TokenPair {
  // Access token: 2 hours
  const accessToken = signJwt(payload, "2h");
  
  // Generate refresh token
  const refreshToken = generateRefreshToken();
  
  return {
    accessToken,
    refreshToken
  };
}
