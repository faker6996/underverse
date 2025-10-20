import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/utils/response';

interface RateLimitEntry {
  count: number;
  lastReset: number;
  blockedUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number; // Thời gian block sau khi vượt giới hạn
}

// Maps để lưu trữ rate limit data
const ipRateLimit = new Map<string, RateLimitEntry>();
const emailRateLimit = new Map<string, RateLimitEntry>();

// Configs cho các loại rate limit khác nhau
const CONFIGS = {
  LOGIN: {
    windowMs: 60 * 1000, // 1 phút
    maxRequests: 5, // 5 attempts per minute
    blockDurationMs: 15 * 60 * 1000, // Block 15 phút sau khi vượt quá
  },
  REGISTER: {
    windowMs: 60 * 1000, // 1 phút
    maxRequests: 3, // 3 registrations per minute
  },
  PASSWORD_RESET: {
    windowMs: 15 * 60 * 1000, // 15 phút
    maxRequests: 3, // 3 attempts per 15 minutes per email
    blockDurationMs: 60 * 60 * 1000, // Block 1 giờ
  },
} as const;

function cleanupExpiredEntries(map: Map<string, RateLimitEntry>) {
  const now = Date.now();
  for (const [key, entry] of map.entries()) {
    // Xóa entries cũ hơn 24 giờ
    if (now - entry.lastReset > 24 * 60 * 60 * 1000) {
      map.delete(key);
    }
  }
}

function checkRateLimit(
  identifier: string, 
  map: Map<string, RateLimitEntry>, 
  config: RateLimitConfig
): { allowed: boolean; resetTime?: number; blockedUntil?: number } {
  const now = Date.now();
  const entry = map.get(identifier) || { count: 0, lastReset: now };

  // Kiểm tra xem có đang bị block không
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { 
      allowed: false, 
      blockedUntil: entry.blockedUntil 
    };
  }

  // Reset window nếu đã qua thời gian
  if (now - entry.lastReset > config.windowMs) {
    entry.count = 0;
    entry.lastReset = now;
    entry.blockedUntil = undefined;
  }

  entry.count += 1;
  
  // Nếu vượt giới hạn
  if (entry.count > config.maxRequests) {
    if (config.blockDurationMs) {
      entry.blockedUntil = now + config.blockDurationMs;
    }
    map.set(identifier, entry);
    return { 
      allowed: false, 
      resetTime: entry.lastReset + config.windowMs,
      blockedUntil: entry.blockedUntil
    };
  }

  map.set(identifier, entry);
  return { allowed: true };
}

export function createAuthRateLimit(type: keyof typeof CONFIGS) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Cleanup expired entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupExpiredEntries(ipRateLimit);
      cleanupExpiredEntries(emailRateLimit);
    }

    const config = CONFIGS[type];
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               (req as any).ip || 
               'unknown';

    // Check IP-based rate limit
    const ipResult = checkRateLimit(ip, ipRateLimit, config);
    
    if (!ipResult.allowed) {
      const message = ipResult.blockedUntil 
        ? `IP blocked until ${new Date(ipResult.blockedUntil).toISOString()}`
        : `Too many ${type.toLowerCase()} attempts from this IP. Try again later.`;
        
      return createErrorResponse(message, 429);
    }

    // For password reset, also check email-based rate limit
    if (type === 'PASSWORD_RESET') {
      try {
        const body = await req.clone().json();
        const email = body?.email;
        
        if (email) {
          const emailResult = checkRateLimit(email, emailRateLimit, config);
          if (!emailResult.allowed) {
            const message = emailResult.blockedUntil
              ? `Email blocked until ${new Date(emailResult.blockedUntil).toISOString()}`
              : `Too many password reset attempts for this email. Try again later.`;
              
            return createErrorResponse(message, 429);
          }
        }
      } catch {
        // If can't parse body, continue with IP-only rate limiting
      }
    }

    return null; // Allow request to continue
  };
}

// Export specific rate limiters
export const loginRateLimit = createAuthRateLimit('LOGIN');
export const registerRateLimit = createAuthRateLimit('REGISTER');
export const passwordResetRateLimit = createAuthRateLimit('PASSWORD_RESET');

// Helper function để áp dụng rate limit trong API routes
export async function applyRateLimit(
  req: NextRequest, 
  rateLimitFn: (req: NextRequest) => Promise<NextResponse | null>
): Promise<void> {
  const result = await rateLimitFn(req);
  if (result) {
    throw new Error(`Rate limit exceeded: ${await result.text()}`);
  }
}