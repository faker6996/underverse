import { User } from "@/lib/models/user";
import { redis, rk, REDIS_KEY_PREFIX } from "@/lib/utils/redis";

const ONE_DAY = 60 * 60 * 24; // TTL 24h

export async function cacheUser(user: User) {
  try {
    await redis.set(rk(`user:${user.id}`), JSON.stringify(user), "EX", ONE_DAY);
  } catch (e) {
    // Redis optional: ignore caching errors
  }
}

export async function getCachedUser(id: number): Promise<User | null> {
  try {
    const raw = await redis.get(rk(`user:${id}`));
    return raw ? new User(JSON.parse(raw)) : null;
  } catch (e) {
    return null;
  }
}

export async function invalidateUser(id: number) {
  try {
    await redis.del(rk(`user:${id}`));
  } catch (e) {
    // ignore
  }
}

export async function cacheUserWithCustomTTL(user: User, ttlSeconds: number) {
  try {
    await redis.set(rk(`user:${user.id}`), JSON.stringify(user), "EX", ttlSeconds);
  } catch (e) {}
}

export async function getUserCacheTTL(id: number): Promise<number> {
  try {
    return await redis.ttl(rk(`user:${id}`));
  } catch (e) {
    return -2; // key not found / unavailable
  }
}

export async function refreshUserCache(user: User) {
  try {
    const exists = await redis.exists(rk(`user:${user.id}`));
    if (exists) {
      await cacheUser(user);
    }
  } catch (e) {}
}

export async function invalidateAllUserCaches() {
  try {
    const keys = await redis.keys(`${REDIS_KEY_PREFIX}user:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (e) {}
}
